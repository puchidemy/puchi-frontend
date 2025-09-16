import { Suspense } from "react";
import LoadingCustom from "@/components/LoadingCustom";
import { dictationService } from "@/services/dictation.service";
import DictationLessonComponent from "../_components/DictationLesson";

interface DictationPageProps {
  params: Promise<{
    id: string;
  }>;
}

const DictationPage = async ({ params }: DictationPageProps) => {
  const { id } = await params;
  const lessonData = await dictationService.getLesson(id);

  return (
    <Suspense fallback={<LoadingCustom />}>
      <DictationLessonComponent lesson={lessonData} lessonId={id} />
    </Suspense>
  );
};

export default DictationPage;