"use client";

import { useEffect, useState } from "react";
import { formatLisbonTime } from "@/lib/time";

export function LiveClock() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const tick = () => setTime(formatLisbonTime(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return <span>{time}</span>;
}
