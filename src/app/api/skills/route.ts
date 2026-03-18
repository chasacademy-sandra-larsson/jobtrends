import { NextResponse } from "next/server";

const JOBTECH_API = "https://jobsearch.api.jobtechdev.se/search";

const TECH_KEYWORDS = [
  "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust",
  "PHP", "Ruby", "Kotlin", "Swift", "Scala",
  "React", "Angular", "Vue", "Next.js", "Node.js", "Express", ".NET",
  "Spring", "Django", "Flask", "FastAPI", "Laravel",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
  "CI/CD", "Jenkins", "GitHub Actions", "GitLab",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
  "REST", "GraphQL", "gRPC", "Microservices",
  "Agile", "Scrum", "DevOps", "Git",
  "Linux", "Figma", "Power BI", "Tableau",
  "Machine Learning", "AI", "TensorFlow", "PyTorch",
  "HTML", "CSS", "Tailwind", "SASS",
  "RabbitMQ", "Kafka", "Ansible", "Nginx",
];

async function fetchAds(query: string, limit: number): Promise<string[]> {
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
      if (text) descriptions.push(text);
    }

    offset += batchSize;
  }

  return descriptions;
}

export async function GET() {
  const descriptions = await fetchAds("2512", 500);

  const counts: Record<string, number> = {};

  for (const keyword of TECH_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    let total = 0;
    for (const desc of descriptions) {
      const matches = desc.match(regex);
      if (matches) total += 1; // count ads mentioning it, not total occurrences
    }
    if (total > 0) {
      counts[keyword] = total;
    }
  }

  const sorted = Object.entries(counts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    totalAds: descriptions.length,
    skills: sorted,
  });
}
