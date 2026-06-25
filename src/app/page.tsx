import { CustomerExperience } from "@/components/customer-experience";
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const [perfumeRes, familyRes, sizesRes] = await Promise.all([
    supabase.from("perfumes").select("*").eq("is_active", true).order("created_at", { ascending: false }),
    supabase.from("scent_families").select("*").order("sort_order"),
    supabase.from("perfume_sizes").select("*").eq("is_active", true),
  ]);

  const perfumesData = perfumeRes.data || [];
  const familiesData = familyRes.data || [];
  const sizesData = sizesRes.data || [];

  const mergedPerfumes = perfumesData.map((p) => {
    const matchedFamilies = (p.family_ids || []).map((id: number) => familiesData.find((f) => f.id === id)).filter(Boolean);
    return {
      ...p,
      sizes: sizesData.filter((s) => s.perfume_id === p.id),
      family: matchedFamilies[0] || null,
      families: matchedFamilies,
    };
  });
  
  return <CustomerExperience user={user} serverPerfumes={mergedPerfumes} serverFamilies={familiesData} />;
}
