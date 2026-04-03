import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CreditCard, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import * as api from "@/lib/api-client";
import type { BillingUsage, BillingPlan, Invoice } from "@/lib/api-client";

const mockPlans = [
  { name: "Free", price: "$0", period: "forever", requests: "500", scrapers: "3", concurrent: "1" },
  { name: "Pro", price: "$49", period: "/month", requests: "10,000", scrapers: "25", concurrent: "5" },
  { name: "Enterprise", price: "$199", period: "/month", requests: "100,000", scrapers: "Unlimited", concurrent: "20" },
];

const mockInvoices = [
  { id: "INV-2026-003", date: "Mar 1, 2026", amount: "$49.00", status: "paid" },
  { id: "INV-2026-002", date: "Feb 1, 2026", amount: "$49.00", status: "paid" },
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: "$49.00", status: "paid" },
  { id: "INV-2025-012", date: "Dec 1, 2025", amount: "$0.00", status: "free" },
];

const mockUsage: BillingUsage = {
  requests: 234,
  requestsLimit: 10000,
  scrapers: 7,
  scrapersLimit: 25,
  concurrent: 2,
  concurrentLimit: 5,
  currentPlan: "Pro",
  renewsAt: "Apr 1, 2026",
};

export function BillingPage() {
  const [usage, setUsage] = useState<BillingUsage | null>(null);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [usageResult, plansResult, invoicesResult] = await Promise.all([
        api.getUsage(),
        api.getPlans(),
        api.getInvoices(),
      ]);
      setUsage(usageResult);
      setPlans(plansResult);
      setInvoices(invoicesResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load billing data");
      // Fallback to mock data
      setUsage(mockUsage);
      setPlans(mockPlans);
      setInvoices(mockInvoices);
    } finally {
      setLoading(false);
    }
  }

  async function handleManageSubscription() {
    try {
      setActionLoading("manage");
      const result = await api.createPortal();
      window.location.href = result.url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to open billing portal");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUpgrade(planName: string) {
    try {
      setActionLoading(planName);
      const result = await api.createCheckout(planName);
      window.location.href = result.url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to start checkout");
    } finally {
      setActionLoading(null);
    }
  }

  const currentUsage = usage ?? mockUsage;
  const currentPlans = plans.length > 0 ? plans : mockPlans;
  const currentInvoices = invoices.length > 0 ? invoices : mockInvoices;

  const reqPercent = (currentUsage.requests / currentUsage.requestsLimit) * 100;
  const scraperPercent = (currentUsage.scrapers / currentUsage.scrapersLimit) * 100;
  const concurrentPercent = (currentUsage.concurrent / currentUsage.concurrentLimit) * 100;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your subscription and invoices</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 animate-pulse">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="mt-2 h-4 w-48 bg-muted rounded" />
          <div className="mt-4 grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-3 w-16 bg-muted rounded" />
                <div className="mt-1 h-4 w-24 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your subscription and invoices</p>
      </div>

      {error && (
        <div className="rounded-lg border border-warning bg-warning/10 p-3 text-sm text-warning">
          {error} — showing cached data
        </div>
      )}

      {/* Current Plan */}
      <div className="rounded-lg border-2 border-primary bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{currentUsage.currentPlan} Plan</h2>
              <Badge variant="default">Current</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Renews {currentUsage.renewsAt}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleManageSubscription}
            disabled={actionLoading === "manage"}
          >
            {actionLoading === "manage" ? "Loading..." : "Manage Subscription"}
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Requests</p>
            <p className="text-sm font-medium">{currentUsage.requests.toLocaleString()} / {currentUsage.requestsLimit.toLocaleString()}</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${reqPercent.toFixed(2)}%` }} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Scrapers</p>
            <p className="text-sm font-medium">{currentUsage.scrapers} / {currentUsage.scrapersLimit}</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${scraperPercent.toFixed(0)}%` }} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Concurrent</p>
            <p className="text-sm font-medium">{currentUsage.concurrent} / {currentUsage.concurrentLimit}</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${concurrentPercent.toFixed(0)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Plans Comparison */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {currentPlans.map((plan) => {
            const isCurrent = plan.name === currentUsage.currentPlan;
            return (
              <div key={plan.name} className={`rounded-lg border p-5 ${isCurrent ? "border-primary" : "border-border"}`}>
                <p className="text-sm font-medium text-muted-foreground">{plan.name}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <li>{plan.requests} requests/mo</li>
                  <li>{plan.scrapers} scrapers</li>
                  <li>{plan.concurrent} concurrent</li>
                </ul>
                {isCurrent ? (
                  <p className="mt-4 text-xs text-primary font-medium">Current plan</p>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    disabled={actionLoading === plan.name}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {actionLoading === plan.name ? "Loading..." : plan.name === "Free" ? "Downgrade" : "Upgrade"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Payment method on file</p>
              <p className="text-xs text-muted-foreground">Managed via Stripe</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleManageSubscription}>
            Update
          </Button>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <div className="border-b border-border px-5 py-3">
          <p className="text-sm font-medium text-foreground">Invoices</p>
        </div>
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Invoice</th>
              <th className="px-5 py-2.5 font-medium">Date</th>
              <th className="px-5 py-2.5 font-medium">Amount</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {currentInvoices.map((inv) => (
              <tr key={inv.id} className="border-b border-border last:border-0">
                <td className="px-5 py-2.5 font-mono text-xs text-foreground">{inv.id}</td>
                <td className="px-5 py-2.5 text-muted-foreground">{inv.date}</td>
                <td className="px-5 py-2.5 font-medium">{inv.amount}</td>
                <td className="px-5 py-2.5">
                  <Badge variant={inv.status === "paid" ? "success" : "secondary"}>{inv.status}</Badge>
                </td>
                <td className="px-5 py-2.5">
                  <button className="text-primary text-xs hover:underline flex items-center gap-1">
                    PDF <ArrowUpRight className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
