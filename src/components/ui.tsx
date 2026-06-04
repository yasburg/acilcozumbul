import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
  useState,
} from "react";

function GozIkonu({ kapali }: { kapali: boolean }) {
  if (kapali) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-5"
        aria-hidden
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M1 1l22 22" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="size-5"
      aria-hidden
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

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

const inputSinif = (invalid: boolean, ekstra = "") =>
  `w-full rounded-xl bg-white border px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
    invalid
      ? "border-red-500 ring-red-500/30 focus:ring-red-500/40 focus:border-red-500"
      : "border-slate-200 focus:ring-amber-500/40 focus:border-amber-500"
  } ${ekstra}`;

export const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    invalid?: boolean;
  }
>(function Field({ label, className = "", invalid = false, ...props }, ref) {
  return (
    <label className="block space-y-1.5">
      <span
        className={`text-sm font-medium ${invalid ? "text-red-700" : "text-slate-700"}`}
      >
        {label}
      </span>
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={inputSinif(invalid, className)}
        {...props}
      />
    </label>
  );
});

export const SifreAlani = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    label: string;
    invalid?: boolean;
  }
>(function SifreAlani(
  { label, className = "", invalid = false, ...props },
  ref
) {
  const [goster, setGoster] = useState(false);

  return (
    <label className="block space-y-1.5">
      <span
        className={`text-sm font-medium ${invalid ? "text-red-700" : "text-slate-700"}`}
      >
        {label}
      </span>
      <div className="relative">
        <input
          ref={ref}
          type={goster ? "text" : "password"}
          aria-invalid={invalid || undefined}
          className={inputSinif(invalid, `pr-12 ${className}`)}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setGoster((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 touch-manipulation"
          aria-label={goster ? "Şifreyi gizle" : "Şifreyi göster"}
        >
          <GozIkonu kapali={goster} />
        </button>
      </div>
    </label>
  );
});

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

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block size-5 shrink-0 animate-spin rounded-full border-2 border-amber-500 border-t-transparent ${className}`}
      role="status"
      aria-label="Yükleniyor"
    />
  );
}
