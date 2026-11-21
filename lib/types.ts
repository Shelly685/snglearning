export type CurriculumRegion =
  | 'global'
  | 'india'
  | 'usa'
  | 'uk'
  | 'ib';

export type AcademicGrade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type LearningMode = 'grade' | 'topic';

export type SubjectId =
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'computer-science'
  | 'history'
  | 'economics'
  | 'english';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  videoTimestamp?: string;
}

export interface LessonNoteSection {
  heading: string;
  bullets: string[];
  keyFormula?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  grade: AcademicGrade;
  academicYear: string;
  subject: SubjectId;
  subjectLabel: string;
  topic: string;
  regions: CurriculumRegion[];
  boardAlignment: string;
  durationMinutes: number;
  videoProvider: 'youtube';
  youtubeId: string;
  sourceChannel: string;
  instructorNote: string;
  notes: LessonNoteSection[];
  quiz: QuizQuestion[];
  isTopicTrack?: boolean;
  isCustom?: boolean;
}

export interface BoardStroke {
  id: string;
  tool: 'pen' | 'highlighter' | 'eraser' | 'line' | 'rect' | 'circle';
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export interface ClassChatMessage {
  id: string;
  sender: string;
  role: 'teacher' | 'student';
  text: string;
  timestamp: string;
}

export interface LivePoll {
  id: string;
  question: string;
  options: { id: string; label: string; votes: number }[];
  active: boolean;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  breakdown: {
    questionId: string;
    selectedIndex: number | null;
    correctIndex: number;
    isCorrect: boolean;
  }[];
}
