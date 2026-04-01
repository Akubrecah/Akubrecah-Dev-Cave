/**
 * AKUBRECAH PRICING TIERS — Single Source of Truth
 * All prices in KES. durationMs is the access window in milliseconds.
 * filings: max KRA filings allowed during the access window (999999 = unlimited).
 */

export const TIERS = {
  mobile: {
    name: 'Mobile',
    price: 5,
    filings: 1,
    durationMs: 30 * 60 * 1000, // 30 minutes
    label: '30 Minutes',
    description: 'Quick single filing',
  },
  basic: {
    name: 'Basic',
    price: 10,
    filings: 2,
    durationMs: 2 * 60 * 60 * 1000, // 2 hours
    label: '2 Hours',
    description: 'Short session access',
  },
  standard: {
    name: 'Standard',
    price: 20,
    filings: 3,
    durationMs: 6 * 60 * 60 * 1000, // 6 hours
    label: '6 Hours',
    description: 'Half-day filing access',
  },
  standard_plus: {
    name: 'Standard Plus',
    price: 30,
    filings: 5,
    durationMs: 12 * 60 * 60 * 1000, // 12 hours
    label: '12 Hours',
    description: 'Full business day access',
  },
  pro: {
    name: 'Pro',
    price: 50,
    filings: 999999,
    durationMs: 24 * 60 * 60 * 1000, // 24 hours
    label: '24 Hours',
    description: 'Unlimited daily access',
  },
  pro_plus: {
    name: 'Pro Plus',
    price: 100,
    filings: 999999,
    durationMs: 3 * 24 * 60 * 60 * 1000, // 3 days
    label: '3 Days',
    description: 'Weekend unlimited access',
  },
  premium: {
    name: 'Premium',
    price: 200,
    filings: 999999,
    durationMs: 7 * 24 * 60 * 60 * 1000, // 1 week
    label: '1 Week',
    description: 'Full week unlimited access',
  },
  premium_plus: {
    name: 'Premium Plus',
    price: 700,
    filings: 999999,
    durationMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    label: '1 Month',
    description: 'Monthly unlimited access',
  },
} as const;

export type TierKey = keyof typeof TIERS;

/** Check if a string is a valid tier key */
export function isValidTier(tier: string): tier is TierKey {
  return tier in TIERS;
}

/** Get filing limit for a given tier (defaults to 0 if unknown) */
export function getTierFilingLimit(tier: string): number {
  if (isValidTier(tier)) return TIERS[tier].filings;
  return 0;
}

/** Get price in KES for a given tier */
export function getTierPrice(tier: string): number | null {
  if (isValidTier(tier)) return TIERS[tier].price;
  return null;
}

/** Get access duration in ms for a given tier */
export function getTierDurationMs(tier: string): number | null {
  if (isValidTier(tier)) return TIERS[tier].durationMs;
  return null;
}
