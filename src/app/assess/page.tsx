"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage, ParsedInput, Skill } from "@/lib/types";

export default function AssessPage() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [parsed, setParsed] = useState<ParsedInput | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [skillIndex, setSkillIndex] = useState(0);
  const [done, setDone] = useState(false);

  // Load session data
  useEffect(() => {
    const raw = sessionStorage.getItem("catalyst_parsed");
    if (!raw) { router.push("/"); return; }
    const p: ParsedInput = JSON.parse(raw);
    setParsed(p);

    // Kick off with the first question
    const firstQ = p.skills[0]?.questions[0];
    if (firstQ) {
      setHistory([{ role: "assistant", content: `Hi! I'm your Catalyst assessor. Let's evaluate your fit for the **${p.role}** role.\n\n${firstQ}` }]);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSend = async () => {
    if (!input.trim() || loading || !parsed) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setInput("");

    // Record the answer on the current skill
    const updatedParsed = { ...parsed };
    updatedParsed.skills = parsed.skills.map((s, i) =>
      i === skillIndex ? { ...s, answers: [input.trim()] } : s
    );
    setParsed(updatedParsed);
    sessionStorage.setItem("catalyst_parsed", JSON.stringify(updatedParsed));

    const nextSkillIndex = skillIndex + 1;
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setLoading(true);

    if (nextSkillIndex >= parsed.skills.length) {
      // All skills covered
      setHistory([...newHistory, {
        role: "assistant",
        content: "Thank you — that's all the questions I have! I'm now compiling your full assessment report. This will just take a moment… 🎯",
      }]);
      setDone(true);
      setLoading(false);

      // Generate report
      const jd = sessionStorage.getItem("catalyst_jd") ?? "";
      const resume = sessionStorage.getItem("catalyst_resume") ?? "";
      const res = await fetch("/api/claude/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd, resume, history: newHistory, parsedInput: updatedParsed }),
      });
      const report = await res.json();
      sessionStorage.setItem("catalyst_report", JSON.stringify(report));
      setTimeout(() => router.push("/results"), 2000);
      return;
    }

    // Get next question via chat API
    const nextSkill = parsed.skills[nextSkillIndex];
    const nextQ = nextSkill.questions[0];
    const currentSkill = parsed.skills[skillIndex];

    const res = await fetch("/api/claude/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history: newHistory,
        nextQuestion: nextQ,
        role: parsed.role,
        skillName: nextSkill.name,
      }),
    });
    const { reply } = await res.json();
    setHistory([...newHistory, { role: "assistant", content: reply }]);
    setSkillIndex(nextSkillIndex);
    setLoading(false);
  };

  if (!parsed) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
      Loading…
    </div>
  );

  const progress = Math.min((skillIndex / parsed.skills.length) * 100, 100);

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">C</div>
          <span className="font-semibold text-white">Catalyst</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>Assessing: <span className="text-white">{parsed.candidateName}</span></span>
          <span>·</span>
          <span>{parsed.role}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-brand-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Skill pills */}
      <div className="flex gap-2 px-6 py-3 overflow-x-auto border-b border-gray-800">
        {parsed.skills.map((s, i) => (
          <span
            key={i}
            className={`text-xs px-3 py-1 rounded-full border whitespace-nowrap transition ${
              i < skillIndex
                ? "bg-brand-800 border-brand-600 text-brand-100"
                : i === skillIndex
                ? "bg-brand-500 border-brand-500 text-white font-medium"
                : "bg-gray-900 border-gray-700 text-gray-500"
            }`}
          >
            {i < skillIndex ? "✓ " : ""}{s.name}
          </span>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-3xl w-full mx-auto">
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-brand-500 text-white"
                  : "bg-gray-800 text-gray-200"
              }`}
              dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
            />
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 px-4 py-3 rounded-2xl text-sm">
              <span className="animate-pulse">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!done && (
        <div className="border-t border-gray-800 px-6 py-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <textarea
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500 resize-none"
              rows={2}
              placeholder="Type your answer…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white px-5 rounded-xl font-medium text-sm transition self-end pb-3 pt-3"
            >
              Send
            </button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      )}
    </main>
  );
}
