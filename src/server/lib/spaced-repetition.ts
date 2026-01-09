/**
 * Spaced Repetition Algorithm (SM-2)
 * Based on SuperMemo-2 algorithm
 *
 * Quality ratings:
 * 0 - Complete blackout
 * 1 - Incorrect response, but correct one remembered
 * 2 - Incorrect response, correct one seemed easy to recall
 * 3 - Correct response, but required significant difficulty
 * 4 - Correct response, after some hesitation
 * 5 - Perfect response
 */

export interface ReviewResult {
  easinessFactor: number
  interval: number
  repetitions: number
  nextReview: Date
}

export function calculateNextReview(
  quality: number,
  currentEF: number = 2.5,
  currentInterval: number = 0,
  currentRepetitions: number = 0
): ReviewResult {
  // Validate quality is between 0 and 5
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be between 0 and 5')
  }

  let easinessFactor = currentEF
  let interval = currentInterval
  let repetitions = currentRepetitions

  // Calculate new easiness factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easinessFactor = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  // Ensure EF doesn't go below 1.3
  if (easinessFactor < 1.3) {
    easinessFactor = 1.3
  }

  // If quality < 3, start repetitions from beginning
  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    // Quality >= 3: Successful review
    if (repetitions === 0) {
      interval = 1
      repetitions = 1
    } else if (repetitions === 1) {
      interval = 6
      repetitions = 2
    } else {
      interval = Math.round(currentInterval * easinessFactor)
      repetitions += 1
    }
  }

  // Calculate next review date
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return {
    easinessFactor,
    interval,
    repetitions,
    nextReview,
  }
}

/**
 * Determine if a card is due for review
 */
export function isDue(nextReview: Date): boolean {
  return new Date() >= nextReview
}

/**
 * Get quality rating description
 */
export function getQualityDescription(quality: number): string {
  const descriptions = [
    'Complete blackout',
    'Incorrect, but recognized',
    'Incorrect, but seemed easy',
    'Correct with difficulty',
    'Correct with hesitation',
    'Perfect recall',
  ]
  return descriptions[quality] || 'Unknown'
}
