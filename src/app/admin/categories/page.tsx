import { createClient } from "@/utils/supabase/server";
import { GsapReveal } from "@/components/GsapReveal";

export const metadata = {
  title: "Taxonomies | Tela CMS",
};

export default async function AdminCategoriesList() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="max-w-4xl">
      <GsapReveal direction="up" className="mb-10">
        <h1 className="text-3xl font-medium tracking-tight mb-2">Taxonomies</h1>
        <p className="text-muted-foreground">Manage your blog categories and topics.</p>
      </GsapReveal>

      <GsapReveal direction="up" delay={0.1}>
        <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden p-6">
          <p className="text-muted-foreground mb-6">Taxonomy management is coming in a future update. For now, please use the Supabase dashboard to seed default categories.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories?.map((cat) => (
              <div key={cat.id} className="p-4 rounded-xl border border-border bg-muted/20">
                <h3 className="font-medium">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">/{cat.slug}</p>
              </div>
            ))}
          </div>
        </div>
      </GsapReveal>
    </div>
  );
}
