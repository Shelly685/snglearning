import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { extractYouTubeId } from '@/lib/lms-logic';
import { AcademicGrade, CurriculumRegion, SubjectId } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return NextResponse.json(
        {
          error:
            'Gemini API key is not configured in Settings > Secrets. Please configure GEMINI_API_KEY to generate custom quizzes.',
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      videoUrl = '',
      topic = '',
      grade = 10,
      subject = 'mathematics',
      region = 'global',
    } = body as {
      videoUrl?: string;
      topic?: string;
      grade?: AcademicGrade;
      subject?: SubjectId;
      region?: CurriculumRegion;
    };

    const youtubeId = extractYouTubeId(videoUrl);
    if (!youtubeId) {
      return NextResponse.json(
        {
          error:
            'Please provide a valid YouTube video URL (e.g. https://www.youtube.com/watch?v=...) or 11-character video ID.',
        },
        { status: 400 }
      );
    }

    if (!topic.trim()) {
      return NextResponse.json(
        { error: 'Please provide the lesson topic or video title.' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Create a structured Grade ${grade} ${subject} lesson and quiz aligned with ${region.toUpperCase()} academic standards based on the educational video topic: "${topic.trim()}" (YouTube ID: ${youtubeId}).
Return:
- title: concise engaging lesson title
- subtitle: 1-sentence summary of what the student will master
- instructorNote: 1 practical tip for using the scratch whiteboard alongside this lesson
- notes: 2 sections with heading, 3 concise bullet points each, and optional keyFormula
- quiz: 3 high-quality multiple-choice questions with 4 options each, correctIndex (0-3), clear explanation, and approximate videoTimestamp (e.g. "02:30").`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a master curriculum designer for SNG Learning, crafting accurate Grade 1-12 quizzes and concise study notes for students worldwide.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            instructorNote: { type: Type.STRING },
            notes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  heading: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  keyFormula: { type: Type.STRING },
                },
                required: ['heading', 'bullets'],
              },
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  videoTimestamp: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['title', 'subtitle', 'instructorNote', 'notes', 'quiz'],
        },
      },
    });

    const raw = (response.text ?? '{}').trim();
    const parsed = JSON.parse(raw);

    return NextResponse.json({
      youtubeId,
      lessonData: parsed,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate video quiz.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
