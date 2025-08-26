import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value?: number;
    isPositive: boolean;
    description?: string;
    hideValue?: boolean;
    percentageColor?: string;
  };
  variant?: "default" | "success" | "warning" | "accent" | "danger" | "amber";
  className?: string;
  size?: "sm" | "md";
}

export function StatCard({ title, value, icon, trend, variant = "default", className, size = "md" }: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-green-500/20 bg-gradient-to-br from-green-50 to-green-100";
      case "warning":
        return "border-yellow-500/20 bg-gradient-to-br from-yellow-50 to-yellow-100";
      case "accent":
        return "border-sky-500/20 bg-gradient-to-br from-sky-50 to-sky-100";
      case "danger":
        return "border-red-500/20 bg-gradient-to-br from-red-50 to-red-100";
      case "amber":
        return "border-amber-500/20 bg-gradient-to-br from-amber-50 to-amber-100";
      default:
        return "border-slate-200 bg-white";
    }
  };

  const headerPadding = size === "sm" ? "px-3" : "px-4";
  const headerY = "py-0";
  const contentPadding = size === "sm" ? "px-3 py-2" : "px-4 py-2";
  const valueTextSize = size === "sm" ? "text-[22px]" : "text-[26px]";
  const percentTextSize = size === "sm" ? "text-[18px]" : "text-[20px]";
  const iconBoxSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const cardHeight = size === "sm" ? "min-h-[100px]" : "min-h-[116px]";

  const getIconStyles = () => {
    switch (variant) {
      case "success":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "accent":
        return "text-sky-600 bg-sky-100";
      case "danger":
        return "text-red-600 bg-red-100";
      case "amber":
        return "text-amber-600 bg-amber-100";
      default:
        return "text-slate-600 bg-slate-100";
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col",
      cardHeight,
      getVariantStyles(),
      className
    )}>
      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 p-0 border-b-0", headerPadding, headerY) }>
        <CardTitle className="text-sm font-medium text-slate-600 leading-tight">
          {title}
        </CardTitle>
        <div className={cn(
          "flex items-center justify-center rounded-lg",
          iconBoxSize,
          getIconStyles()
        )}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className={cn(contentPadding, "flex-1 flex flex-col justify-center") }>
        <div className={cn(
          "flex items-baseline gap-1.5",
          !trend && "-mt-4"
        )}>
          <span className={cn("inline-block align-middle font-bold leading-none", valueTextSize)}>{value}</span>
          {trend && !trend.hideValue && trend.value !== undefined && (
            <span className={cn("inline-block align-middle font-bold leading-none", percentTextSize)}>
              ({trend.value}%)
            </span>
          )}
        </div>
                  {trend && (
            <p className={cn(
              "text-xs flex items-center mt-6 text-slate-600 leading-none"
            )}>
              <span className="mr-1">↗</span>
              {trend.description || "Em relação às retiradas entrantes"}
            </p>
          )}
      </CardContent>
    </Card>
  );
}
