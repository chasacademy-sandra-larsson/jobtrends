import { NextResponse } from "next/server";

const JOBTECH_API = "https://jobsearch.api.jobtechdev.se/search";

const SWEDISH_CITIES = [
  "Stockholm", "Göteborg", "Malmö", "Uppsala", "Linköping",
  "Västerås", "Örebro", "Helsingborg", "Norrköping", "Jönköping",
  "Umeå", "Lund", "Borås", "Sundsvall", "Gävle",
  "Eskilstuna", "Halmstad", "Växjö", "Karlstad", "Trollhättan",
  "Södertälje", "Östersund", "Skellefteå", "Luleå", "Kalmar",
  "Kristianstad", "Falun", "Karlskrona", "Varberg", "Nyköping",
  "Uddevalla", "Visby", "Ystad", "Lidköping", "Borlänge",
  "Landskrona", "Motala", "Kiruna", "Tumba", "Skövde",
  "Sandviken", "Piteå", "Katrineholm", "Örnsköldsvik", "Härnösand",
  "Mora", "Arvika", "Sala", "Alingsås", "Enköping",
];

async function fetchAds(limit: number): Promise<string[]> {
  const descriptions: string[] = [];
  let offset = 0;

  while (descriptions.length < limit) {
    const batchSize = Math.min(100, limit - descriptions.length);
    const url =
      `${JOBTECH_API}?occupation-group=2512` +
      `&offset=${offset}&limit=${batchSize}`;

    const res = await fetch(url);
    if (!res.ok) break;

    const data = await res.json();
    const hits = data?.hits ?? [];
    if (hits.length === 0) break;

    for (const hit of hits) {
      const text = hit?.description?.text ?? "";
      const workplace = hit?.workplace_address?.city ?? "";
      if (text || workplace) {
        descriptions.push(`${workplace} ${text}`);
      }
    }

    offset += batchSize;
  }

  return descriptions;
}

export async function GET() {
  const descriptions = await fetchAds(500);

  const counts: Record<string, number> = {};

  for (const city of SWEDISH_CITIES) {
    const regex = new RegExp(`\\b${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    let total = 0;
    for (const desc of descriptions) {
      if (regex.test(desc)) total += 1;
    }
    if (total > 0) {
      counts[city] = total;
    }
  }

  const sorted = Object.entries(counts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    totalAds: descriptions.length,
    cities: sorted,
  });
}
