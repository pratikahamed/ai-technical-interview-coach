import asyncio
import json
import time
import uuid
from typing import Dict, List, Optional, Tuple
import anyio
from groq import AsyncGroq, Groq
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.exceptions import (
    InvalidOptionIndexException,
    LLMGenerationFailedException,
    QuestionTopicMismatchException,
    SessionExpiredException,
    TopicNotFoundException,
)
from app.core.logging import logger
from app.models.schemas import (
    QuestionInternal,
    QuestionPublic,
    QuestionReview,
    QuizGenerateResponse,
    QuizResult,
    QuizSubmission,
    Topic,
)
from app.services.base import QuizService
from app.services.mock_quiz_service import MockQuizService


# Schema used for strict Pydantic parsing of the LLM JSON response
class RawLLMQuestion(BaseModel):
    id: str = Field(..., description="Unique question identifier")
    text: str = Field(..., description="Technical question statement")
    options: List[str] = Field(..., description="Exactly 4 answer choices")
    correct_option_index: int = Field(..., ge=0, le=3, description="Correct option index 0-3")
    explanation: str = Field(..., description="Architectural rationale and proof")


class RawLLMResponse(BaseModel):
    questions: List[RawLLMQuestion] = Field(..., min_length=3, max_length=3)


class LLMQuizService(QuizService):
    """Dynamic difficulty-aware question generator and evaluator using Groq."""

    # Note: In-memory session state is stored per-process with a 30-minute TTL.
    # In a multi-worker or multi-container production deployment, this should be
    # backed by Redis or an external state store.
    SESSION_TTL_SECONDS: int = 30 * 60

    TOPICS: List[Topic] = MockQuizService.TOPICS

    def __init__(self, client: Optional[object] = None):
        """Initialize LLM Quiz Service with optional custom client for test mocking."""
        self._client = client or Groq(
            api_key=settings.GROQ_API_KEY,
            timeout=settings.GROQ_REQUEST_TIMEOUT_SECONDS,
        )
        self._sessions: Dict[str, Tuple[float, List[QuestionInternal]]] = {}
        self._lock: Optional[asyncio.Lock] = None
        self._mock_fallback = MockQuizService()

    def _get_lock(self) -> asyncio.Lock:
        """Lazy-initialize asyncio.Lock within the active running event loop."""
        if self._lock is None:
            self._lock = asyncio.Lock()
        return self._lock

    def _evict_expired_sessions(self) -> None:
        """Lazy eviction of sessions older than 30 minutes."""
        now = time.time()
        expired_ids = [
            sid for sid, (ts, _) in self._sessions.items()
            if now - ts > self.SESSION_TTL_SECONDS
        ]
        for sid in expired_ids:
            del self._sessions[sid]
        if expired_ids:
            logger.debug(f"Evicted {len(expired_ids)} expired quiz sessions.")

    def get_topics(self) -> List[Topic]:
        """Retrieve available interview tracks."""
        return self.TOPICS

    def _build_system_prompt(self, topic_id: str, seniority: str, difficulty: str) -> str:
        """Construct calibrated prompt taking seniority tier and topic difficulty into account."""
        seniority_guidance = {
            "junior": (
                "JUNIOR LEVEL (0-2 years experience): Focus on language core syntax, basic data structures, "
                "algorithmic fundamentals, standard library primitives, and straightforward bug isolation."
            ),
            "mid": (
                "MID-LEVEL (3-5 years experience): Focus on engineering trade-offs, concurrency fundamentals, "
                "robust error handling, component design patterns, and realistic production integration scenarios."
            ),
            "senior": (
                "SENIOR / STAFF LEVEL (5+ years experience): Focus on distributed systems invariants, low-level "
                "performance & cache topologies, deep concurrency & race conditions, CAP theorem trade-offs, and fault tolerance."
            ),
        }.get(seniority, "MID-LEVEL: Focus on engineering trade-offs and robust component design.")

        difficulty_guidance = {
            "easy": "EASY COMPLEXITY: Clear, foundational conceptual challenge with unambiguous distinction between options.",
            "medium": "MEDIUM COMPLEXITY: Practical scenario requiring trade-off analysis under realistic constraints.",
            "hard": "HARD COMPLEXITY: Highly challenging scenario involving subtle edge cases, non-obvious failure modes, or micro-optimizations.",
        }.get(difficulty, "MEDIUM COMPLEXITY: Practical scenario requiring trade-off analysis.")

        topic_names = {
            "dsa": "Data Structures & Algorithms",
            "system-design": "Distributed System Design",
            "lld": "Low Level Design & Object-Oriented Principles",
            "java": "Core Java & JVM Internals",
            "spring": "Spring Framework & Enterprise Architecture",
        }
        topic_name = topic_names.get(topic_id, topic_id)

        return (
            f"You are a Principal Engineering Interviewer conducting a rigorous technical assessment.\n\n"
            f"Target Track: {topic_name} (ID: '{topic_id}')\n"
            f"Seniority Tier: {seniority_guidance}\n"
            f"Topic Difficulty: {difficulty_guidance}\n\n"
            f"CRITICAL GENERATION RULES:\n"
            f"1. Generate EXACTLY 3 technical multiple-choice questions matching the specified seniority and difficulty.\n"
            f"2. Each question MUST contain EXACTLY 4 plausible, high-quality answer options.\n"
            f"3. Do NOT make the correct answer conspicuously longer than distractors.\n"
            f"4. 'correct_option_index' must be the 0-based integer index (0, 1, 2, or 3) of the single correct option.\n"
            f"5. Provide a rigorous 'explanation' detailing the architectural rationale, invariant proof, or trade-off proof.\n"
            f"6. Return ONLY valid JSON matching this exact structure:\n"
            f'{{\n'
            f'  "questions": [\n'
            f'    {{\n'
            f'      "id": "{topic_id}-1",\n'
            f'      "text": "Question statement...",\n'
            f'      "options": ["Option A", "Option B", "Option C", "Option D"],\n'
            f'      "correct_option_index": 0,\n'
            f'      "explanation": "Technical proof..."\n'
            f'    }}\n'
            f'  ]\n'
            f'}}'
        )

    async def _call_groq_and_validate(self, topic_id: str, seniority: str, difficulty: str) -> List[QuestionInternal]:
        """Execute Groq completion with validation and single retry resilience without stalling event loop."""
        system_prompt = self._build_system_prompt(topic_id, seniority, difficulty)
        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": (
                    f"Generate 3 {difficulty} multiple-choice interview questions for a {seniority} engineer "
                    f"in {topic_id}."
                ),
            },
        ]

        for attempt in range(2):
            try:
                logger.info(
                    f"Invoking Groq model '{settings.GROQ_MODEL}' for topic '{topic_id}' "
                    f"[{seniority}/{difficulty}] (attempt {attempt + 1}/2)"
                )
                create_fn = self._client.chat.completions.create
                if asyncio.iscoroutinefunction(create_fn):
                    completion = await create_fn(
                        model=settings.GROQ_MODEL,
                        messages=messages,
                        temperature=0.3,
                        response_format={"type": "json_object"},
                        timeout=settings.GROQ_REQUEST_TIMEOUT_SECONDS,
                    )
                else:
                    completion = await anyio.to_thread.run_sync(
                        lambda: create_fn(
                            model=settings.GROQ_MODEL,
                            messages=messages,
                            temperature=0.3,
                            response_format={"type": "json_object"},
                            timeout=settings.GROQ_REQUEST_TIMEOUT_SECONDS,
                        )
                    )

                content = completion.choices[0].message.content
                if not content:
                    raise ValueError("Groq returned empty response content.")

                parsed_json = json.loads(content)
                raw_response = RawLLMResponse.model_validate(parsed_json)

                # Validate exactly 3 questions and 4 options per question
                if len(raw_response.questions) != 3:
                    raise ValueError(f"Expected 3 questions, got {len(raw_response.questions)}")

                internal_questions: List[QuestionInternal] = []
                for i, q in enumerate(raw_response.questions):
                    if len(q.options) != 4:
                        raise ValueError(f"Question {i + 1} does not have exactly 4 options.")
                    if not (0 <= q.correct_option_index <= 3):
                        raise ValueError(f"Question {i + 1} has invalid correct_option_index {q.correct_option_index}")

                    qid = f"{topic_id}-dyn-{uuid.uuid4().hex[:8]}"
                    internal_questions.append(
                        QuestionInternal(
                            id=qid,
                            topic_id=topic_id,
                            text=q.text,
                            options=q.options,
                            seniority=seniority,
                            difficulty=difficulty,
                            correct_option_index=q.correct_option_index,
                            explanation=q.explanation,
                        )
                    )

                logger.info(f"Successfully generated and validated 3 dynamic questions via Groq for '{topic_id}'.")
                return internal_questions

            except Exception as exc:
                logger.warning(
                    f"Groq generation attempt {attempt + 1}/2 failed for topic '{topic_id}': {exc}"
                )
                if attempt == 1:
                    logger.error(f"Groq generation exhausted 2 attempts for topic '{topic_id}'. Raising 502.")
                    raise LLMGenerationFailedException(
                        "Failed to generate interview questions via LLM engine. Please retry."
                    ) from exc

        raise LLMGenerationFailedException("Unexpected completion failure.")

    async def generate_quiz(
        self, topic_id: str, seniority: str = "mid", difficulty: str = "medium"
    ) -> QuizGenerateResponse:
        """Dynamically generate 3 interview questions and register session protected by asyncio.Lock."""
        valid_topic_ids = {t.id for t in self.TOPICS}
        if topic_id not in valid_topic_ids:
            logger.warning(f"Rejecting quiz generation for unknown topic_id: '{topic_id}'")
            raise TopicNotFoundException(topic_id)

        internal_questions = await self._call_groq_and_validate(topic_id, seniority, difficulty)

        # Generate unique session ID for evaluation correlation
        session_id = str(uuid.uuid4())
        async with self._get_lock():
            self._evict_expired_sessions()
            self._sessions[session_id] = (time.time(), internal_questions)

        # Mask answer secrets in public response
        public_questions = [
            QuestionPublic(
                id=q.id,
                topic_id=q.topic_id,
                text=q.text,
                options=q.options,
                seniority=seniority,
                difficulty=difficulty,
            )
            for q in internal_questions
        ]

        logger.info(
            f"Created quiz session '{session_id}' with {len(public_questions)} questions "
            f"for topic '{topic_id}' [{seniority}/{difficulty}]."
        )

        return QuizGenerateResponse(
            session_id=session_id,
            questions=public_questions,
            seniority=seniority,
            difficulty=difficulty,
        )

    async def evaluate_quiz(self, submission: QuizSubmission) -> QuizResult:
        """Evaluate submission against session questions or fallback to mock protected by asyncio.Lock."""
        session_id = submission.session_id
        topic_id = submission.topic_id

        # If no session_id provided, fallback gracefully to deterministic mock evaluation
        if not session_id:
            logger.info("No session_id present in submission. Delegating to MockQuizService.")
            return await self._mock_fallback.evaluate_quiz(submission)

        async with self._get_lock():
            self._evict_expired_sessions()

            if session_id not in self._sessions:
                logger.warning(f"Evaluation rejected: session '{session_id}' not found or expired.")
                raise SessionExpiredException(session_id)

            session_timestamp, session_questions = self._sessions[session_id]
            if time.time() - session_timestamp > self.SESSION_TTL_SECONDS:
                del self._sessions[session_id]
                logger.warning(f"Evaluation rejected: session '{session_id}' exceeded 30m TTL.")
                raise SessionExpiredException(session_id)

        questions_map = {q.id: q for q in session_questions}

        # Validate that all submitted answers correspond to this session's questions
        for q_id, selected_idx in submission.answers.items():
            if q_id not in questions_map:
                logger.warning(
                    f"Submission validation error: question '{q_id}' mismatch with session questions"
                )
                raise QuestionTopicMismatchException(q_id, topic_id)

            question = questions_map[q_id]
            # -1 represents a question skipped by candidate; otherwise validate bounds
            if selected_idx != -1 and (
                selected_idx < 0 or selected_idx >= len(question.options)
            ):
                logger.warning(
                    f"Submission validation error: invalid option {selected_idx} for question '{q_id}'"
                )
                raise InvalidOptionIndexException(
                    q_id, selected_idx, len(question.options)
                )

        # Grade each question in session (handles answered, partially answered, or all skipped)
        reviews: List[QuestionReview] = []
        score = 0
        total = len(session_questions)

        for question in session_questions:
            selected_option = submission.answers.get(question.id, -1)
            is_correct = (
                selected_option == question.correct_option_index
                if selected_option != -1
                else False
            )

            if is_correct:
                score += 1

            reviews.append(
                QuestionReview(
                    question_id=question.id,
                    text=question.text,
                    selected_option=selected_option,
                    correct_option=question.correct_option_index,
                    is_correct=is_correct,
                    explanation=question.explanation,
                )
            )

        percentage = round((score / total) * 100, 1) if total > 0 else 0.0
        logger.info(
            f"Evaluated LLM session '{session_id}' for topic '{topic_id}': score={score}/{total} ({percentage}%)"
        )

        return QuizResult(
            topic_id=topic_id,
            score=score,
            total=total,
            percentage=percentage,
            reviews=reviews,
        )
