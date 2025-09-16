/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { questionId, userAnswer, timeSpent } = body;

    // In real implementation, validate answer and update progress
    // const result = await validateAnswer(params.id, questionId, userAnswer);
    // await updateUserProgress(params.id, result);

    // For now, return mock response
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing

    const isCorrect = Math.random() > 0.3; // 70% success rate for demo

    return NextResponse.json({
      isCorrect,
      correctAnswer: "Hi",
      explanation: "Chào! means 'Hi' or 'Hello' in Vietnamese",
      score: isCorrect ? 10 : 0,
      lives: isCorrect ? 5 : 4,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    );
  }
} 