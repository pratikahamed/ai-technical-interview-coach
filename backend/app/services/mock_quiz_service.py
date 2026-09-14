"""Concrete implementation of QuizService using a deterministic JSON question bank."""

import json
from pathlib import Path
from typing import Dict, List
from app.core.exceptions import (
    InvalidOptionIndexException,
    QuestionTopicMismatchException,
    TopicNotFoundException,
)
from app.core.logging import logger
from app.models.schemas import (
    QuestionInternal,
    QuestionPublic,
    QuestionReview,
    QuizResult,
    QuizSubmission,
    Topic,
)
from app.services.base import QuizService


class MockQuizService(QuizService):
    """Deterministic Phase 1 question bank and evaluation service."""

    TOPICS: List[Topic] = [
        Topic(
            id="dsa",
            name="Data Structures & Algorithms",
            icon="Code2",
            description="Asymptotic complexity, balanced trees, graph traversal, and dynamic programming invariants.",
        ),
        Topic(
            id="system-design",
            name="System Design",
            icon="Network",
            description="Distributed consensus, partition tolerance, caching topologies, and event-driven architectures.",
        ),
        Topic(
            id="lld",
            name="Low Level Design",
            icon="Layers",
            description="SOLID principles, concurrency patterns, creational/behavioral patterns, and domain modeling.",
        ),
        Topic(
            id="java",
            name="Core Java",
            icon="Coffee",
            description="JVM memory models, garbage collection tuning, concurrent primitives, and classloader semantics.",
        ),
        Topic(
            id="spring",
            name="Spring Framework",
            icon="Leaf",
            description="Spring Boot internals, IoC lifecycle, transaction propagation, and reactive pipelines.",
        ),
    ]

    def __init__(self, data_path: Path | None = None):
        """Initialize service and parse static questions bank."""
        if data_path is None:
            data_path = Path(__file__).parent.parent / "data" / "questions.json"
        self._data_path = data_path
        self._questions_by_topic: Dict[str, List[QuestionInternal]] = {}
        self._all_questions_by_id: Dict[str, QuestionInternal] = {}
        self._load_data()

    def _load_data(self) -> None:
        """Load JSON bank into structured internal representations."""
        logger.info(f"Loading deterministic question bank from {self._data_path}")
        with open(self._data_path, "r", encoding="utf-8") as file:
            raw_data: Dict[str, list] = json.load(file)

        for topic_id, questions_list in raw_data.items():
            parsed_questions = [
                QuestionInternal.model_validate(item) for item in questions_list
            ]
            self._questions_by_topic[topic_id] = parsed_questions
            for q in parsed_questions:
                self._all_questions_by_id[q.id] = q

        logger.info(
            f"Successfully loaded {len(self._all_questions_by_id)} questions across "
            f"{len(self._questions_by_topic)} topics."
        )

    def get_topics(self) -> List[Topic]:
        """Retrieve available interview tracks."""
        return self.TOPICS

    def generate_quiz(self, topic_id: str) -> List[QuestionPublic]:
        """Return public questions for a topic, stripping answers and explanations."""
        if topic_id not in self._questions_by_topic:
            logger.warning(f"Rejecting quiz generation for unknown topic_id: '{topic_id}'")
            raise TopicNotFoundException(topic_id)

        internal_questions = self._questions_by_topic[topic_id]
        # Return QuestionPublic models - explicitly omitting correct_option_index and explanation
        public_questions = [
            QuestionPublic(
                id=q.id,
                topic_id=q.topic_id,
                text=q.text,
                options=q.options,
            )
            for q in internal_questions
        ]
        logger.info(f"Generated {len(public_questions)} public questions for topic '{topic_id}'")
        return public_questions

    def evaluate_quiz(self, submission: QuizSubmission) -> QuizResult:
        """Evaluate submission against ground truth with strict validation."""
        topic_id = submission.topic_id
        if topic_id not in self._questions_by_topic:
            logger.warning(f"Submission evaluation failed: unknown topic '{topic_id}'")
            raise TopicNotFoundException(topic_id)

        topic_questions = self._questions_by_topic[topic_id]
        topic_questions_map = {q.id: q for q in topic_questions}

        # Validate that all submitted answers correspond to this topic
        for q_id, selected_idx in submission.answers.items():
            if q_id not in topic_questions_map:
                logger.warning(
                    f"Submission validation error: question '{q_id}' mismatch with topic '{topic_id}'"
                )
                raise QuestionTopicMismatchException(q_id, topic_id)

            question = topic_questions_map[q_id]
            if selected_idx < 0 or selected_idx >= len(question.options):
                logger.warning(
                    f"Submission validation error: invalid option {selected_idx} for question '{q_id}'"
                )
                raise InvalidOptionIndexException(
                    q_id, selected_idx, len(question.options)
                )

        # Grade each question
        reviews: List[QuestionReview] = []
        score = 0
        total = len(topic_questions)

        for question in topic_questions:
            selected_option = submission.answers.get(question.id, -1)
            is_correct = selected_option == question.correct_option_index

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
            f"Evaluated submission for topic '{topic_id}': score={score}/{total} ({percentage}%)"
        )

        return QuizResult(
            topic_id=topic_id,
            score=score,
            total=total,
            percentage=percentage,
            reviews=reviews,
        )
