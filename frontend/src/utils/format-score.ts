/**
 * Score formatting utilities eliminating floating-point display artifacts.
 */

export function formatPercentage(value: number): string {
  if (isNaN(value) || !isFinite(value)) {
    return "0%";
  }

  // Exact whole integers: 100%, 0%, 50%
  if (value % 1 === 0) {
    return `${Math.round(value)}%`;
  }

  // Rounded cleanly to 1 decimal place: 33.3%, 66.7%
  return `${Number(value.toFixed(1))}%`;
}

export function formatScoreRatio(score: number, total: number): string {
  return `${score} / ${total}`;
}

export function formatPassStatus(percentage: number, threshold: number = 70): {
  isPassing: boolean;
  label: string;
} {
  const isPassing = percentage >= threshold;
  return {
    isPassing,
    label: isPassing ? "PASSED CALIBRATION" : "REVISE INVARIANTS",
  };
}
