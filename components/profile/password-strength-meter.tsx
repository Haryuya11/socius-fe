"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl"; 

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({
  password,
}: PasswordStrengthMeterProps) {
  const t = useTranslations("PasswordStrength");

  const strength = useMemo(() => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;
    return score;
  }, [password]);

  const getStrengthColor = (index: number) => {
    if (index >= strength) return "bg-muted";
    if (strength <= 1) return "bg-destructive";
    if (strength === 2) return "bg-yellow-500";
    if (strength === 3) return "bg-blue-500";
    return "bg-green-600";
  };

  const getStrengthText = () => {
    if (!password) return "";
    if (strength <= 1) return t("weak"); 
    if (strength === 2) return t("fair"); 
    if (strength === 3) return t("good"); 
    return t("strong"); 
  };

  if (!password) return null;

  return (
    <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              getStrengthColor(i)
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-right font-medium">
        {t("label")}{" "}
        <span
          className={cn(
            strength <= 1
              ? "text-destructive"
              : strength === 2
              ? "text-yellow-600"
              : strength === 3
              ? "text-blue-600"
              : "text-green-600"
          )}
        >
          {getStrengthText()}
        </span>
      </p>
    </div>
  );
}
