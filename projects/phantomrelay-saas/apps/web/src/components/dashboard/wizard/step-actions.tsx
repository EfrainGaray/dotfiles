import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { WizardData } from "./wizard";

interface Props {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
}

const actionTypes = [
  { value: "click", label: "Click", needsSelector: true },
  { value: "type", label: "Type Text", needsSelector: true, needsValue: true },
  { value: "scroll", label: "Scroll", needsValue: true },
  { value: "hover", label: "Hover", needsSelector: true },
  { value: "select", label: "Select Option", needsSelector: true, needsValue: true },
  { value: "wait", label: "Wait", needsValue: true },
  { value: "navigate", label: "Navigate", needsValue: true },
  { value: "evaluate", label: "Run JavaScript", needsValue: true },
  { value: "screenshot", label: "Screenshot" },
];

export function StepActions({ data, update }: Props) {
  const addAction = () => {
    update({ actions: [...data.actions, { type: "click", selector: "", value: "" }] });
  };

  const removeAction = (index: number) => {
    update({ actions: data.actions.filter((_, i) => i !== index) });
  };

  const updateAction = (index: number, field: string, value: string) => {
    const updated = data.actions.map((a, i) => (i === index ? { ...a, [field]: value } : a));
    update({ actions: updated });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Page Actions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Define actions to perform before extraction. Optional — leave empty for direct scrape.
        </p>
      </div>

      {data.actions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">No actions configured. The page will be scraped as-is after loading.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={addAction}>
            <Plus className="h-3.5 w-3.5" />
            Add Action
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {data.actions.map((action, i) => {
            const typeDef = actionTypes.find((t) => t.value === action.type);
            return (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-border p-3">
                <GripVertical className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground cursor-grab" />
                <div className="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <select
                    value={action.type}
                    onChange={(e) => updateAction(i, "type", e.target.value)}
                    className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                  >
                    {actionTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  {typeDef?.needsSelector && (
                    <Input
                      value={action.selector || ""}
                      onChange={(e) => updateAction(i, "selector", e.target.value)}
                      placeholder="CSS selector"
                      className="text-xs font-mono"
                    />
                  )}
                  {typeDef?.needsValue && (
                    <Input
                      value={action.value || ""}
                      onChange={(e) => updateAction(i, "value", e.target.value)}
                      placeholder={action.type === "scroll" ? "pixels (e.g. 500)" : action.type === "wait" ? "ms (e.g. 2000)" : "value"}
                      className="text-xs"
                    />
                  )}
                </div>
                <button onClick={() => removeAction(i)} className="mt-1 p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
          <Button variant="outline" size="sm" onClick={addAction}>
            <Plus className="h-3.5 w-3.5" />
            Add Action
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        11 action types available: click, type, scroll, hover, select, wait, navigate, evaluate, screenshot. Actions execute in order.
      </p>
    </div>
  );
}
