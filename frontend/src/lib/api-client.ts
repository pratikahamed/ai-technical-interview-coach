/**
 * Production REST client interfacing with the FastAPI backend.
 * Conforms strictly to ErrorDetail responses with defensive 15s AbortController timeouts.
 */

import {
  ErrorDetail,
  QuizGenerateResponse,
  QuizResult,
  QuizSubmission,
  Topic,
} from "@/types";

function sanitizeApiBaseUrl(url?: string): string {
  if (!url || !url.trim()) return "http://localhost:8000";
  let trimmed = url.trim().replace(/\/+$/, "");
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

export const API_BASE_URL = sanitizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL
);

export const REQUEST_TIMEOUT_MS = 15000;

export class ApiClientError extends Error {
  public code: string;
  public status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Fetch wrapper that attaches a strict AbortController timeout.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiClientError(
        "REQUEST_TIMEOUT",
        `Request exceeded ${timeoutMs / 1000}s timeout. The engine may be warming up.`,
        408
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let code = "UNKNOWN_ERROR";
  let message = `Request failed with status ${response.status}`;

  try {
    const errorBody = (await response.json()) as Partial<ErrorDetail>;
    if (errorBody.code) code = errorBody.code;
    if (errorBody.message) message = errorBody.message;
  } catch {
    if (response.statusText) {
      message = response.statusText;
    }
  }

  throw new ApiClientError(code, message, response.status);
}

/**
 * Map specific backend error codes directly to contextual UI copy and retry buttons.
 */
export function getContextualErrorMessage(error: unknown): {
  code: string;
  title: string;
  message: string;
  canRetry: boolean;
  actionText: string;
} {
  if (error instanceof ApiClientError) {
    switch (error.code) {
      case "SESSION_EXPIRED":
        return {
          code: "SESSION_EXPIRED",
          title: "Session Expired",
          message:
            "Your interview session has expired (30-minute inactivity limit). Please start a new interview session.",
          canRetry: false,
          actionText: "Start New Session",
        };
      case "LLM_GENERATION_FAILED":
        return {
          code: "LLM_GENERATION_FAILED",
          title: "AI Generation Stalled",
          message:
            "The AI interviewer was temporarily unable to calibrate questions. Please click retry to generate questions again.",
          canRetry: true,
          actionText: "Retry Generation",
        };
      case "TOPIC_NOT_FOUND":
        return {
          code: "TOPIC_NOT_FOUND",
          title: "Track Not Found",
          message:
            "The requested interview track is not recognized or has been updated. Please choose a valid engineering track.",
          canRetry: false,
          actionText: "Select Track",
        };
      case "REQUEST_TIMEOUT":
        return {
          code: "REQUEST_TIMEOUT",
          title: "Request Timed Out",
          message:
            "The interview server took more than 15s to respond. If running on a free instance, it may be waking up. Please retry.",
          canRetry: true,
          actionText: "Retry Request",
        };
      default:
        return {
          code: error.code,
          title: "Service Response",
          message: error.message || "An unexpected error occurred during the interview process.",
          canRetry: true,
          actionText: "Try Again",
        };
    }
  }

  return {
    code: "NETWORK_ERROR",
    title: "Connection Error",
    message:
      error instanceof Error
        ? error.message
        : "Unable to reach the interview service. Check your internet connection.",
    canRetry: true,
    actionText: "Retry",
  };
}

/**
 * Silent non-blocking health probe to wake up Render free-tier containers.
 */
export async function pingHealth(): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/health`,
      {
        method: "GET",
        cache: "no-store",
      },
      5000
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch all available mock interview tracks.
 */
export async function fetchTopics(): Promise<Topic[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/topics`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    return await handleResponse<Topic[]>(res);
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    throw new ApiClientError(
      "NETWORK_ERROR",
      "Unable to connect to the interview engine. The service may be booting up.",
      0
    );
  }
}

/**
 * Fetch public question bank for a chosen track calibrated to seniority and difficulty.
 */
export async function generateQuiz(
  topicId: string,
  seniority: string = "mid",
  difficulty: string = "medium"
): Promise<QuizGenerateResponse> {
  try {
    const queryParams = new URLSearchParams({
      topic_id: topicId,
      seniority,
      difficulty,
    });
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/api/v1/quiz/generate?${queryParams.toString()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );
    return await handleResponse<QuizGenerateResponse>(res);
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    throw new ApiClientError(
      "NETWORK_ERROR",
      "Failed to retrieve questions from server.",
      0
    );
  }
}

/**
 * Submit candidate answers for server-side grading and detailed rubric review.
 */
export async function evaluateQuiz(
  submission: QuizSubmission
): Promise<QuizResult> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/quiz/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
      cache: "no-store",
    });
    return await handleResponse<QuizResult>(res);
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    throw new ApiClientError(
      "NETWORK_ERROR",
      "Submission failed. Check your network connection and retry.",
      0
    );
  }
}
