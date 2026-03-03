import CategoryPage from "../../CategoryLayout";
import fs from "fs/promises";
import path from "path";

// Données fictives pour l'instant (vous pourriez aussi les stocker en JSON par la suite)
const mockData: Record<string, any[]> = {
  tips: [
    { title: "Perfect Parrying in Sekiro", description: "Master the rhythm-based combat.", category: "Action" },
  ],
  speedruns: [
    { title: "Elden Ring Any% Unrestricted", description: "Fastest way to become Elden Lord.", category: "Soulslike" },
  ],
  tricks: [
    { title: "Rocket Jumping Mechanics", description: "Using explosives for movement.", category: "Movement" },
  ]
};

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const CATS_PATH = path.join(process.cwd(), "src/data/categories.json");
  const catsFile = await fs.readFile(CATS_PATH, "utf8");
  const categories = JSON.parse(catsFile);
  
  const category = categories.find((c: any) => c.id === slug);
  const items = mockData[slug] || [];

  return <CategoryPage title={category?.name || slug} items={items} />;
}
