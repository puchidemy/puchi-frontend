import { LessonPlayer } from "@/components/learn/LessonPlayer";

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  return <LessonPlayer lessonId={id} />;
}
