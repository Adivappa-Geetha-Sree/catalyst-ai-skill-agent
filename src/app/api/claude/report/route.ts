import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { Skill } from "@/lib/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { jd, resume, history, parsedInput } = await req.json();

  const skillsSummary = parsedInput.skills
    .map((s: Skill, i: number) => `Skill ${i + 1}: ${s.name}\n  Question: ${s.questions[0]}\n  Answer: ${s.answers[0] ?? "(no answer)"}`)
    .join("\n\n");

  const prompt = `You are an expert recruiter evaluating a candidate for a "${parsedInput.role}" role.

Job Description:
${jd}

Resume:
${resume}

Interview Q&A for each skill:
${skillsSummary}

Based on the above, generate a complete assessment report. Score each skill's interview performance honestly based on the answer depth, specificity, and relevance to the "${parsedInput.role}" role.

Resume evidence scores (already assessed):
${parsedInput.skills.map((s: Skill) => `${s.name}: ${s.resumeScore}/10`).join(", ")}

Final score formula: finalScore = (resumeScore × 0.3) + (interviewScore × 0.7). Round to 1 decimal.
Overall fit score = average of all finalScores × 10 (so it's out of 100).

Gap severity: score < 4 = critical, 4–5.9 = moderate, 6–7 = minor. Only include skills < 7 as gaps.

Learning plan: recommend ADJACENT skills the candidate can realistically learn given their background. Resources must be real (Coursera, YouTube, official docs, books). Tie each recommendation to the specific gap.

Hiring labels: 80+ = Strong Fit, 60–79 = Moderate Fit, 40–59 = Needs Development, <40 = Not Recommended.

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "candidateName": "${parsedInput.candidateName}",
  "role": "${parsedInput.role}",
  "overallScore": 72,
  "fitLabel": "Moderate Fit",
  "skills": [
    {
      "name": "skill name",
      "resumeScore": 7,
      "interviewScore": 6,
      "finalScore": 6.3,
      "questions": ["the question asked"],
      "answers": ["the candidate's answer"]
    }
  ],
  "gaps": [
    { "skill": "skill name", "score": 4.2, "severity": "moderate" }
  ],
  "learningPlan": [
    {
      "skill": "skill to learn",
      "resource": "Specific course or resource name and URL",
      "rationale": "Why this helps given their background",
      "weekEstimate": "Week 1–2"
    }
  ],
  "hiringRecommendation": "2–3 sentence summary for the recruiter"
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const raw = completion.choices[0].message.content ?? "{}";
  const clean = raw.replace(/```json|```/g, "").trim();

  try {
    const report = JSON.parse(clean);
    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "Failed to parse report", raw }, { status: 500 });
  }
}
