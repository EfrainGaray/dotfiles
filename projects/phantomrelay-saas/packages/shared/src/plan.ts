export interface PlanDefinition {
  id: string;
  name: string;
  priceMonthly: number; // cents
  requestsPerMonth: number;
  maxScrapers: number;
  maxConcurrent: number;
  features: string[];
}

export const PLANS: Record<string, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    requestsPerMonth: 500,
    maxScrapers: 3,
    maxConcurrent: 1,
    features: ["basic_modes"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 4900, // $49
    requestsPerMonth: 10_000,
    maxScrapers: 25,
    maxConcurrent: 5,
    features: ["all_modes", "scheduling", "proxies", "webhooks", "captcha"],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: 19900, // $199
    requestsPerMonth: 100_000,
    maxScrapers: -1, // unlimited
    maxConcurrent: 20,
    features: ["all_modes", "scheduling", "proxies", "webhooks", "captcha", "team", "priority_support"],
  },
};
