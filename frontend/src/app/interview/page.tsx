"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { TopicSelector } from "@/components/interview/TopicSelector";
import { QuizEngine } from "@/components/interview/QuizEngine";
import { evaluateQuiz, fetchTopics, generateQuiz } from "@/lib/api";
import { STORAGE_KEYS } from "@/lib/constants";
import { QuestionPublic, Topic } from "@/types/quiz";
import { Loader2 } from "lucide-react";

type InterviewView = "SELECT_TOPIC" | "ACTIVE_QUIZ";

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<InterviewView>("SELECT_TOPIC");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<QuestionPublic[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const [isInitializingQuiz, setIsInitializingQuiz] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 1. Fetch available topics on mount
  const loadTopics = useCallback(async () => {
    setLoadingTopics(true);
    setTopicsError(null);
    try {
      const data = await fetchTopics();
      setTopics(data);

      // Check if URL query param requested a track
      const trackParam = searchParams.get("track");
      if (trackParam && data.some((t) => t.id === trackParam)) {
        setSelectedTopicId(trackParam);
      }
    } catch (err) {
      setTopicsError(
        err instanceof Error ? err.message : "Failed to load topics."
      );
    } finally {
      setLoadingTopics(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  // 2. Restore active session from sessionStorage on reload (resilience)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedTopicJson = sessionStorage.getItem(STORAGE_KEYS.ACTIVE_TOPIC);
      const savedAnswersJson = sessionStorage.getItem(
        STORAGE_KEYS.ACTIVE_ANSWERS
      );

      if (savedTopicJson) {
        const parsedTopic: Topic = JSON.parse(savedTopicJson);
        const parsedAnswers: Record<string, number> = savedAnswersJson
          ? JSON.parse(savedAnswersJson)
          : {};

        // Fetch questions for this topic and restore active quiz view
        generateQuiz(parsedTopic.id)
          .then((qs) => {
            setActiveTopic(parsedTopic);
            setSelectedTopicId(parsedTopic.id);
            setQuestions(qs);
            setAnswers(parsedAnswers);
            setView("ACTIVE_QUIZ");
          })
          .catch(() => {
            // If failed to reload quiz questions, fallback to topic picker
            sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_TOPIC);
          });
      }
    } catch {
      // Ignore parse errors and let user select fresh
    }
  }, []);

  // Handle beginning interview
  const handleBeginInterview = async () => {
    if (!selectedTopicId) return;
    const topic = topics.find((t) => t.id === selectedTopicId);
    if (!topic) return;

    setIsInitializingQuiz(true);
    setSubmitError(null);

    try {
      const qs = await generateQuiz(topic.id);
      setQuestions(qs);
      setActiveTopic(topic);
      setAnswers({});

      // Save to sessionStorage
      sessionStorage.setItem(STORAGE_KEYS.ACTIVE_TOPIC, JSON.stringify(topic));
      sessionStorage.setItem(STORAGE_KEYS.ACTIVE_ANSWERS, JSON.stringify({}));

      setView("ACTIVE_QUIZ");
    } catch (err) {
      setTopicsError(
        err instanceof Error ? err.message : "Failed to generate interview questions."
      );
    } finally {
      setIsInitializingQuiz(false);
    }
  };

  // Handle option selection
  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    const updatedAnswers = { ...answers, [questionId]: optionIndex };
    setAnswers(updatedAnswers);

    // Synchronize to sessionStorage to survive page refreshes
    try {
      sessionStorage.setItem(
        STORAGE_KEYS.ACTIVE_ANSWERS,
        JSON.stringify(updatedAnswers)
      );
    } catch {
      // Storage quota safety
    }
  };

  // Handle quiz submission
  const handleSubmitQuiz = async () => {
    if (!activeTopic) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await evaluateQuiz({
        topic_id: activeTopic.id,
        answers,
      });

      // Store result and clear active quiz draft
      sessionStorage.setItem(
        STORAGE_KEYS.QUIZ_RESULT,
        JSON.stringify(result)
      );
      sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_TOPIC);
      sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_ANSWERS);

      router.push("/results");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Evaluation submission failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exit quiz back to topic selector
  const handleExitQuiz = () => {
    if (
      Object.keys(answers).length > 0 &&
      !window.confirm("Exit current interview? Your progress will be discarded.")
    ) {
      return;
    }

    sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_TOPIC);
    sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_ANSWERS);
    setActiveTopic(null);
    setQuestions([]);
    setAnswers({});
    setView("SELECT_TOPIC");
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-lowest text-on-surface relative selection:bg-primary selection:text-on-primary">
      {/* Background ambient lighting and grid pattern */}
      <div className="pointer-events-none fixed inset-0 bg-grid-tech z-0 opacity-30" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-secondary/10 blur-[140px] rounded-full z-0" />

      <Header />

      <main className="relative z-10 w-full pt-20 flex-1">
        {isInitializingQuiz ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="font-mono text-xs text-on-surface-variant">
              Initializing question bank &amp; telemetry...
            </span>
          </div>
        ) : view === "SELECT_TOPIC" ? (
          <TopicSelector
            topics={topics}
            loading={loadingTopics}
            error={topicsError}
            selectedTopicId={selectedTopicId}
            onSelectTopic={setSelectedTopicId}
            onBegin={handleBeginInterview}
            onRetry={loadTopics}
          />
        ) : activeTopic ? (
          <QuizEngine
            topic={activeTopic}
            questions={questions}
            answers={answers}
            onSelectAnswer={handleSelectAnswer}
            onSubmitQuiz={handleSubmitQuiz}
            onExit={handleExitQuiz}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onClearSubmitError={() => setSubmitError(null)}
          />
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <InterviewContent />
    </Suspense>
  );
}
