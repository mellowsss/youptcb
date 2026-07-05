import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  clay?: boolean;
}

export function Card({ children, className = "", hover = false, clay = false }: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-stone bg-white p-6 shadow-soft md:p-8 ${
        clay ? "bg-clay-light" : ""
      } ${hover ? "botanical-card-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
