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
    const totalDailyKwh = appliances.reduce(
      (sum, appliance) => sum + (appliance.watts * appliance.hoursPerDay * appliance.quantity) / 1000,
      0
    );
    const rankedByDailyUse = appliances
      .map((appliance) => ({
        name: appliance.name,
        dailyKwh: (appliance.watts * appliance.hoursPerDay * appliance.quantity) / 1000,
      }))
      .sort((a, b) => b.dailyKwh - a.dailyKwh);

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

    if (rankedByDailyUse.length > 0 && totalDailyKwh > 0) {
      const topLoad = rankedByDailyUse[0];
      const topShare = (topLoad.dailyKwh / totalDailyKwh) * 100;
      if (topShare >= 40) {
        generated.push({
          type: "warning",
          icon: <AlertCircle className="h-4 w-4" />,
          title: "Single Appliance Dominates Your Load",
          text: `${topLoad.name} contributes about ${Math.round(topShare)}% of your daily energy use. Optimizing just this one load can significantly reduce both battery and inverter cost.`,
        });
      }
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

    const motorLoads = appliances.filter((appliance) => {
      const applianceName = appliance.name.toLowerCase();
      return (
        applianceName.includes("pump") ||
        applianceName.includes("fridge") ||
        applianceName.includes("freezer") ||
        applianceName.includes("ac") ||
        appliance.watts >= 700
      );
    });
    if (motorLoads.length > 0) {
      generated.push({
        type: "recommendation",
        icon: <CheckCircle className="h-4 w-4" />,
        title: "Surge-Load Protection",
        text: `Because you have motor/compressor loads (${motorLoads.map((appliance) => appliance.name).join(", ")}), choose a high-surge pure sine wave inverter and use dedicated protection for these circuits.`,
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

    if (results.paybackYears > 0 && results.paybackYears <= 4) {
      generated.push({
        type: "recommendation",
        icon: <CheckCircle className="h-4 w-4" />,
        title: "Strong Financial Case",
        text: `Your payback is around ${results.paybackYears} years, which is typically a strong return profile for residential and SME solar projects in Nigeria.`,
      });
    } else if (results.paybackYears > 8) {
      generated.push({
        type: "tip",
        icon: <Lightbulb className="h-4 w-4" />,
        title: "Improve ROI",
        text: "Your payback period is on the long side. Prioritize high-usage daytime loads first, then scale battery capacity in phases to improve early return.",
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

    if (results.panelsNeeded >= 6) {
      const estimatedRoofAreaM2 = Math.round(results.panelsNeeded * 2.2 * 10) / 10;
      generated.push({
        type: "tip",
        icon: <Lightbulb className="h-4 w-4" />,
        title: "Roof Space Planning",
        text: `A ${results.panelsNeeded}-panel layout may need roughly ${estimatedRoofAreaM2} m² of usable roof area (before setbacks/shading). A site survey is important before final sizing.`,
      });
    }

    generated.push({
      type: "cta",
      icon: <ShoppingCart className="h-4 w-4" />,
      title: "Next Step",
      text: "This estimate is a planning baseline, not a final engineering design. PawaMore can finalize your proposal with load audit, site shading checks, protection design, and a precise quote.",
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
