"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AssessmentReport } from "@/lib/types";

const severityColor = {
  critical: "text-red-400 bg-red-950 border-red-800",
  moderate: "text-yellow-400 bg-yellow-950 border-yellow-800",
  minor: "text-blue-400 bg-blue-950 border-blue-800",
};

export default function ResultsPage() {
  const router = useRouter();
  const [report, setReport] = useState<AssessmentReport | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("catalyst_report");
    if (!raw) { router.push("/"); return; }
    setReport(JSON.parse(raw));
  }, []);

  if (!report) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
      Loading report…
    </div>
  );

  const fitColor =
    report.overallScore >= 80 ? "text-green-400" :
    report.overallScore >= 60 ? "text-yellow-400" :
    report.overallScore >= 40 ? "text-orange-400" : "text-red-400";

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 pb-20">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">C</div>
          <span className="font-semibold text-white">Catalyst</span>
          <span className="text-gray-500 text-sm">Assessment Report</span>
        </div>
        <button
          onClick={() => { sessionStorage.clear(); router.push("/"); }}
          className="text-sm text-brand-500 hover:text-brand-100 transition"
        >
          ← New Assessment
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-10 space-y-10">

        {/* Hero score */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">{report.role}</p>
          <h1 className="text-3xl font-bold text-white mb-4">{report.candidateName}</h1>
          <div className={`text-7xl font-black mb-2 ${fitColor}`}>{report.overallScore}</div>
          <div className={`text-lg font-semibold ${fitColor}`}>{report.fitLabel}</div>
        </div>

        {/* Skill scores */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Skill Breakdown</h2>
          <div className="space-y-3">
            {report.skills.map((s, i) => (
              <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{s.name}</span>
                  <span className={`font-bold ${s.finalScore >= 7 ? "text-green-400" : s.finalScore >= 5 ? "text-yellow-400" : "text-red-400"}`}>
                    {s.finalScore.toFixed(1)}/10
                  </span>
                </div>
                {/* Bar */}
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${s.finalScore >= 7 ? "bg-green-500" : s.finalScore >= 5 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${(s.finalScore / 10) * 100}%` }}
                  />
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Resume: {s.resumeScore}/10 (30%)</span>
                  <span>Interview: {s.interviewScore}/10 (70%)</span>
                </div>
                {s.questions[0] && (
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="text-gray-500 italic">Q: {s.questions[0]}</p>
                    {s.answers[0] && <p className="text-gray-300">A: {s.answers[0]}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Gap analysis */}
        {report.gaps.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Gap Analysis</h2>
            <div className="flex flex-wrap gap-3">
              {report.gaps.map((g, i) => (
                <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${severityColor[g.severity]}`}>
                  <span>{g.skill}</span>
                  <span className="opacity-70">{g.score.toFixed(1)}/10</span>
                  <span className="capitalize opacity-80">· {g.severity}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Learning plan */}
        {report.learningPlan.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Personalised Learning Plan</h2>
            <div className="space-y-3">
              {report.learningPlan.map((item, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-brand-800 text-brand-100 px-2 py-0.5 rounded-full">{item.weekEstimate}</span>
                        <span className="font-medium text-white">{item.skill}</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-1">{item.rationale}</p>
                      <p className="text-sm text-brand-500">{item.resource}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hiring recommendation */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Hiring Recommendation</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-gray-300 leading-relaxed">
            {report.hiringRecommendation}
          </div>
        </section>

      </div>
    </main>
  );
}
