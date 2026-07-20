import { LessonPlayer } from "@/components/learn/LessonPlayer";

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

/**
 * @deprecated Legacy Unit/Lesson player — bookmarks only.
 * Main path: `/learn` → city → `/learn/story/[storyId]`.
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  return <LessonPlayer lessonId={id} />;
}
