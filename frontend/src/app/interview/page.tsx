"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { TopicSelector } from "@/components/modules/topic-selector";
import { QuestionCard } from "@/components/modules/question-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  evaluateQuiz,
  fetchTopics,
  generateQuiz,
  getContextualErrorMessage,
} from "@/lib/api-client";
import { safeStorage } from "@/hooks/use-session-storage";
import { Difficulty, QuestionPublic, Seniority, Topic } from "@/types";

const STORAGE_KEYS = {
  ACTIVE_TOPIC: "ai_interview_active_topic",
  ACTIVE_SENIORITY: "ai_interview_active_seniority",
  ACTIVE_DIFFICULTY: "ai_interview_active_difficulty",
  ACTIVE_SESSION_ID: "ai_interview_active_session_id",
  ACTIVE_ANSWERS: "ai_interview_active_answers",
  QUIZ_RESULT: "ai_interview_quiz_result",
};

type InterviewView = "SELECT_TOPIC" | "ACTIVE_QUIZ";

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<InterviewView>("SELECT_TOPIC");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedSeniority, setSelectedSeniority] = useState<Seniority | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<QuestionPublic[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const [isInitializingQuiz, setIsInitializingQuiz] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadTopics = useCallback(async () => {
    setLoadingTopics(true);
    setTopicsError(null);
    try {
      const data = await fetchTopics();
      setTopics(data);

      const trackParam = searchParams.get("track");
      if (trackParam && data.some((t) => t.id === trackParam)) {
        setSelectedTopicId(trackParam);
      }
    } catch (err) {
      const mapped = getContextualErrorMessage(err);
      setTopicsError(mapped.message);
    } finally {
      setLoadingTopics(false);
    }
  }, [searchParams]);

  // 1. Fetch topics on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTopics();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTopics]);

  // 2. Restore active session from safeStorage on reload (resilience)
  useEffect(() => {
    try {
      const savedTopic = safeStorage.getJSON<Topic>(STORAGE_KEYS.ACTIVE_TOPIC);
      const savedAnswers =
        safeStorage.getJSON<Record<string, number>>(STORAGE_KEYS.ACTIVE_ANSWERS) || {};
      const savedSeniority = safeStorage.getItem(
        STORAGE_KEYS.ACTIVE_SENIORITY
      ) as Seniority | null;
      const savedDifficulty = safeStorage.getItem(
        STORAGE_KEYS.ACTIVE_DIFFICULTY
      ) as Difficulty | null;
      const savedSessionId = safeStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION_ID);

      if (savedTopic) {
        generateQuiz(
          savedTopic.id,
          savedSeniority || "mid",
          savedDifficulty || "medium"
        )
          .then((res) => {
            setActiveTopic(savedTopic);
            setSelectedTopicId(savedTopic.id);
            setSelectedSeniority(savedSeniority || "mid");
            setSelectedDifficulty(savedDifficulty || "medium");
            setSessionId(res.session_id || savedSessionId || null);
            setQuestions(res.questions);
            setAnswers(savedAnswers);
            setView("ACTIVE_QUIZ");
          })
          .catch(() => {
            safeStorage.removeItem(STORAGE_KEYS.ACTIVE_TOPIC);
          });
      }
    } catch {
      // Ignore parse errors and let user select fresh
    }
  }, []);

  // Handle beginning interview
  const handleBeginInterview = async () => {
    if (!selectedTopicId || !selectedSeniority || !selectedDifficulty) {
      setValidationError(
        "Please select a Seniority Tier, Domain Track, and Difficulty Level to begin."
      );
      return;
    }
    const topic = topics.find((t) => t.id === selectedTopicId);
    if (!topic) return;

    setValidationError(null);
    setIsInitializingQuiz(true);
    setSubmitError(null);

    try {
      const res = await generateQuiz(topic.id, selectedSeniority, selectedDifficulty);
      setQuestions(res.questions);
      setCurrentQuestionIndex(0);
      setSessionId(res.session_id || null);
      setActiveTopic(topic);
      setAnswers({});

      safeStorage.setJSON(STORAGE_KEYS.ACTIVE_TOPIC, topic);
      safeStorage.setItem(STORAGE_KEYS.ACTIVE_SENIORITY, selectedSeniority);
      safeStorage.setItem(STORAGE_KEYS.ACTIVE_DIFFICULTY, selectedDifficulty);
      if (res.session_id) {
        safeStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_ID, res.session_id);
      }
      safeStorage.setJSON(STORAGE_KEYS.ACTIVE_ANSWERS, {});

      setView("ACTIVE_QUIZ");
    } catch (err) {
      const mapped = getContextualErrorMessage(err);
      setTopicsError(mapped.message);
    } finally {
      setIsInitializingQuiz(false);
    }
  };

  // Handle option selection
  const handleSelectOption = (optionIndex: number) => {
    const activeQ = questions[currentQuestionIndex];
    if (!activeQ) return;

    const updatedAnswers = { ...answers, [activeQ.id]: optionIndex };
    setAnswers(updatedAnswers);
    safeStorage.setJSON(STORAGE_KEYS.ACTIVE_ANSWERS, updatedAnswers);
  };

  // Handle skipping the question
  const handleSkipQuestion = () => {
    const activeQ = questions[currentQuestionIndex];
    if (!activeQ) return;

    const updatedAnswers = { ...answers, [activeQ.id]: -1 };
    setAnswers(updatedAnswers);
    safeStorage.setJSON(STORAGE_KEYS.ACTIVE_ANSWERS, updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Handle submitting the quiz
  const handleSubmitQuiz = async () => {
    if (!activeTopic) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await evaluateQuiz({
        topic_id: activeTopic.id,
        answers,
        session_id: sessionId,
      });

      safeStorage.setJSON(STORAGE_KEYS.QUIZ_RESULT, result);
      safeStorage.removeItem(STORAGE_KEYS.ACTIVE_TOPIC);
      safeStorage.removeItem(STORAGE_KEYS.ACTIVE_SENIORITY);
      safeStorage.removeItem(STORAGE_KEYS.ACTIVE_DIFFICULTY);
      safeStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
      safeStorage.removeItem(STORAGE_KEYS.ACTIVE_ANSWERS);

      router.push("/results");
    } catch (err) {
      const mapped = getContextualErrorMessage(err);
      setSubmitError(mapped.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exit quiz back to setup
  const handleExitQuiz = () => {
    if (
      Object.keys(answers).length > 0 &&
      !window.confirm("Exit current interview? Your progress will be discarded.")
    ) {
      return;
    }

    safeStorage.removeItem(STORAGE_KEYS.ACTIVE_TOPIC);
    safeStorage.removeItem(STORAGE_KEYS.ACTIVE_SENIORITY);
    safeStorage.removeItem(STORAGE_KEYS.ACTIVE_DIFFICULTY);
    safeStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
    safeStorage.removeItem(STORAGE_KEYS.ACTIVE_ANSWERS);

    setActiveTopic(null);
    setQuestions([]);
    setAnswers({});
    setSessionId(null);
    setCurrentQuestionIndex(0);
    setView("SELECT_TOPIC");
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#060709] text-slate-100 relative selection:bg-cyan-500/20 selection:text-cyan-200">
      <div className="pointer-events-none fixed inset-0 bg-grid-tech z-0 opacity-25" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-cyan-500/10 blur-[140px] rounded-full z-0" />

      <main
        className={`relative z-10 w-full flex-1 ${
          view === "ACTIVE_QUIZ" ? "pt-20 pb-28" : "pt-20"
        }`}
      >
        {isInitializingQuiz ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center specular-rim">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="font-mono text-xs uppercase tracking-widest text-cyan-400">
                AI Synthesis In Progress
              </p>
              <p className="text-sm text-slate-400">
                Calibrating 3 architectural scenarios for {selectedTopicId?.toUpperCase()}...
              </p>
            </div>
          </div>
        ) : view === "SELECT_TOPIC" ? (
          <TopicSelector
            topics={topics}
            loading={loadingTopics}
            error={topicsError}
            selectedTopicId={selectedTopicId}
            selectedSeniority={selectedSeniority}
            selectedDifficulty={selectedDifficulty}
            onSelectTopic={(id) => {
              setSelectedTopicId(id);
              setValidationError(null);
            }}
            onSelectSeniority={(lvl) => {
              setSelectedSeniority(lvl);
              setValidationError(null);
            }}
            onSelectDifficulty={(diff) => {
              setSelectedDifficulty(diff);
              setValidationError(null);
            }}
            onBegin={handleBeginInterview}
            onRetry={loadTopics}
            isInitializing={isInitializingQuiz}
            validationError={validationError}
          />
        ) : activeTopic && currentQuestion ? (
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
            {/* Quiz Top Telemetry Bar */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-outline">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExitQuiz}
                  className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-slate-400 hover:text-slate-200 border border-outline transition-colors cursor-pointer"
                  title="Exit Interview"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100 uppercase tracking-tight font-mono">
                      {activeTopic.name}
                    </span>
                    <Badge variant="primary" size="sm">
                      {selectedSeniority?.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {selectedDifficulty?.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Scenario {currentQuestionIndex + 1} of {questions.length} • {answeredCount} Answered
                  </p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="w-32 sm:w-48 space-y-1 text-right">
                <span className="font-mono text-xs text-slate-400">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                </span>
                <ProgressBar
                  current={currentQuestionIndex + 1}
                  total={questions.length}
                />
              </div>
            </div>

            {/* Submit Error Alert */}
            {submitError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Question Card */}
            <QuestionCard
              question={currentQuestion}
              questionIndex={currentQuestionIndex}
              selectedIndex={answers[currentQuestion.id]}
              onSelectOption={handleSelectOption}
            />

            {/* Navigation & Submission Dock */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={isFirstQuestion}
                  className="flex-1 sm:flex-none gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={handleSkipQuestion}
                  className="flex-1 sm:flex-none gap-1.5"
                >
                  <span>Skip Scenario</span>
                </Button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {!isLastQuestion ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(questions.length - 1, prev + 1)
                      )
                    }
                    className="w-full sm:w-auto gap-1.5"
                  >
                    <span>Next Scenario</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmitQuiz}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto gap-2 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating Assessment...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Submit Assessment</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060709] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      }
    >
      <InterviewContent />
    </Suspense>
  );
}
