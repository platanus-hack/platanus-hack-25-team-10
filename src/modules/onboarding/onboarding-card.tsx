"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/ui/card";
import { cn } from "@/modules/shared/lib/utils";

interface OnboardingCardProps {
  stepNumber: number;
  title: string;
  description: string;
  isCompleted: boolean;
  children: React.ReactNode;
  className?: string;
  onComplete?: () => void;
}

export function OnboardingCard({
  stepNumber,
  title,
  description,
  isCompleted,
  children,
  className,
  onComplete,
}: OnboardingCardProps) {
  const [showCheck, setShowCheck] = useState(isCompleted);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const prevCompletedRef = useRef(isCompleted);

  // Animate checkmark when completing
  useEffect(() => {
    if (isCompleted && !prevCompletedRef.current) {
      // Step just completed
      setShowCheck(true);
      setShouldAnimate(true);
      onComplete?.();
    }
    prevCompletedRef.current = isCompleted;
  }, [isCompleted, onComplete]);

  return (
    <Card
      className={cn(
        "max-w-2xl mx-auto",
        isCompleted && "opacity-60 pointer-events-none",
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2",
              isCompleted
                ? "border-green-600 bg-green-600"
                : "border-muted-foreground/30",
            )}
          >
            {showCheck ? (
              <Check
                className={cn(
                  "h-5 w-5 text-white",
                  shouldAnimate && "animate-check-pop",
                )}
              />
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">
                {stepNumber}
              </span>
            )}
          </div>
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
