import { Inter_Tight, Manrope, Space_Mono } from "next/font/google";

/** Headline + logo (Spotlight orange: Inter Tight 900). */
export const interTight = Inter_Tight({ subsets: ["latin"], weight: ["900"], variable: "--font-head", display: "swap" });

/** Labels, UI, data rows. */
export const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono", display: "swap" });

/** Body copy. */
export const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body", display: "swap" });
