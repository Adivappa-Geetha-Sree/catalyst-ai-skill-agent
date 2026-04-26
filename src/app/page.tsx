"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ParsedInput } from "@/lib/types";

const SAMPLE_JD = `Customer Care Specialist – E-Commerce (Remote)

We are looking for a Customer Care Specialist to join our growing support team. You will be the first point of contact for customers, resolving issues with empathy and efficiency.

Responsibilities:
- Handle inbound customer inquiries via chat, email, and phone
- Resolve order disputes, returns, and complaints in a timely manner
- Use Zendesk CRM to log and track all customer interactions
- De-escalate emotionally charged situations with professionalism
- Collaborate with fulfillment and logistics teams to resolve delivery issues
- Maintain a CSAT score above 90%
- Document common issues to contribute to the help center

Requirements:
- 2+ years of customer support experience, preferably in e-commerce
- Proficiency with CRM tools (Zendesk, Freshdesk, or similar)
- Strong written and verbal communication skills
- Conflict resolution and de-escalation skills
- Ability to multitask across multiple support channels
- Familiarity with e-commerce platforms (Shopify, WooCommerce)`;

const SAMPLE_RESUME = `Sarah Johnson
sarah.johnson@email.com | LinkedIn: linkedin.com/in/sarahjohnson

SUMMARY
Dedicated customer support professional with 3 years of experience in e-commerce environments. Known for empathetic communication and maintaining high customer satisfaction scores.

EXPERIENCE
Customer Support Agent — ShopEasy (2022–Present)
- Handle 80+ customer inquiries daily via Zendesk (chat and email)
- Achieved consistent CSAT of 93% over 18 months
- Resolved escalated complaints, reducing escalation rate by 18%
- Trained 4 new agents on support workflows and tone guidelines

Retail Sales Associate — FashionHub (2020–2022)
- Assisted customers with product selection and returns
- Handled complaints and exchanges in a fast-paced retail environment

SKILLS
Zendesk, Freshdesk, Shopify, Gmail, Slack
Active listening, conflict resolution, written communication
Multitasking, time management

EDUCATION
B.A. Communications — University of Hyderabad, 2020`;

export default function HomePage() {
  const router = useRouter();
  const [jd, setJd] = useState("");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    if (!jd.trim() || !resume.trim()) {
      setError("Please fill in both the Job Description and Resume.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/claude/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, resume }),
      });

      if (!res.ok) throw new Error("Parsing failed");

      const parsed: ParsedInput = await res.json();

      sessionStorage.setItem("catalyst_jd", jd);
      sessionStorage.setItem("catalyst_resume", resume);
      sessionStorage.setItem("catalyst_parsed", JSON.stringify(parsed));

      router.push("/assess");
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setJd(SAMPLE_JD);
    setResume(SAMPLE_RESUME);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">C</div>
        <span className="font-semibold text-white">Catalyst</span>
        <span className="text-gray-500 text-sm">AI Skill Assessment Agent</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">
            Know exactly where candidates stand
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Paste a job description and a resume. Catalyst extracts the critical skills,
            interviews the candidate adaptively, and generates a personalised gap analysis + learning plan.
          </p>
          <button
            onClick={loadSample}
            className="mt-4 text-sm text-brand-500 underline underline-offset-2 hover:text-brand-100 transition"
          >
            Load a sample (Customer Care role)
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-10 text-sm">
          {["1. Paste JD + Resume", "2. Answer 6 questions", "3. Get your report"].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-px bg-gray-700" />}
              <span className={i === 0 ? "text-brand-500 font-medium" : "text-gray-500"}>{s}</span>
            </div>
          ))}
        </div>

        {/* Input grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">
              Job Description
            </label>
            <textarea
              className="flex-1 min-h-64 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500 resize-none transition"
              placeholder="Paste the full job description here…"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">
              Candidate Resume
            </label>
            <textarea
              className="flex-1 min-h-64 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500 resize-none transition"
              placeholder="Paste the candidate's resume text here…"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleStart}
            disabled={loading}
            className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl transition text-base"
          >
            {loading ? "Analysing JD + Resume…" : "Start Assessment →"}
          </button>
        </div>
      </div>
    </main>
  );
}
