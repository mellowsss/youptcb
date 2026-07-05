import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  href?: string;
  className?: string;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-forest text-white hover:bg-terracotta focus-visible:ring-sage",
  secondary:
    "border border-sage bg-transparent text-sage hover:bg-clay-light focus-visible:ring-sage",
  ghost:
    "bg-transparent text-forest hover:bg-clay-light focus-visible:ring-sage",
};

export function Button({
  variant = "primary",
  children,
  href,
  className = "",
  ...props
}: ButtonProps) {
  const classes = `inline-flex h-12 min-h-[44px] items-center justify-center rounded-full px-6 text-sm font-medium uppercase tracking-widest transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-alabaster disabled:opacity-50 ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
