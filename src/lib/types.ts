export interface Skill {
  name: string;
  resumeScore: number; // 1–10 based on resume evidence
  interviewScore: number; // 1–10 based on interview answers
  finalScore: number; // weighted: 30% resume + 70% interview
  questions: string[]; // 1–2 questions specific to this skill
  answers: string[];
}

export interface ParsedInput {
  candidateName: string;
  role: string;
  skills: Skill[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GapItem {
  skill: string;
  score: number;
  severity: "critical" | "moderate" | "minor";
}

export interface LearningItem {
  skill: string;
  resource: string;
  rationale: string;
  weekEstimate: string;
}

export interface AssessmentReport {
  candidateName: string;
  role: string;
  overallScore: number;
  fitLabel: string;
  skills: Skill[];
  gaps: GapItem[];
  learningPlan: LearningItem[];
  hiringRecommendation: string;
}
