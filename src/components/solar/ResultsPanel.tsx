import { Battery, Clock, Fuel, Leaf, Sun, TreePine, TrendingDown, Zap } from "lucide-react";
import { SUN_HOURS_NIGERIA } from "@/lib/solar-data";

interface ResultsPanelProps {
  results: {
    peakLoad: number;
    dailyConsumption: number;
    batteryCapacity: number;
    inverterSize: number;
    panelsNeeded: number;
    batteryCost: number;
    inverterCost: number;
    panelCost: number;
    installationCost: number;
    totalCost: number;
    annualCO2Saved: number;
    treesEquivalent: number;
    monthlyFuelSaved: number;
    monthlySavings: number;
    paybackYears: number;
  };
}

const formatNaira = (value: number) => `₦${value.toLocaleString("en-NG")}`;

const ResultsPanel = ({ results }: ResultsPanelProps) => {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
          <Zap className="h-4 w-4 text-solar-orange" />
          Power Requirements
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border py-2">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Daily Consumption
            </span>
            <span className="text-sm font-bold text-solar-orange">{results.dailyConsumption} kWh</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              Peak Load
            </span>
            <span className="text-sm font-bold text-solar-orange">{results.peakLoad}W</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
          <Sun className="h-4 w-4 text-accent" />
          Recommended System
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border py-2">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Battery className="h-3.5 w-3.5" />
              Battery Capacity
            </span>
            <span className="text-sm font-bold">{results.batteryCapacity} kWh</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-2">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              Inverter Size
            </span>
            <span className="text-sm font-bold">{results.inverterSize}W</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sun className="h-3.5 w-3.5" />
              Solar Panels (410W)
            </span>
            <span className="text-sm font-bold">
              {results.panelsNeeded} panel{results.panelsNeeded > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
          <Leaf className="h-4 w-4 text-primary" />
          Environmental Impact
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-card p-2">
            <TreePine className="mx-auto mb-1 h-4 w-4 text-primary" />
            <p className="text-lg font-bold text-primary">{results.treesEquivalent}</p>
            <p className="text-[10px] text-muted-foreground">Trees equivalent/yr</p>
          </div>
          <div className="rounded-lg bg-card p-2">
            <Leaf className="mx-auto mb-1 h-4 w-4 text-primary" />
            <p className="text-lg font-bold text-primary">{results.annualCO2Saved}kg</p>
            <p className="text-[10px] text-muted-foreground">CO2 saved/yr</p>
          </div>
          <div className="rounded-lg bg-card p-2">
            <Fuel className="mx-auto mb-1 h-4 w-4 text-primary" />
            <p className="text-lg font-bold text-primary">{results.monthlyFuelSaved}L</p>
            <p className="text-[10px] text-muted-foreground">Fuel saved/mo</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border-2 border-solar-orange/30 bg-solar-peach p-4">
        <h3 className="mb-3 text-base font-bold">Estimated Cost</h3>
        <div className="space-y-2">
          {[
            ["Battery System", results.batteryCost],
            ["Inverter", results.inverterCost],
            ["Solar Panels", results.panelCost],
            ["Installation", results.installationCost],
          ].map(([label, cost]) => (
            <div key={label} className="flex items-center justify-between border-b border-accent/10 py-1.5">
              <span className="text-sm text-foreground">{label}</span>
              <span className="text-sm font-semibold">{formatNaira(cost)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <span className="font-bold text-solar-orange">Total Estimate</span>
            <span className="text-lg font-bold text-solar-orange">{formatNaira(results.totalCost)}</span>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          * Prices are estimates. Contact us for an exact quote.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
          <TrendingDown className="h-4 w-4 text-primary" />
          Your Savings
        </h3>
        <div className="flex items-center justify-between border-b border-border py-2">
          <span className="text-sm text-muted-foreground">Monthly Savings</span>
          <span className="text-sm font-bold text-primary">{formatNaira(results.monthlySavings)}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground">Payback Period</span>
          <span className="text-sm font-bold text-primary">{results.paybackYears} years</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-4">
        <h3 className="mb-2 text-sm font-bold">Assumptions Used in This Estimate</h3>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>• Average sun-hours: {SUN_HOURS_NIGERIA} h/day (Nigeria baseline).</p>
          <p>• Battery planning includes reserve margin and safe depth-of-discharge assumptions.</p>
          <p>• Inverter sizing includes extra headroom for startup/surge behavior.</p>
          <p>• Final engineering quote still depends on site survey, shading, and installation conditions.</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;
