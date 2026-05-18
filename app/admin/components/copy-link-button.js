"use client";

import { useState } from "react";

export default function CopyLinkButton({ value }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      window.prompt("Copy this link", value);
    }
  }

  return (
    <button className="secondary-button compact-button" type="button" onClick={copyLink}>
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
