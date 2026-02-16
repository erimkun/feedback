import { prisma } from "@/lib/prisma";
import FeedbackForm from "@/components/FeedbackForm";
import UsedLinkMessage from "@/components/UsedLinkMessage";
import { notFound } from "next/navigation";

interface FeedbackPageProps {
  params: Promise<{ id: string }>;
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { id } = await params;

  const feedback = await prisma.feedback.findUnique({
    where: { id },
  });

  // If not found, show 404
  if (!feedback) {
    notFound();
  }

  // If already used, show info message
  if (feedback.is_used) {
    return <UsedLinkMessage />;
  }

  // Valid feedback - render the form
  return <FeedbackForm feedbackId={feedback.id} target_name={feedback.target_name} />;
}
