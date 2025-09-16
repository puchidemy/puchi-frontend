"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { CirclePause, CirclePlay } from "lucide-react";
import { getLessonData } from "@/services/lesson.service";
import { Lesson } from "@/types/learn";

const LessonStory = () => {
  const { id } = useParams<{ id: string }>();
  const [lessonData, setLessonData] = useState<Lesson | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (id) {
        const data = await getLessonData(id as string);
        setLessonData(data);
      }
    };

    if (id) {
      fetchLessonData();
    }
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Lọc ra những từ đang được phát
  const getHighlightedWords = (currentTime: number) => {
    if (!lessonData) return [];
    return lessonData.unit.sentences.flatMap((sentence) =>
      sentence.words.filter(
        (word) => currentTime >= word.startTime && currentTime <= word.endTime
      )
    );
  };

  const highlightedWords = getHighlightedWords(currentTime);

  return (
    <div className="lg:w-[900px] w-full bg-background">
      <div className="text-lg font-bold">Lesson Story</div>
      {lessonData ? (
        <div>
          <h2>{lessonData.unit.title}</h2>
          {lessonData.unit.sentences.map((sentence) => (
            <div key={sentence.id} className="my-2">
              <p>
                {sentence.words.map((word) => (
                  <span
                    key={word.id}
                    className={
                      highlightedWords.some((w) => w.id === word.id)
                        ? "text-green-500 font-bold"
                        : ""
                    }
                  >
                    {word.word}{" "}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading lesson...</p>
      )}
      <div className="flex justify-center mt-4">
        <button
          onClick={handlePlayPause}
          className="p-2 bg-blue-500 text-white rounded"
        >
          {isPlaying ? <CirclePause size={32} /> : <CirclePlay size={32} />}
        </button>
      </div>
      <audio
        ref={audioRef}
        src="https://res.cloudinary.com/cloudinaryhoan/video/upload/v1734634404/puchi/audio/photo_yxj9ya.mp3"
      />
    </div>
  );
};

export default LessonStory;
