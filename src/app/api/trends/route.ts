import { NextResponse } from "next/server";

const JOBTECH_API = "https://jobsearch.api.jobtechdev.se/search";

const SEARCH_TERMS = [
  "mjukvaruutvecklare",
  "systemutvecklare",
  "fullstack",
  "frontend",
  "backend",
  "webbutvecklare",
  "devops",
  "IT-arkitekt",
  "testare",
  "cybersäkerhet",
  "dataingenjör",
  "molntekniker",
  "UX-designer",
  "systemadministratör",
  "AI",
];

interface WeekEntry {
  weekStart: string;
  [term: string]: string | number;
}

export async function GET() {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  let weekStart = new Date(end);
  weekStart.setMonth(weekStart.getMonth() - 7);

  const results: WeekEntry[] = [];

  while (weekStart < end) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const publishedAfter = weekStart.toISOString().split("T")[0];
    const publishedBefore = weekEnd.toISOString().split("T")[0];

    const entry: WeekEntry = { weekStart: publishedAfter };

    const fetches = SEARCH_TERMS.map(async (term) => {
      const apiUrl =
        `${JOBTECH_API}?q=${encodeURIComponent(term)}` +
        `&published-after=${publishedAfter}` +
        `&published-before=${publishedBefore}` +
        `&limit=0`;

      try {
        const res = await fetch(apiUrl);
        if (!res.ok) return { term, count: 0 };
        const data = await res.json();
        return { term, count: data?.total?.value ?? 0 };
      } catch {
        return { term, count: 0 };
      }
    });

    const counts = await Promise.all(fetches);
    for (const { term, count } of counts) {
      entry[term] = count;
    }

    results.push(entry);
    weekStart = weekEnd;
  }

  return NextResponse.json({ terms: SEARCH_TERMS, data: results });
}
