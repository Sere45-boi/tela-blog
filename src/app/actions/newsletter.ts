"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function subscribeToNewsletter(formData: {
  email: string;
  firstName?: string;
  lastName?: string;
}) {
  const supabase = await createClient();

  // Basic validation
  if (!formData.email || !formData.email.includes("@")) {
    throw new Error("Invalid email address.");
  }

  const { error } = await supabase
    .from("subscribers")
    .insert([
      {
        email: formData.email.toLowerCase().trim(),
        first_name: formData.firstName?.trim(),
        last_name: formData.lastName?.trim(),
      },
    ]);

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation (already subscribed)
      return { success: true, message: "You're already subscribed!" };
    }
    throw new Error(error.message);
  }

  revalidatePath("/");
  return { success: true, message: "Welcome to the family! Check your inbox soon." };
}

export async function broadcastNewArticle(article: {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
}) {
  const supabase = await createClient();

  // 1. Fetch all active subscribers
  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("email, first_name")
    .eq("is_active", true);

  if (error) {
    console.error("Failed to fetch subscribers for broadcast:", error);
    return;
  }

  if (!subscribers || subscribers.length === 0) {
    console.log("No subscribers to notify.");
    return;
  }

  console.log(`Broadcasting new article "${article.title}" to ${subscribers.length} subscribers.`);

  // 2. "Send" emails (Placeholder/Mock)
  // In a real implementation, you would use a service like Resend here.
  // For now, we simulate the process.
  for (const subscriber of subscribers) {
    try {
      await sendPlaceholderEmail(subscriber.email, article);
    } catch (err) {
      console.error(`Failed to send email to ${subscriber.email}:`, err);
    }
  }
}

async function sendPlaceholderEmail(email: string, article: any) {
  // This is where you would integrate Resend or another provider.
  // Example:
  // await resend.emails.send({
  //   from: 'Tela Blog <newsletter@tela.ng>',
  //   to: email,
  //   subject: `New Article: ${article.title}`,
  //   html: `<p>Hi there! We just published a new article: <strong>${article.title}</strong></p><p>${article.excerpt}</p><a href="https://tela.ng/blog/${article.slug}">Read more</a>`
  // });
  
  // For now, we just log it.
  console.log(`[EMAIL SIMULATION] Sent to ${email}: New Article - ${article.title}`);
}
