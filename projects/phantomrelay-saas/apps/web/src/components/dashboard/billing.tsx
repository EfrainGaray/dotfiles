import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CreditCard, ArrowUpRight } from "lucide-react";

const plans = [
  { name: "Free", price: "$0", period: "forever", requests: "500", scrapers: "3", concurrent: "1", current: false },
  { name: "Pro", price: "$49", period: "/month", requests: "10,000", scrapers: "25", concurrent: "5", current: true },
  { name: "Enterprise", price: "$199", period: "/month", requests: "100,000", scrapers: "Unlimited", concurrent: "20", current: false },
];

const invoices = [
  { id: "INV-2026-003", date: "Mar 1, 2026", amount: "$49.00", status: "paid" },
  { id: "INV-2026-002", date: "Feb 1, 2026", amount: "$49.00", status: "paid" },
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: "$49.00", status: "paid" },
  { id: "INV-2025-012", date: "Dec 1, 2025", amount: "$0.00", status: "free" },
];

export function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your subscription and invoices</p>
      </div>

      {/* Current Plan */}
      <div className="rounded-lg border-2 border-primary bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Pro Plan</h2>
              <Badge variant="default">Current</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">$49/month — renews Apr 1, 2026</p>
          </div>
          <Button variant="outline">Manage Subscription</Button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Requests</p>
            <p className="text-sm font-medium">234 / 10,000</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: "2.34%" }} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Scrapers</p>
            <p className="text-sm font-medium">7 / 25</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: "28%" }} />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Concurrent</p>
            <p className="text-sm font-medium">2 / 5</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: "40%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Plans Comparison */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-lg border p-5 ${plan.current ? "border-primary" : "border-border"}`}>
              <p className="text-sm font-medium text-muted-foreground">{plan.name}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <li>{plan.requests} requests/mo</li>
                <li>{plan.scrapers} scrapers</li>
                <li>{plan.concurrent} concurrent</li>
              </ul>
              {plan.current ? (
                <p className="mt-4 text-xs text-primary font-medium">Current plan</p>
              ) : (
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  {plan.name === "Free" ? "Downgrade" : "Upgrade"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Visa ending in 4242</p>
              <p className="text-xs text-muted-foreground">Expires 12/2027</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">Update</Button>
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
            {invoices.map((inv) => (
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
