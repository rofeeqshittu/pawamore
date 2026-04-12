import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, RefreshCw, Bot } from "lucide-react";
import {
  clampBatchSize,
  isValidUrl,
  scraperStatusMeta,
  isRunActive,
  type ScraperRun,
  type ScrapeMode,
  type ScraperStatus,
} from "@/lib/scraperTypes";

const POLL_INTERVAL_MS = 3000;

export default function ScraperManager() {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runs, setRuns] = useState<ScraperRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ScrapeMode>("single");
  const [batchSize, setBatchSize] = useState(5);

  const fetchRuns = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("scraper_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setRuns(
        (data as any[]).map((r) => ({
          ...r,
          status: r.status as ScraperStatus,
          extracted_data: r.extracted_data as Record<string, unknown> | null,
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  // Poll while any run is still active
  useEffect(() => {
    const hasActive = runs.some(isRunActive);
    if (!hasActive) return;
    const timer = setInterval(fetchRuns, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [runs, fetchRuns]);

  const handleScrape = async () => {
    if (!isValidUrl(url)) {
      toast({ title: "Invalid URL", description: "Please enter a valid http:// or https:// URL.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const payload =
        mode === "site"
          ? { url, mode, batch_size: clampBatchSize(batchSize) }
          : { url, mode: "single" as const };

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        toast({
          title: "Scrape failed",
          description: json.error ?? "Unknown error",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Scrape started",
          description:
            mode === "site"
              ? `Run ID: ${json.run_id} • Importing up to ${clampBatchSize(batchSize)} products`
              : `Run ID: ${json.run_id}`,
        });
        setUrl("");
      }
    } catch (err) {
      toast({
        title: "Network error",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      await fetchRuns();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          AI Product Scraper
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Paste a product page URL and PawaMore AI will extract and import the product automatically.
        </p>
      </div>

      {/* URL input */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button
            type="button"
            variant={mode === "single" ? "default" : "outline"}
            onClick={() => setMode("single")}
          >
            Single Product URL
          </Button>
          <Button
            type="button"
            variant={mode === "site" ? "default" : "outline"}
            onClick={() => setMode("site")}
          >
            Site Bulk Import
          </Button>
          <Input
            type="number"
            min={1}
            max={20}
            value={batchSize}
            onChange={(e) => setBatchSize(clampBatchSize(Number(e.target.value)))}
            disabled={mode !== "site" || isSubmitting}
            placeholder="Batch size (1-20)"
          />
        </div>
        <div className="flex gap-2">
        <Input
          type="url"
          placeholder={
            mode === "site"
              ? "https://itelsolar.com/ (or category/listing page)"
              : "https://itelsolar.com/product/some-product/"
          }
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isSubmitting && handleScrape()}
          className="flex-1"
          disabled={isSubmitting}
        />
        <Button onClick={handleScrape} disabled={isSubmitting || !url.trim()}>
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scraping…</>
          ) : (
            "Scrape Product"
          )}
        </Button>
        <Button variant="outline" size="icon" onClick={fetchRuns} title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      </div>

      {/* Runs table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : runs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No scraper runs yet. Paste a product URL above to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">URL</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Product</th>
                <th className="text-left px-4 py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => {
                const meta = scraperStatusMeta(run.status);
                return (
                  <tr key={run.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 max-w-xs truncate">
                      <a
                        href={run.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                        title={run.url}
                      >
                        <span className="truncate">{run.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-1">
                        <Badge className={`${meta.colour} text-xs font-medium`}>
                          {isRunActive(run) && (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin inline" />
                          )}
                          {meta.label}
                        </Badge>
                        {run.error_message && (
                          <span className="text-xs text-red-600 max-w-xs break-words">
                            {run.error_message}
                          </span>
                        )}
                        {run.extracted_data && typeof run.extracted_data === "object" && (
                          <span className="text-xs text-muted-foreground">
                            {(run.extracted_data as any).success_count ?? 0} success •{" "}
                            {(run.extracted_data as any).failure_count ?? 0} failed
                            {((run.extracted_data as any).skipped_count ?? 0) > 0 && (
                              <><span className="mx-1">•</span>{(run.extracted_data as any).skipped_count} skipped</>
                            )}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {run.product_id ? (
                        <Link
                          to={`/admin/products/${run.product_id}/edit`}
                          className="text-primary hover:underline text-xs"
                        >
                          View Product
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(run.created_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
