"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SkillEntry {
  keyword: string;
  count: number;
}

interface SkillsResponse {
  totalAds: number;
  skills: SkillEntry[];
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/skills")
      .then((res) => res.json())
      .then((json: SkillsResponse) => {
        setSkills(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-zinc-500">Laddar kompetensdata...</p>
      </div>
    );
  }

  if (!skills) {
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
          Baserat på {skills.totalAds} aktiva annonser (SSYK 2512) — antal annonser som nämner varje teknologi
        </p>

        <nav className="flex gap-4 mb-6">
          <Link href="/" className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
            Trender
          </Link>
          <Link href="/skills" className="text-sm font-medium text-blue-600 dark:text-blue-400 underline underline-offset-4">
            Kompetenser
          </Link>
        </nav>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6">
          <div className="flex flex-wrap items-center justify-center gap-3 py-8">
            {skills.skills.map((s) => {
              const max = skills.skills[0].count;
              const min = skills.skills[skills.skills.length - 1].count;
              const ratio = max === min ? 1 : (s.count - min) / (max - min);
              const fontSize = 14 + ratio * 48;
              const opacity = 0.4 + ratio * 0.6;

              return (
                <span
                  key={s.keyword}
                  className="inline-block cursor-default transition-transform hover:scale-110 text-blue-600 dark:text-blue-400"
                  style={{ fontSize: `${fontSize}px`, opacity }}
                  title={`${s.keyword}: ${s.count} annonser`}
                >
                  {s.keyword}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
