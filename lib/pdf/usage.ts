export type UsageType = 'KRA' | 'PDF';

export async function checkUsageLimit(_type: UsageType): Promise<{
  allowed: boolean;
  count: number;
  remaining: number;
  isPremium: boolean;
}> {
  // Global bypass - ALWAYS FREE as requested
  return { allowed: true, count: 0, remaining: 999, isPremium: true };
}

/**
 * Increments the usage count for a user for a specific type.
 */
export async function incrementUsage(_type: UsageType): Promise<void> {
  // skip incrementing - ALWAYS FREE as requested
  return;
}
