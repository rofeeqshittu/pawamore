import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { Appliance } from "@/lib/solar-data";

interface AIInsightsProps {
  appliances: Appliance[];
  results: {
    peakLoad: number;
    dailyConsumption: number;
    batteryCapacity: number;
    inverterSize: number;
    panelsNeeded: number;
    totalCost: number;
    monthlySavings: number;
    paybackYears: number;
    annualCO2Saved: number;
    monthlyFuelSaved: number;
  };
}

interface Insight {
  type: "tip" | "warning" | "recommendation" | "cta";
  icon: React.ReactNode;
  title: string;
  text: string;
}

const AIInsights = ({ appliances, results }: AIInsightsProps) => {
  const [expanded, setExpanded] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    if (appliances.length === 0) {
      setInsights([]);
      return;
    }

    const generated: Insight[] = [];

    const highWatt = appliances.filter((appliance) => appliance.watts * appliance.quantity >= 1000);
    if (highWatt.length > 0) {
      const names = highWatt.map((appliance) => appliance.name).join(", ");
      generated.push({
        type: "warning",
        icon: <AlertCircle className="h-4 w-4" />,
        title: "High-Power Appliances Detected",
        text: `${names} ${highWatt.length > 1 ? "are" : "is"} drawing significant power. Consider using more efficient alternatives or reducing daily usage hours to lower your system cost by up to 30%.`,
      });
    }

    const alwaysOn = appliances.filter((appliance) => appliance.hoursPerDay >= 20);
    if (alwaysOn.length > 0) {
      generated.push({
        type: "tip",
        icon: <Lightbulb className="h-4 w-4" />,
        title: "Always-On Devices",
        text: `${alwaysOn.map((appliance) => appliance.name).join(", ")} run nearly 24/7. These form your baseline load, so efficient models will have an outsized impact on battery life and total system size.`,
      });
    }

    const hasAC = appliances.some(
      (appliance) => appliance.name.toLowerCase().includes("ac") || appliance.watts >= 900
    );
    if (hasAC) {
      generated.push({
        type: "tip",
        icon: <Lightbulb className="h-4 w-4" />,
        title: "Air Conditioning Optimization",
        text: "AC units are usually the largest load in the house. Inverter ACs can cut consumption sharply compared to conventional models and pair much better with solar-backed systems.",
      });
    }

    if (results.batteryCapacity >= 5) {
      generated.push({
        type: "recommendation",
        icon: <CheckCircle className="h-4 w-4" />,
        title: "Battery Strategy",
        text: `Your ${results.batteryCapacity} kWh battery requirement is substantial. A modular lithium setup lets you start with the right core capacity now and expand later without replacing the whole system.`,
      });
    }

    if (results.monthlySavings > 0) {
      const yearlySavings = results.monthlySavings * 12;
      generated.push({
        type: "recommendation",
        icon: <CheckCircle className="h-4 w-4" />,
        title: "Generator vs Solar",
        text: `You could save about ₦${yearlySavings.toLocaleString("en-NG")} per year by moving this load from generator power to solar. Over 5 years, that's roughly ₦${(yearlySavings * 5).toLocaleString("en-NG")} before fuel stress, noise, and maintenance are even counted.`,
      });
    }

    if (results.annualCO2Saved > 0) {
      generated.push({
        type: "tip",
        icon: <Lightbulb className="h-4 w-4" />,
        title: "Environmental Impact",
        text: `This setup avoids about ${results.annualCO2Saved}kg of CO2 each year and saves around ${results.monthlyFuelSaved} litres of fuel monthly. The savings are financial, practical, and environmental.`,
      });
    }

    generated.push({
      type: "cta",
      icon: <ShoppingCart className="h-4 w-4" />,
      title: "Next Step",
      text: "This estimate is a strong planning baseline. PawaMore can turn it into an exact proposal with installation scope, product selection, and a proper quote for your home or business.",
    });

    setInsights(generated);
  }, [appliances, results]);

  if (appliances.length === 0) return null;

  const typeStyles: Record<Insight["type"], string> = {
    tip: "border-l-primary bg-primary/5",
    warning: "border-l-solar-orange bg-solar-peach/50",
    recommendation: "border-l-solar-orange bg-solar-peach/40",
    cta: "border-l-solar-orange bg-solar-peach",
  };

  const iconColor: Record<Insight["type"], string> = {
    tip: "text-primary",
    warning: "text-solar-orange",
    recommendation: "text-solar-orange",
    cta: "text-solar-orange",
  };

  return (
    <div className="overflow-hidden rounded-xl border-2 border-primary/30 bg-card">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between bg-primary p-4 text-primary-foreground"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h3 className="text-base font-bold">Solar Expert Insights</h3>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {expanded && (
        <div className="space-y-3 p-4">
          <p className="mb-2 text-xs text-muted-foreground">
            Personalized analysis based on your appliance setup and projected power needs:
          </p>
          {insights.map((insight, index) => (
            <div key={index} className={`rounded-r-lg border-l-4 p-3 ${typeStyles[insight.type]}`}>
              <div className="mb-1 flex items-center gap-2">
                <span className={iconColor[insight.type]}>{insight.icon}</span>
                <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
              </div>
              <p className="pl-6 text-xs leading-relaxed text-muted-foreground">{insight.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIInsights;
