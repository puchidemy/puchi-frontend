/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from "next/server";
import { mockDictationLesson } from "@/lib/mock-dictation-data";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In real implementation, fetch from database
    // const lesson = await prisma.dictationLesson.findUnique({
    //   where: { id: params.id },
    //   include: { questions: true }
    // });

    // For now, return mock data
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate DB query

    return NextResponse.json(mockDictationLesson);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
} 