import { Input } from "../../ui/input";
import type { WizardData } from "./wizard";

interface Props {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
}

export function StepTarget({ data, update }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Target</h2>
        <p className="mt-1 text-sm text-muted-foreground">Define what to scrape</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Scraper Name</label>
          <Input
            value={data.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="e.g. Amazon_Price_Monitor"
          />
          <p className="text-xs text-muted-foreground">Unique name to identify this scraper</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Target URL</label>
          <Input
            value={data.url}
            onChange={(e) => update({ url: e.target.value })}
            placeholder="https://example.com/page"
          />
          <p className="text-xs text-muted-foreground">The URL to scrape. Supports wildcards in scheduled runs.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Engine</label>
            <select
              value={data.engine}
              onChange={(e) => update({ engine: e.target.value })}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="chrome">Chrome</option>
              <option value="firefox">Firefox</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Wait For</label>
            <select
              value={data.waitFor}
              onChange={(e) => update({ waitFor: e.target.value })}
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="load">Page Load</option>
              <option value="domcontentloaded">DOM Content Loaded</option>
              <option value="networkidle">Network Idle</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
