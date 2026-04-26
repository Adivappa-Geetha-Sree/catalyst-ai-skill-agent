import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { history, nextQuestion, role, skillName } = await req.json();

  const systemPrompt = `You are a warm, professional interviewer conducting a skill assessment for a "${role}" position.

Your job is to:
1. Briefly acknowledge the candidate's previous answer (1–2 sentences, empathetic and specific to what they said).
2. Naturally transition to the next question about "${skillName}".
3. Keep your total response to 3–5 sentences max.

IMPORTANT: Stay focused on the "${role}" role context. Do NOT ask about unrelated technical skills. Keep the conversation natural and supportive.`;

  const messages = [
    ...history,
    {
      role: "user" as const,
      content: `Now ask this next question naturally, after acknowledging my previous answer: "${nextQuestion}"`,
    },
  ];

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature: 0.5,
  });

  const reply = completion.choices[0].message.content ?? "";
  return NextResponse.json({ reply });
}
