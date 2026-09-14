/**
 * TypeScript definitions matching backend Pydantic schemas.
 */

export interface Topic {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface QuestionPublic {
  id: string;
  topic_id: string;
  text: string;
  options: string[];
}

export interface QuizSubmission {
  topic_id: string;
  answers: Record<string, number>;
}

export interface QuestionReview {
  question_id: string;
  text: string;
  selected_option: number;
  correct_option: number;
  is_correct: boolean;
  explanation: string;
}

export interface QuizResult {
  topic_id: string;
  score: number;
  total: number;
  percentage: number;
  reviews: QuestionReview[];
}

export interface ErrorDetail {
  code: string;
  message: string;
}
