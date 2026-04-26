# 🚀 Catalyst — AI Skill Assessment Agent

> **Catalyst** is an AI-powered agent that takes a Job Description and a candidate's resume, conversationally assesses real proficiency on each required skill, identifies gaps, and generates a personalised learning plan with curated resources and time estimates.

Built for **Catalyst Hackathon** · Submission deadline: April 27, 2026

---

## 🔗 Links

| | |
|---|---|
| **Live Demo** | [catalyst-skill-assessment.vercel.app](https://catalyst-skill-assessment.vercel.app) |
| **Demo Video** | (https://www.loom.com/share/cf9ddccc10e44701b9c32541cb19fec3) |
| **GitHub** | [github.com/YOUR_USERNAME/catalyst-skill-assessment](#) |

---

## 🎯 What It Does

A resume tells you what someone *claims* to know — not how well they actually know it.

**Catalyst bridges that gap:**

1. **Parses the JD + Resume** — extracts the 6 most critical skills *specific to that role* (not generic tech skills)
2. **Conducts an adaptive interview** — asks one targeted question per skill, acknowledges each answer naturally
3. **Scores with weighted evidence** — Resume (30%) + Interview (70%) = final skill score
4. **Identifies gaps** — flags skills below threshold as critical / moderate / minor
5. **Generates a learning plan** — adjacent, achievable skills with real named resources and week estimates
6. **Produces a hiring report** — overall fit score (0–100) + recruiter recommendation

---

## ✨ Features

- ✅ Role-aware skill extraction — Customer Care roles get CRM/Conflict Resolution questions, not coding questions
- ✅ Adaptive conversational assessment — 6-question interview that feels natural, not robotic
- ✅ Weighted scoring — Resume evidence (30%) + Interview depth (70%)
- ✅ Gap analysis with severity levels — critical / moderate / minor
- ✅ Personalised 8-week learning plan with real resources (Coursera, YouTube, docs)
- ✅ Hiring recommendation summary for recruiters
- ✅ Progress tracker showing skills assessed in real-time
- ✅ One-click sample data to demo instantly

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Next.js App (Vercel)                    │
├─────────────────┬──────────────────┬─────────────────────┤
│   Page: /       │   Page: /assess  │   Page: /results    │
│   Input         │   Chat UI        │   Report            │
│   JD + Resume   │   6 questions    │   Scores + Plan     │
└────────┬────────┴────────┬─────────┴──────────┬──────────┘
         │                 │                     │
         ▼                 ▼                     ▼
┌──────────────────────────────────────────────────────────┐
│             Next.js API Routes (server-side)              │
│                                                           │
│  POST /api/claude/parse   ← JD + Resume → 6 Skills       │
│  POST /api/claude/chat    ← History + nextQ → Reply      │
│  POST /api/claude/report  ← Transcript → Full Report     │
└───────────────────────────┬──────────────────────────────┘
                            │  GROQ_API_KEY (server only)
                            ▼
               ┌────────────────────────┐
               │   Groq API             │
               │   llama-3.3-70b        │
               └────────────────────────┘
```

### Data Flow

```
User pastes JD + Resume
        ↓
/api/claude/parse  →  Extracts 6 role-specific skills
                       + resume scores (1–10)
                       + 1 targeted question per skill
        ↓
/assess page  →  Shows question 1
                  User answers → stored in sessionStorage
                  /api/claude/chat acknowledges + asks Q2
                  Repeat × 6
        ↓
/api/claude/report  →  Scores all interview answers
                        Computes weighted final scores
                        Identifies gaps
                        Generates learning plan
        ↓
/results page  →  Full report rendered
```

---

## 📊 Scoring Logic

| Phase | Weight | Method |
|-------|--------|--------|
| Resume evidence | **30%** | LLM estimates 1–10 based on keywords, years of experience, specificity in resume text |
| Interview performance | **70%** | LLM evaluates depth, specificity, real-world examples, edge-case awareness |
| Final skill score | — | `(resumeScore × 0.3) + (interviewScore × 0.7)` |
| Overall fit | — | Average of 6 final scores × 10 → **0–100** |

### Gap Thresholds

| Score | Severity |
|-------|----------|
| < 4.0 | 🔴 Critical |
| 4.0 – 5.9 | 🟡 Moderate |
| 6.0 – 6.9 | 🔵 Minor |
| 7.0+ | ✅ Strong — not flagged |

### Fit Labels

| Score | Label |
|-------|-------|
| 80–100 | Strong Fit |
| 60–79 | Moderate Fit |
| 40–59 | Needs Development |
| < 40 | Not Recommended |

### Why 30/70 split?
Resume is self-reported — easy to inflate. Interview answers reveal actual depth of understanding. The 70% weight on interview ensures the score reflects real ability, not keyword stuffing.

### Why "adjacent skills" for the learning plan?
Recommending skills the candidate has zero foundation for leads to abandonment. Adjacent skills build on what they already know, making the plan achievable within the 8-week window.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI Model | Groq — `llama-3.3-70b-versatile` |
| AI SDK | `groq-sdk` |
| State | `sessionStorage` (client-side, no DB needed) |
| Deployment | Vercel |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Step 1: Input JD + Resume
│   ├── assess/
│   │   └── page.tsx              # Step 2: Conversational interview
│   ├── results/
│   │   └── page.tsx              # Step 3: Full assessment report
│   ├── globals.css
│   ├── layout.tsx
│   └── api/claude/
│       ├── parse/route.ts        # Extracts skills from JD + resume
│       ├── chat/route.ts         # Generates adaptive interview replies
│       └── report/route.ts       # Generates assessment report
└── lib/
    └── types.ts                  # Shared TypeScript interfaces
```

---

## 🧪 Sample Input / Output

### Input — Job Description
```
Customer Care Specialist – E-Commerce (Remote)

Handle inbound customer inquiries via chat, email, and phone.
Resolve order disputes, returns, and complaints.
Use Zendesk CRM to log all interactions.
De-escalate emotionally charged situations professionally.
Maintain CSAT score above 90%.

Requirements: 2+ years customer support, Zendesk/Freshdesk,
strong written/verbal communication, conflict resolution,
Shopify/WooCommerce familiarity.
```

### Input — Resume
```
Sarah Johnson — Customer Support Agent at ShopEasy (2022–Present)
- 80+ daily inquiries via Zendesk (chat + email)
- CSAT: 93% over 18 months
- Reduced escalation rate by 18%
- Trained 4 new agents on tone and workflows
Skills: Zendesk, Freshdesk, Shopify, conflict resolution, active listening
```

### Output — Assessment Report
```
Overall Score:  78 / 100  →  Moderate Fit

Skill Scores:
  ✅ CRM Software (Zendesk)     8.4 / 10  (Resume: 9, Interview: 8)
  ✅ Written Communication      7.6 / 10  (Resume: 7, Interview: 8)
  ✅ Conflict Resolution        7.2 / 10  (Resume: 7, Interview: 7.5)
  🔵 CSAT & KPIs               6.5 / 10  (Resume: 8, Interview: 5.5)
  🟡 Multi-channel Support      5.8 / 10  (Resume: 6, Interview: 5.5)
  🟡 E-commerce Platforms       5.0 / 10  (Resume: 6, Interview: 4.5)

Gaps:
  🟡 Multi-channel Support    5.8  (moderate)
  🟡 E-commerce Platforms     5.0  (moderate)

Learning Plan:
  Week 1–2  →  Multi-channel triage: Intercom + phone basics (Udemy)
  Week 3–4  →  Shopify for Support Agents (Shopify Academy, free)
  Week 5–6  →  Advanced Zendesk workflows & macros (Zendesk Training)
  Week 7–8  →  CSAT optimisation & metrics (Support Driven community)

Hiring Recommendation:
  Sarah is a strong candidate with proven Zendesk experience and
  excellent CSAT track record. Minor gaps in phone support and
  e-commerce platform depth are bridgeable within 4–6 weeks.
  Recommend hiring with a structured onboarding plan.
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/catalyst-skill-assessment
cd catalyst-skill-assessment

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Add your Groq key to .env.local:
# GROQ_API_KEY=gsk_...

# 4. Run dev server
npm run dev

# 5. Open http://localhost:3000
```

---

## 🚀 Deploy to Vercel

### Option A — Vercel Dashboard (recommended)
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Add environment variable: `GROQ_API_KEY` = your key
4. Click **Deploy**

### Option B — Vercel CLI
```bash
npm i -g vercel
vercel
vercel env add GROQ_API_KEY
vercel --prod
```

---

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Your Groq API key from [console.groq.com](https://console.groq.com) |

---

## 📝 API Reference

### `POST /api/claude/parse`
Extracts role-specific skills and initial scores from JD + resume.

**Request:** `{ jd: string, resume: string }`  
**Response:** `ParsedInput` — candidateName, role, 6 skills with resume scores and targeted questions

### `POST /api/claude/chat`
Generates an adaptive reply acknowledging the answer and asking the next question.

**Request:** `{ history: ChatMessage[], nextQuestion: string, role: string, skillName: string }`  
**Response:** `{ reply: string }`

### `POST /api/claude/report`
Generates the full assessment report from the interview transcript.

**Request:** `{ jd: string, resume: string, history: ChatMessage[], parsedInput: ParsedInput }`  
**Response:** `AssessmentReport` — scores, gaps, learning plan, hiring recommendation

---

## 📄 License

MIT
