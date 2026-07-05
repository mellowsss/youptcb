"use client";

import { useEffect, useState } from "react";

interface ExamTimerProps {
  totalSeconds: number;
  onExpire: () => void;
  running: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function ExamTimer({ totalSeconds, onExpire, running }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (!running || remaining <= 0) return;

    const timer = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, remaining, onExpire]);

  const urgent = remaining <= 600;

  return (
    <div
      className={`rounded-xl px-4 py-2 text-center text-sm font-semibold ${
        urgent ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-700"
      }`}
    >
      Time remaining: {formatTime(remaining)}
    </div>
  );
}
