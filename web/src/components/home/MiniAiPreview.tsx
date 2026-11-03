"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// The V21 "Ask Faizan AI" card (design-reference/index.html + app.js). It is a
// scripted demo: the three answers below are pre-written, and no AI model or
// external service is called. The card says so in its subtitle and footer.
const scripted = {
  work: {
    label: "✦ What does he build?",
    question: "What can Faizan help build?",
    answer:
      "Faizan works across full-stack applications, API integrations, and technology project delivery, including digital banking solutions.",
  },
  banking: {
    label: "Banking experience",
    question: "What is his banking experience?",
    answer:
      "He has worked on digital banking projects involving customer channels, service integrations, kiosks, and coordination across technical teams.",
  },
  contact: {
    label: "How to connect?",
    question: "How can I get in touch?",
    answer:
      "You can reach Faizan through the Contact page by email, or use Let’s Chat on WhatsApp once a professional contact number is connected.",
  },
} as const;

type QuestionKey = keyof typeof scripted;
const questionKeys = Object.keys(scripted) as QuestionKey[];

export default function MiniAiPreview() {
  const [selected, setSelected] = useState<QuestionKey>("work");
  // Counts clicks so the V21 answer animation replays on every choice.
  const [answerVersion, setAnswerVersion] = useState(0);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (answerVersion === 0) return;
    // Restart the CSS animation (V21 removes and re-adds .answer-updating).
    answerRef.current?.getAnimations().forEach((animation) => {
      animation.cancel();
      animation.play();
    });
  }, [answerVersion]);

  const { question, answer } = scripted[selected];

  return (
    <div className="mini-ai-preview" aria-label="Ask Faizan AI (scripted demo)">
      <div className="mini-ai-heading">
        <div className="mini-ai-identity">
          <span className="mini-ai-logo" aria-hidden="true">
            ✳
          </span>
          <span>
            <strong>Ask Faizan AI</strong>
            <small>Portfolio guide · Scripted demo</small>
          </span>
        </div>
        <span className="mini-ai-demo-pill">DEMO</span>
      </div>
      <div className="mini-ai-conversation">
        <div className="mini-ai-note">Get a quick introduction to my experience.</div>
        <div className="mini-ai-bubble user-bubble" id="miniAiQuestion">
          {question}
        </div>
        <div className="mini-ai-answer-line">
          <span className="mini-ai-spark" aria-hidden="true">
            ✳
          </span>
          <div
            ref={answerRef}
            className={
              answerVersion > 0
                ? "mini-ai-bubble assistant-bubble answer-updating"
                : "mini-ai-bubble assistant-bubble"
            }
            id="miniAiAnswer"
            aria-live="polite"
          >
            {answer}
          </div>
        </div>
      </div>
      <div className="mini-ai-suggestions" aria-label="Try example questions">
        <span className="mini-ai-suggest-label">EXPLORE A QUESTION</span>
        <div className="mini-ai-chips">
          {questionKeys.map((key) => (
            <button
              key={key}
              type="button"
              className={key === selected ? "mini-ai-question is-selected" : "mini-ai-question"}
              data-ai-question={key}
              aria-pressed={key === selected}
              onClick={() => {
                setSelected(key);
                setAnswerVersion((version) => version + 1);
              }}
            >
              {scripted[key].label}
            </button>
          ))}
        </div>
      </div>
      <div className="mini-ai-footer">
        <span>
          <span className="mini-ai-footer-dot" aria-hidden="true"></span> Scripted responses · No
          live AI yet
        </span>
        <Link href="/contact">
          Contact Faizan <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  );
}
