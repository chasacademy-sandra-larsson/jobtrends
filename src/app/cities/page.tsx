"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CityEntry {
  keyword: string;
  count: number;
}

interface CitiesResponse {
  totalAds: number;
  cities: CityEntry[];
}

export default function CitiesPage() {
  const [cities, setCities] = useState<CitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((json: CitiesResponse) => {
        setCities(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-zinc-500">Laddar stadsdata...</p>
      </div>
    );
  }

  if (!cities) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-500">Kunde inte ladda data</p>
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
          Baserat på {cities.totalAds} aktiva annonser (SSYK 2512) — antal annonser som nämner varje stad
        </p>

        <nav className="flex gap-4 mb-6">
          <Link href="/" className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            Trender
          </Link>
          <Link href="/skills" className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            Kompetenser
          </Link>
          <Link href="/cities" className="text-sm font-medium text-blue-600 dark:text-blue-400 underline underline-offset-4">
            Städer
          </Link>
        </nav>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6">
          <div className="flex flex-wrap items-center justify-center gap-3 py-8">
            {cities.cities.map((c) => {
              const max = cities.cities[0].count;
              const min = cities.cities[cities.cities.length - 1].count;
              const ratio = max === min ? 1 : (c.count - min) / (max - min);
              const fontSize = 14 + ratio * 48;
              const opacity = 0.4 + ratio * 0.6;

              return (
                <span
                  key={c.keyword}
                  className="inline-block cursor-default transition-transform hover:scale-110 text-emerald-600 dark:text-emerald-400"
                  style={{ fontSize: `${fontSize}px`, opacity }}
                  title={`${c.keyword}: ${c.count} annonser`}
                >
                  {c.keyword}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
