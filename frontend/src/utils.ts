const PASS_RATE_LABELS = {
  "threshold-too-high": {
    label: "Threshold too high",
    color: "#f44336",
    emoji: "🔴",
  },
  "slightly-strict": {
    label: "Slightly strict",
    color: "#ff9800",
    emoji: "🟠",
  },
  healthy: {
    label: "Healthy",
    color: "#4caf50",
    emoji: "🟢",
  },
  "slightly-permissive": {
    label: "Slightly permissive",
    color: "#ffd600",
    emoji: "🟡",
  },
  "too-low-noisy": {
    label: "Too low",
    color: "#f44336",
    emoji: "🔴",
  },
};

export const getPassRateStyle = (passRate: number) => {
  if (passRate < 3) {
    return PASS_RATE_LABELS["threshold-too-high"];
  } else if (passRate < 8) {
    return PASS_RATE_LABELS["slightly-strict"];
  } else if (passRate < 20) {
    return PASS_RATE_LABELS["healthy"];
  } else if (passRate < 35) {
    return PASS_RATE_LABELS["slightly-permissive"];
  } else {
    return PASS_RATE_LABELS["too-low-noisy"];
  }
};
