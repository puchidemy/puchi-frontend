import { TrialLessonPlayer } from "@/components/learn/TrialLessonPlayer";

interface TrialLessonPageProps {
  params: Promise<{ id: string }>;
}

export default async function TrialLessonPage({ params }: TrialLessonPageProps) {
  const { id } = await params;
  return <TrialLessonPlayer lessonId={id} />;
}
