import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChart } from "@/components/dashboard/income-outcome-chart";
import { ProfitPercentChart } from "@/components/dashboard/profit-percent-chart";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData } from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

function App() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trends, setTrends] = useState<{
    totalIncome?: number;
    totalOutcome?: number;
    profit?: number;
    profitPercent?: number;
  }>({});

  useEffect(() => {
    fetchFinancialData()
      .then((movements) => {
        const computedMetrics = computeKPIs(movements);
        setMetrics(computedMetrics);
        setMonthlyData(computeMonthlyData(movements));
        
        // Calculate trends (compare last month vs previous month)
        if (monthlyData.length >= 2) {
          const lastMonth = monthlyData[monthlyData.length - 1];
          const prevMonth = monthlyData[monthlyData.length - 2];
          
          const calculateTrend = (current: number, previous: number) => {
            if (previous === 0) return 0;
            return Math.round(((current - previous) / previous) * 100);
          };
          
          setTrends({
            totalIncome: calculateTrend(lastMonth.income, prevMonth.income),
            totalOutcome: calculateTrend(lastMonth.outcome, prevMonth.outcome),
            profit: calculateTrend(
              lastMonth.income - lastMonth.outcome,
              prevMonth.income - prevMonth.outcome
            ),
            profitPercent: lastMonth.profitPercent - prevMonth.profitPercent,
          });
        }
      })
      .catch(() => {
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period="2024 - Full Year" />

          {error ? (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
            >
              {error}
            </div>
          ) : null}

          <section aria-labelledby="kpi-section-title">
            <h2 id="kpi-section-title" className="sr-only">
              Key performance indicators
            </h2>
            <KPIRow metrics={metrics} loading={loading} trends={trends} />
          </section>

          <section
            aria-labelledby="charts-section-title"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <h2 id="charts-section-title" className="sr-only">
              Financial charts
            </h2>
            <IncomeOutcomeChart data={monthlyData} loading={loading} />
            <ProfitPercentChart data={monthlyData} loading={loading} />
          </section>

          {/* Methodology section - follows KPI dashboard best practices */}
          <section aria-labelledby="methodology-title" className="mt-8">
            <h2 id="methodology-title" className="text-sm font-semibold text-muted-foreground mb-3">
              Methodology
            </h2>
            <div className="rounded-lg border border-border/60 bg-card p-4 text-xs text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">Total Income:</strong> Sum of all positive financial movements (revenue, sales, incoming transfers).
              </p>
              <p>
                <strong className="text-foreground">Total Outcome:</strong> Sum of all negative financial movements (expenses, costs, outgoing transfers).
              </p>
              <p>
                <strong className="text-foreground">Profit:</strong> Calculated as Total Income minus Total Outcome.
              </p>
              <p>
                <strong className="text-foreground">Profit Margin:</strong> Profit divided by Total Income, expressed as a percentage.
              </p>
              <p>
                <strong className="text-foreground">Trends:</strong> Percentage change comparing the most recent month to the previous month.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
