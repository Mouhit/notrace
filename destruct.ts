/**
 * Calculate self-destruct time in milliseconds
 * Logic: 10s base + 10s per 25 words
 * Examples:
 * - 0-24 words: 10s
 * - 25-49 words: 20s
 * - 50-74 words: 30s
 */
export function calculateDestructTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  const baseTime = 10; // seconds
  const additionalTime = Math.ceil(words / 25) * 10; // seconds
  const totalSeconds = baseTime + additionalTime;
  
  return totalSeconds * 1000; // convert to milliseconds
}

/**
 * Format milliseconds to readable countdown format (MM:SS)
 */
export function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate remaining time until scheduled message is available
 */
export function calculateTimeUntilAvailable(scheduledFor: Date): number {
  const now = new Date();
  const diff = scheduledFor.getTime() - now.getTime();
  
  return Math.max(0, diff);
}

/**
 * Format time difference to readable format
 */
export function formatTimeDifference(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
