import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { WizardData } from "./wizard";

interface Props {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
}

const extractionTypes = [
  { key: "extractHtml", label: "HTML", desc: "Full page HTML (document.documentElement.outerHTML)" },
  { key: "extractText", label: "Plain Text", desc: "Cleaned text content (document.body.innerText)" },
  { key: "extractScreenshot", label: "Screenshot", desc: "Full-page PNG screenshot (base64)" },
  { key: "extractHar", label: "HAR Recording", desc: "HTTP Archive 1.2 with all requests, responses, and timings" },
] as const;

export function StepExtraction({ data, update }: Props) {
  const addSelector = () => {
    update({ selectors: [...data.selectors, { name: "", selector: "", attribute: "" }] });
  };

  const removeSelector = (index: number) => {
    update({ selectors: data.selectors.filter((_, i) => i !== index) });
  };

  const updateSelector = (index: number, field: string, value: string) => {
    const updated = data.selectors.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    update({ selectors: updated });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Extraction</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose what data to extract from the page</p>
      </div>

      {/* Toggle cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {extractionTypes.map((ext) => (
          <button
            key={ext.key}
            onClick={() => update({ [ext.key]: !data[ext.key] } as any)}
            className={`rounded-lg border-2 p-4 text-left transition-colors ${
              data[ext.key] ? "border-primary bg-primary/5" : "border-border hover:bg-muted/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`h-3.5 w-3.5 rounded border-2 flex items-center justify-center ${
                data[ext.key] ? "border-primary bg-primary" : "border-muted-foreground"
              }`}>
                {data[ext.key] && <span className="text-[8px] text-primary-foreground">✓</span>}
              </div>
              <span className="text-sm font-medium">{ext.label}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{ext.desc}</p>
          </button>
        ))}
      </div>

      {/* CSS Selectors */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">CSS Selectors</h3>
            <p className="text-xs text-muted-foreground">Extract specific data by CSS selector</p>
          </div>
          <Button variant="outline" size="sm" onClick={addSelector}>
            <Plus className="h-3.5 w-3.5" />
            Add Selector
          </Button>
        </div>

        {data.selectors.length === 0 ? (
          <p className="text-xs text-muted-foreground">No custom selectors. HTML/text extraction will capture the full page.</p>
        ) : (
          <div className="space-y-2">
            {data.selectors.map((sel, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={sel.name}
                  onChange={(e) => updateSelector(i, "name", e.target.value)}
                  placeholder="Field name"
                  className="flex-1 text-xs"
                />
                <Input
                  value={sel.selector}
                  onChange={(e) => updateSelector(i, "selector", e.target.value)}
                  placeholder=".class, #id, tag"
                  className="flex-1 text-xs font-mono"
                />
                <Input
                  value={sel.attribute}
                  onChange={(e) => updateSelector(i, "attribute", e.target.value)}
                  placeholder="attr (empty=text)"
                  className="w-28 text-xs font-mono"
                />
                <button onClick={() => removeSelector(i)} className="p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
