import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { jd, resume } = await req.json();

  const prompt = `You are an expert technical recruiter and skill assessor.

You will be given a Job Description (JD) and a candidate's Resume. Your job is to:
1. Extract the candidate's name and the role from the JD.
2. Identify the 6 MOST CRITICAL skills required by THIS SPECIFIC JD (not generic skills — read the JD carefully).
3. For each skill, score how well the resume demonstrates it (1–10).
4. Generate 1 targeted interview question per skill that is SPECIFIC to this role and this candidate's background.

IMPORTANT RULES:
- Skills must come DIRECTLY from the JD. If it's a customer service role, skills should be things like "Conflict Resolution", "CRM Software", "Active Listening", etc. — NOT software development skills.
- Questions must be relevant to the role. A customer care question should ask about handling difficult customers, not about writing code.
- Base resume scores on actual evidence in the resume for this specific skill.

Job Description:
${jd}

Resume:
${resume}

Respond ONLY with a valid JSON object in this exact shape (no markdown, no extra text):
{
  "candidateName": "string",
  "role": "string",
  "skills": [
    {
      "name": "skill name from JD",
      "resumeScore": 7,
      "interviewScore": 0,
      "finalScore": 0,
      "questions": ["One targeted question about this specific skill for this specific role"],
      "answers": []
    }
  ]
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const raw = completion.choices[0].message.content ?? "{}";
  const clean = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Failed to parse response", raw }, { status: 500 });
  }
}
