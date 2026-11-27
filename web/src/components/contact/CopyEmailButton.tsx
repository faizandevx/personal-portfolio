"use client";

import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { PUBLIC_EMAIL } from "@/lib/site";

// "Copy email" in the corner of the Contact page's email card, for visitors who just
// want the address. It sits next to the card (never inside it), and the result is
// announced through a polite live region.
export default function CopyEmailButton() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    setState((await copyText(PUBLIC_EMAIL)) ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2500);
  };

  return (
    <>
      <button className="method-copy-btn" type="button" onClick={copy}>
        {state === "copied" ? "Copied" : "Copy email"}
      </button>
      <span aria-live="polite" className="sr-only">
        {state === "copied" && "Email address copied."}
        {state === "failed" && `Couldn't copy. The address is ${PUBLIC_EMAIL}.`}
      </span>
    </>
  );
}
