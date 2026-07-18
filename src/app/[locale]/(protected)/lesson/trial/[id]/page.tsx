import { redirect } from "next/navigation";

interface TrialLessonPageProps {
  params: Promise<{ id: string; locale: string }>;
}

/** @deprecated Prefer /lesson/[id] — kept as redirect for old trial links. */
export default async function TrialLessonPage({ params }: TrialLessonPageProps) {
  const { id, locale } = await params;
  redirect(`/${locale}/lesson/${id}`);
}
