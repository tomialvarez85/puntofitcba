import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/types/database";

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as Testimonial[]) ?? [];
}

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("testimonials").select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return (data as Testimonial | null) ?? null;
}

export async function getActiveTestimonials(limit = 8): Promise<Testimonial[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data as Testimonial[]) ?? [];
}
