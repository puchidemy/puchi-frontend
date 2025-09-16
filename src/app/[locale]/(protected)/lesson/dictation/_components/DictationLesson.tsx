"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Heart, Play } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

import type {
  DictationLesson,
  DictationAnswer,
  DictationWord,
} from "@/types/dictation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { dictationService } from "@/services/dictation.service";
import { shuffleArray } from "@/utils/shuffle-array";
import { useDrawerStore } from "@/store/drawer";

interface DictationLessonProps {
  lesson: DictationLesson;
  lessonId: string;
}

const DictationLessonComponent = ({
  lesson: initialLesson,
  lessonId,
}: DictationLessonProps) => {
  const router = useRouter();
  const { openDrawer } = useDrawerStore();
  const [lesson, setLesson] = useState<DictationLesson>(initialLesson);
  const [selectedWords, setSelectedWords] = useState<DictationWord[]>([]);
  const [shuffledWords, setShuffledWords] = useState<DictationWord[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQuestion = lesson.questions[lesson.currentQuestionIndex];
  const progress =
    ((lesson.currentQuestionIndex + 1) / lesson.totalQuestions) * 100;

  // Shuffle từ khi đổi câu hỏi
  useEffect(() => {
    setShuffledWords(shuffleArray(currentQuestion.wordOptions));
    setSelectedWords([]); // reset chọn từ
  }, [currentQuestion.wordOptions, lesson.currentQuestionIndex]);

  const remainingWords = shuffledWords.filter(
    (w) => !selectedWords.some((sw) => sw.id === w.id)
  );

  const isCompoundSentence = currentQuestion.correctAnswers.some(
    (answer) => answer.length > 1
  );

  const handleLessonComplete = async () => {
    try {
      const answers: DictationAnswer[] = []; // TODO: Collect user answers history
      await dictationService.completeLesson(lessonId, answers);
      router.push("/dictation");
    } catch (error) {
      console.error("Failed to complete lesson:", error);
    }
  };

  const handleLessonFailed = () => {
    router.push("/dictation");
  };

  const handleExit = () => {
    router.back();
  };

  const handleWordSelect = (word: DictationWord) => {
    if (isChecking) return;
    setSelectedWords((prev) => [...prev, word]);
  };

  const handleWordRemove = (word: DictationWord) => {
    if (isChecking) return;
    setSelectedWords((prev) => prev.filter((w) => w.id !== word.id));
  };

  const handleCheck = () => {
    if (selectedWords.length === 0) return;
    setIsChecking(true);

    const userAnswerIds = selectedWords.map((w) => w.id);

    const correct = currentQuestion.correctAnswers.some((answerSet) => {
      if (answerSet.length !== userAnswerIds.length) return false;
      return answerSet.every((id, index) => id === userAnswerIds[index]);
    });

    setIsCorrect(correct);

    // Create callback function for when drawer is closed
    const handleDrawerClose = () => {
      setIsChecking(false);
      setSelectedWords([]);
      if (correct) {
        if (lesson.currentQuestionIndex < lesson.totalQuestions - 1) {
          setLesson((prev) => ({
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
            progress:
              ((prev.currentQuestionIndex + 2) / prev.totalQuestions) * 100,
            score: prev.score + 10,
          }));
        } else {
          setLesson((prev) => ({
            ...prev,
            isCompleted: true,
            score: prev.score + 10,
          }));
          handleLessonComplete();
        }
      } else {
        setLesson((prev) => {
          const updated = { ...prev, lives: prev.lives - 1 };
          if (updated.lives <= 0) handleLessonFailed();
          return updated;
        });
      }
    };

    // Open drawer with result and callback
    openDrawer(
      {
        isCorrect: correct,
        message: correct ? "Correct!" : "Incorrect!",
        explanation: currentQuestion.explanation,
        score: correct ? 10 : 0,
      },
      handleDrawerClose
    );
  };

  const handleSkip = () => {
    if (isChecking) return;
    const updatedLesson = {
      ...lesson,
      lives: lesson.lives - 1,
      currentQuestionIndex: lesson.currentQuestionIndex + 1,
      progress:
        ((lesson.currentQuestionIndex + 2) / lesson.totalQuestions) * 100,
    };
    setLesson(updatedLesson);
    setSelectedWords([]);
    if (updatedLesson.lives <= 0) {
      handleLessonFailed();
    }
  };

  if (lesson.isCompleted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson Completed!</h1>
          <p className="text-muted-foreground mb-4">Score: {lesson.score}</p>
          <Button onClick={handleExit}>Exit</Button>
        </div>
      </div>
    );
  }

  if (lesson.lives <= 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Out of Lives!</h1>
          <p className="text-muted-foreground mb-4">Try again later</p>
          <Button onClick={handleExit}>Exit</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-screen-lg w-full mx-auto bg-background flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={handleExit}>
          <X className="h-5 w-5" />
        </Button>
        <div className="flex-1 mx-4">
          <Progress value={progress} className="h-2" />
        </div>
        <div className="flex items-center gap-1">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          <span className="text-sm font-medium">{lesson.lives}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 mx-auto w-full">
        {/* Question Type Badge */}
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            {currentQuestion.type === "new_word" ? "NEW WORD" : "REVIEW"}
          </div>
          {currentQuestion.type === "new_word" && (
            <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">💀</span>
            </div>
          )}
          {isCompoundSentence && (
            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              SENTENCE
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-center mb-4">
          {currentQuestion.instruction}
        </h2>

        {isCompoundSentence && selectedWords.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="text-sm text-blue-700 text-center">
              💡 <strong>Tip:</strong> Select words in the correct order to form
              a sentence.
            </div>
          </motion.div>
        )}

        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-purple-500 mb-2">
            {currentQuestion.targetWord}
          </div>
          {currentQuestion.audioUrl && (
            <Button variant="ghost" size="sm" className="mt-2">
              <Play className="h-4 w-4 mr-2" />
              Listen
            </Button>
          )}
        </div>

        {/* Selected Words */}
        <div className="relative w-full flex flex-col items-center mb-8">
          <div className="flex flex-wrap gap-2 min-h-[48px] items-center justify-center w-full z-10">
            <AnimatePresence>
              {selectedWords.map((word) => (
                <motion.div
                  key={word.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="min-w-fit px-4 py-2 text-base"
                    onClick={() => handleWordRemove(word)}
                    disabled={isChecking}
                  >
                    {word.text}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            {selectedWords.length === 0 && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                className="h-10"
              />
            )}
          </div>
          <div className="absolute left-0 right-0 bottom-0 w-full max-w-md mx-auto h-0.5 border-b border-muted-foreground pointer-events-none" />
        </div>

        {/* Remaining Words */}
        <LayoutGroup>
          <div className="flex flex-wrap gap-2 w-full justify-center mb-8">
            <AnimatePresence>
              {remainingWords.map((word) => (
                <motion.div
                  key={word.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="default"
                    size="sm"
                    className="min-w-fit px-4 py-2 text-base"
                    onClick={() => handleWordSelect(word)}
                    disabled={isChecking}
                  >
                    {word.text}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-between items-center p-4 border-t border-border">
        <Button variant="ghost" onClick={handleSkip} disabled={isChecking}>
          SKIP
        </Button>
        <Button
          onClick={handleCheck}
          disabled={selectedWords.length === 0 || isChecking}
          variant="correct"
        >
          CHECK
        </Button>
      </div>
    </div>
  );
};

export default DictationLessonComponent;
