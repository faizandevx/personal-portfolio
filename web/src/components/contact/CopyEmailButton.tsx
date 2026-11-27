"use client";

import { useEffect, useRef, useState } from "react";
import { PUBLIC_EMAIL } from "@/lib/site";

// "Copy email" on the Contact page's email card. The card itself is a mailto link, which
// does nothing visible on computers without an email app; this copies the address for
// any mail service instead. It sits next to the link (never inside it), and the result
// is announced through a polite live region.
export default function CopyEmailButton() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(PUBLIC_EMAIL);
      copied = true;
    } catch {
      // Older or restricted browsers: copy through a temporary, off-screen text field.
      const field = document.createElement("textarea");
      field.value = PUBLIC_EMAIL;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      copied = document.execCommand("copy");
      field.remove();
    }
    setState(copied ? "copied" : "failed");
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
