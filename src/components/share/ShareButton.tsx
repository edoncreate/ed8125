"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconShare } from "@/components/ui/icons";
import { shareUrl } from "@/lib/share";
import pageStyles from "@/components/page/Page.module.css";

type Props = {
  /** Site path to share, e.g. "/track/lt-vol-2-da-nostalgia" or "/collabs#los-maschineros-vol-1". */
  path: string;
  /** What's being shared, for the share sheet and the button label. */
  title: string;
  /** "pill" sits with page actions; "icon" is a round icon button (player). */
  variant?: "pill" | "icon";
  className?: string;
};

/**
 * Phones and tablets: the system share sheet (WhatsApp, Instagram, Messages...).
 * Desktop: copies the link and says so.
 */
export function ShareButton({ path, title, variant = "pill", className }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  async function onClick() {
    const url = shareUrl(path, window.location.origin);
    const data = { title: `${title} · ED8125`, url };
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch && typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) await copy(url);
      }
      return;
    }
    await copy(url);
  }

  const status = (
    <span role="status" className="visually-hidden">
      {copied ? "Link copied" : ""}
    </span>
  );

  if (variant === "icon") {
    return (
      <>
        <button
          type="button"
          className={["icon-btn", className].filter(Boolean).join(" ")}
          onClick={onClick}
          aria-label={`Share ${title}`}
          title={copied ? "Link copied" : "Share"}
        >
          {copied ? <IconCheck /> : <IconShare />}
        </button>
        {status}
      </>
    );
  }

  return (
    <>
      <button type="button" className={[pageStyles.btn, className].filter(Boolean).join(" ")} onClick={onClick} aria-label={`Share ${title}`}>
        {copied ? <IconCheck /> : <IconShare />} {copied ? "Link copied" : "Share"}
      </button>
      {status}
    </>
  );
}
