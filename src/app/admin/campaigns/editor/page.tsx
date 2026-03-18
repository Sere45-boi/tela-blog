import { createClient } from "@/utils/supabase/server";
import { AdEditorClient } from "./AdEditorClient";

export default async function AdEditorPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const supabase = await createClient();
  
  let ad = null;
  if (id) {
    const { data } = await supabase
      .from("ads")
      .select("*")
      .eq("id", id)
      .single();
    ad = data;
  }

  return <AdEditorClient ad={ad} />;
}
