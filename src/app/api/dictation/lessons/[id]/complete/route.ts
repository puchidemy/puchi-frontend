/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { answers } = body;

    // In real implementation, calculate final results and update user progress
    // const result = await calculateLessonResults(params.id, answers);
    // await updateUserStats(params.id, result);

    // For now, return mock response
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing

    const correctAnswers = answers.filter((a: any) => a.isCorrect).length;
    const totalQuestions = answers.length;
    const score = correctAnswers * 10;
    const timeSpent = answers.reduce((total: number, a: any) => total + a.timeSpent, 0);
    const xpEarned = Math.floor(score * 0.5);

    return NextResponse.json({
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      xpEarned,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to complete lesson" },
      { status: 500 }
    );
  }
} 