export enum PlanName {
  FREE = "free",
  PRO = "pro",
  ENTERPRISE = "enterprise",
}

export interface Plan {
  id: string;
  name: PlanName;
  price: number;
  requestsPerMonth: number;
  maxScrapers: number;
  maxConcurrent: number;
  features: string[];
}

export interface UsageRecord {
  period: string;
  requests: number;
  limit: number;
}
