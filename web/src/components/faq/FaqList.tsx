"use client";

import { useState } from "react";
import { faqs } from "@/content/faq";

// The V21 single-open FAQ accordion (design-reference/app.js, V14). Opening an
// answer closes the previous one at the same time; closed answers are inert.
export default function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {faqs.map((faq, index) => {
        const number = index + 1;
        const isOpen = openIndex === index;
        return (
          <div className={isOpen ? "faq-item is-open" : "faq-item"} key={faq.question}>
            <button
              type="button"
              className="faq-trigger"
              id={`faq-trigger-${number}`}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${number}`}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span className="faq-index">{String(number).padStart(2, "0")}</span>
              <span className="faq-question">{faq.question}</span>
              <span className="faq-plus" aria-hidden="true">
                +
              </span>
            </button>
            <div
              className="faq-panel"
              id={`faq-panel-${number}`}
              role="region"
              aria-labelledby={`faq-trigger-${number}`}
              aria-hidden={!isOpen}
              inert={!isOpen}
            >
              <div className="faq-panel-inner">
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
