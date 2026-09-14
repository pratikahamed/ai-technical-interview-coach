"use client";

import { useState, useCallback } from "react";
import { evaluateQuiz, getContextualErrorMessage } from "@/lib/api-client";
import { QuestionPublic, QuizResult, QuizSubmission } from "@/types";

interface UseQuizEngineProps {
  topicId: string;
  sessionId?: string | null;
  questions: QuestionPublic[];
  initialAnswers?: Record<string, number>;
  onComplete?: (result: QuizResult) => void;
}

export function useQuizEngine({
  topicId,
  sessionId,
  questions,
  initialAnswers = {},
  onComplete,
}: UseQuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex] || null;
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === questions.length - 1;

  const selectAnswer = useCallback((questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  }, []);

  const skipQuestion = useCallback((questionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: -1,
    }));
  }, []);

  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, questions.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const submitQuiz = useCallback(async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const submission: QuizSubmission = {
      topic_id: topicId,
      session_id: sessionId || null,
      answers,
    };

    try {
      const result = await evaluateQuiz(submission);
      if (onComplete) {
        onComplete(result);
      }
      return result;
    } catch (err: unknown) {
      const mapped = getContextualErrorMessage(err);
      setErrorMessage(mapped.message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [topicId, sessionId, answers, onComplete]);

  return {
    currentIndex,
    currentQuestion,
    totalQuestions: questions.length,
    answers,
    isFirstQuestion,
    isLastQuestion,
    isSubmitting,
    errorMessage,
    selectAnswer,
    skipQuestion,
    goToNext,
    goToPrevious,
    submitQuiz,
    clearError: () => setErrorMessage(null),
  };
}
