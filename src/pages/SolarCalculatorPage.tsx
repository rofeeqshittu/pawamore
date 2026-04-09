import { useEffect, useMemo, useState } from "react";
import { ArrowUp, Calculator, Sun } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import AIInsights from "@/components/solar/AIInsights";
import AddApplianceForm from "@/components/solar/AddApplianceForm";
import ApplianceCard from "@/components/solar/ApplianceCard";
import PresetSelector from "@/components/solar/PresetSelector";
import ResultsPanel from "@/components/solar/ResultsPanel";
import { Appliance, PresetAppliance, calculateSolarNeeds } from "@/lib/solar-data";
import useSEO from "@/hooks/useSEO";

let idCounter = 0;
const nextId = () => String(++idCounter);

const SolarCalculatorPage = () => {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useSEO({
    title: "Solar Calculator - Calculate Your Power Needs | PawaMore",
    description:
      "Use our free solar calculator to estimate your power needs and get tailored recommendations for batteries, inverters, and solar panels in Nigeria.",
  });

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const results = useMemo(() => calculateSolarNeeds(appliances), [appliances]);

  const addPreset = (preset: PresetAppliance) => {
    setAppliances((prev) => [
      ...prev,
      {
        id: nextId(),
        name: preset.name,
        watts: preset.watts,
        hoursPerDay: preset.defaultHours,
        quantity: 1,
      },
    ]);
  };

  const addCustom = (name: string, watts: number, hours: number, qty: number) => {
    setAppliances((prev) => [
      ...prev,
      { id: nextId(), name, watts, hoursPerDay: hours, quantity: qty },
    ]);
  };

  const updateAppliance = (id: string, field: keyof Appliance, value: string | number) => {
    setAppliances((prev) =>
      prev.map((appliance) => (appliance.id === id ? { ...appliance, [field]: value } : appliance))
    );
  };

  const removeAppliance = (id: string) => {
    setAppliances((prev) => prev.filter((appliance) => appliance.id !== id));
  };

  const clearAll = () => setAppliances([]);

  return (
    <Layout>
      <div className="bg-background">
        <header className="bg-primary text-primary-foreground">
          <div className="container px-4 py-10 text-center md:py-16">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Sun className="h-8 w-8 text-accent" />
              <h1 className="text-3xl font-bold md:text-4xl">Solar Power Calculator</h1>
            </div>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-primary-foreground/80 md:text-base">
              Calculate your exact power needs and get a clearer picture of the battery,
              inverter, and panel setup that fits your home or business.
            </p>
          </div>
        </header>

        <div className="container -mt-5 px-4">
          <div className="flex items-center gap-3 rounded-2xl bg-secondary p-5 text-secondary-foreground md:p-6">
            <Calculator className="h-6 w-6 shrink-0" />
            <div>
              <h2 className="text-lg font-bold">Plan Your System</h2>
              <p className="text-sm text-secondary-foreground/80">
                Add your appliances below and get instant recommendations.
              </p>
            </div>
          </div>
        </div>

        <main className="container px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 text-base font-bold">Quick Add Appliances</h3>
                <PresetSelector onSelect={addPreset} />
              </div>

              {appliances.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-bold">Your Appliances ({appliances.length})</h3>
                    <button
                      onClick={clearAll}
                      className="text-xs font-semibold uppercase tracking-wide text-destructive hover:text-destructive/80"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {appliances.map((appliance) => (
                      <ApplianceCard
                        key={appliance.id}
                        appliance={appliance}
                        onUpdate={updateAppliance}
                        onRemove={removeAppliance}
                      />
                    ))}
                  </div>
                </div>
              )}

              <AddApplianceForm onAdd={addCustom} />
            </div>

            <div className="space-y-5">
              {appliances.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border p-10 text-center">
                  <Sun className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Add appliances to see your solar power recommendations.
                  </p>
                </div>
              ) : (
                <>
                  <ResultsPanel results={results} />
                  <AIInsights appliances={appliances} results={results} />
                  <Button
                    className="w-full rounded-xl bg-primary py-6 text-base font-bold uppercase tracking-wider hover:bg-primary/90"
                    onClick={() => window.open("/contact", "_self")}
                  >
                    Get Free Consultation
                  </Button>
                </>
              )}
            </div>
          </div>
        </main>

        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
    </Layout>
  );
};

export default SolarCalculatorPage;
