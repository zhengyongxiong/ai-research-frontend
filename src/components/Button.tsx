import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon?: ReactNode;
  variant?: ButtonVariant;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 border-brand-600",
  secondary: "bg-white text-ink hover:bg-slate-50 border-slate-200",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent",
  danger: "bg-red-600 text-white hover:bg-red-700 border-red-600",
};

export function Button({
  children,
  className = "",
  disabled,
  loading,
  icon,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      <span>{children}</span>
    </button>
  );
}

