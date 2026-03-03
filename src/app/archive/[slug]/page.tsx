import CategoryPage from "../../CategoryLayout";
import { notFound } from "next/navigation";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  // 1. Récupérer la catégorie
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', slug)
    .single();

  if (!category) {
    notFound();
  }

  // 2. Récupérer les jeux de cette catégorie
  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('category_id', slug)
    .order('created_at', { ascending: false });

  // On transforme les jeux en format "items" pour le CategoryPage
  const items = (games || []).map(game => ({
    title: game.name,
    description: `Technical archive for ${game.name}. Access builds, news, and speedruns.`,
    category: category.name,
    id: game.id
  }));

  return <CategoryPage title={category.name} items={items} />;
}
