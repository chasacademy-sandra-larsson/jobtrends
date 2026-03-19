"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";

const COLORS = [
  "#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed",
  "#db2777", "#0891b2", "#65a30d", "#ea580c", "#6366f1",
  "#14b8a6", "#f43f5e", "#8b5cf6", "#059669", "#f59e0b",
];

interface TrendResponse {
  terms: string[];
  data: Record<string, string | number>[];
}

export default function Home() {
  const [trends, setTrends] = useState<TrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleTerms, setVisibleTerms] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/trends")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch trends");
        return res.json();
      })
      .then((json: TrendResponse) => {
        setTrends(json);
        setVisibleTerms(new Set(json.terms));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const toggleTerm = (term: string) => {
    setVisibleTerms((prev) => {
      const next = new Set(prev);
      if (next.has(term)) {
        next.delete(term);
      } else {
        next.add(term);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-zinc-500">Laddar trenddata...</p>
      </div>
    );
  }

  if (error || !trends) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-500">Fel: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          JobTrends
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">
          Veckovis publicerade jobbannonser per sökord (källa: JobTech API)
        </p>

        <nav className="flex gap-4 mb-6">
          <Link href="/" className="text-sm font-medium text-blue-600 dark:text-blue-400 underline underline-offset-4">
            Trender
          </Link>
          <Link href="/skills" className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            Kompetenser
          </Link>
        </nav>

        <div className="flex flex-wrap gap-2 mb-6">
          {trends.terms.map((term, i) => (
            <button
              key={term}
              onClick={() => toggleTerm(term)}
              className="px-3 py-1 rounded-full text-sm font-medium transition-colors border"
              style={{
                backgroundColor: visibleTerms.has(term) ? COLORS[i % COLORS.length] : "transparent",
                color: visibleTerms.has(term) ? "white" : COLORS[i % COLORS.length],
                borderColor: COLORS[i % COLORS.length],
              }}
            >
              {term}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 mb-8">
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={trends.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis
                dataKey="weekStart"
                tick={{ fontSize: 12 }}
                tickFormatter={(val: string) => val.slice(0, 7)}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: "Publicerade annonser / vecka", angle: -90, position: "insideLeft", style: { fontSize: 12, fill: "#71717a" } }}
              />
              <Tooltip
                labelFormatter={(label) => `Vecka: ${label}`}
                itemSorter={(item) => -(item.value as number)}
              />
              <Legend />
              {trends.terms.map((term, i) =>
                visibleTerms.has(term) ? (
                  <Line
                    key={term}
                    type="monotone"
                    dataKey={term}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    name={term}
                  />
                ) : null
              )}
              <Brush
                dataKey="weekStart"
                height={30}
                stroke="#2563eb"
                tickFormatter={(val: string) => val.slice(0, 7)}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
