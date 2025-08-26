import { cn } from '../utils';

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)}>{children}</div>
  );
}

export function CardHeader({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-4 border-b", className)}>{children}</div>;
}

export function CardTitle({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn("text-base font-semibold", className)}>{children}</h3>;
}

export function CardDescription({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn("text-sm text-slate-600", className)}>{children}</p>;
}

export function CardContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
