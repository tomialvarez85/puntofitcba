import { notFound } from "next/navigation";
import TestimonialForm from "@/components/admin/TestimonialForm";
import { getTestimonialById } from "@/lib/data/testimonials";

type EditTestimonialPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTestimonialPage({ params }: EditTestimonialPageProps) {
  const { id } = await params;
  const testimonial = await getTestimonialById(id);

  if (!testimonial) {
    notFound();
  }

  return <TestimonialForm testimonial={testimonial} mode="edit" />;
}
