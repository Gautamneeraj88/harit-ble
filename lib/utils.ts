export function getScoreColor(score: number): string {
  if (score >= 90) return '#00FF66'; // Good
  if (score >= 70) return '#FFB300'; // Warning
  return '#FF2A2A'; // Critical
}

export function getScoreGradient(score: number): string {
  if (score >= 90) return 'rgba(0, 255, 102, 0.15)';
  if (score >= 70) return 'rgba(255, 179, 0, 0.15)';
  return 'rgba(255, 42, 42, 0.15)';
}

export function formatTimestamp(date: Date | null): string {
  if (!date) return '--:--:--';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}
