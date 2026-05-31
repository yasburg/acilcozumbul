import { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Btn({
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "success" | "outline" | "danger";
}) {
  const base =
    "w-full min-h-[52px] rounded-2xl py-4 px-6 font-semibold text-base transition touch-manipulation cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-amber-500 text-white shadow-md shadow-amber-500/25 hover:bg-amber-600",
    secondary: "bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200",
    success: "bg-emerald-600 text-white shadow-md shadow-emerald-500/25",
    outline: "bg-white border-2 border-amber-500 text-amber-700",
    danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
  };
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Field({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className={`w-full rounded-xl bg-white border border-slate-200 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 ${className}`}
        {...props}
      />
    </label>
  );
}

export function TextArea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        rows={4}
        className="w-full rounded-xl bg-white border border-slate-200 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
        {...props}
      />
    </label>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-white border border-slate-200 shadow-sm p-4 ${className}`}>
      {children}
    </div>
  );
}
