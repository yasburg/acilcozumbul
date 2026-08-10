import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
  useState,
} from "react";
import { ACB_BRAND, isAcbBrand } from "@/lib/brand";

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
  variant?:
    | "primary"
    | "secondary"
    | "geri"
    | "success"
    | "outline"
    | "danger"
    | "emergency"
    | "dark";
}) {
  const base =
    "w-full min-h-[var(--acb-cta,52px)] rounded-[var(--acb-radius,1rem)] py-4 px-6 font-semibold text-base transition-[background-color,box-shadow,transform,opacity] duration-[var(--acb-transition,100ms)] ease-out touch-manipulation cursor-pointer active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const variants = {
    primary:
      "bg-[var(--acb-primary,#089b2d)] text-[var(--acb-primary-fg,#fff)] shadow-[var(--acb-shadow-cta)] hover:bg-[var(--acb-primary-hover,#077f25)] focus-visible:ring-[var(--acb-primary,#089b2d)]",
    secondary:
      "bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 focus-visible:ring-slate-400",
    /** Sticky alt nav — white fill next to primary CTA */
    geri: "bg-white text-[var(--acb-dark,#1b2d2a)] border border-[var(--acb-border,#e5e7eb)] shadow-none hover:bg-[var(--acb-soft,#eaf8ee)] focus-visible:ring-[var(--acb-border,#e5e7eb)]",
    success:
      "bg-[var(--acb-green,#089b2d)] text-white shadow-[var(--acb-shadow-cta)] hover:bg-[var(--acb-green-hover,#077f25)] focus-visible:ring-[var(--acb-green)]",
    outline:
      "bg-white border-2 border-[var(--acb-primary,#089b2d)] text-[var(--acb-dark,#1b2d2a)] focus-visible:ring-[var(--acb-primary)]",
    danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 focus-visible:ring-red-400",
    emergency:
      "bg-[var(--acb-emergency,#089b2d)] text-white shadow-[var(--acb-shadow-emergency)] hover:bg-[var(--acb-emergency-hover,#077f25)] focus-visible:ring-[var(--acb-emergency)]",
    dark: "bg-[var(--acb-dark,#1b2d2a)] text-white hover:opacity-95 focus-visible:ring-[var(--acb-dark)]",
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
  `w-full rounded-xl bg-white border px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100 disabled:opacity-70 ${
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

function SelectOkIkonu() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5 pointer-events-none text-slate-500"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SelectField({
  label,
  invalid = false,
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  invalid?: boolean;
}) {
  return (
    <label className={label ? "block space-y-1.5" : "block min-w-0 flex-1"}>
      {label ? (
        <span
          className={`text-sm font-medium ${invalid ? "text-red-700" : "text-slate-700"}`}
        >
          {label}
        </span>
      ) : null}
      <div className="relative">
        <select
          aria-invalid={invalid || undefined}
          className={inputSinif(
            invalid,
            `appearance-none pr-11 ${className}`
          )}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-slate-500">
          <SelectOkIkonu />
        </span>
      </div>
    </label>
  );
}

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
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label ? (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      <textarea
        rows={4}
        className={`w-full rounded-xl bg-white border border-slate-200 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none ${className}`}
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
  if (isAcbBrand) {
    return (
      <span
        className={`brand-acb-spinner inline-flex size-5 shrink-0 items-center justify-center ${className}`}
        role="status"
        aria-label="Yükleniyor"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- animated SVG; static fallback for reduced-motion */}
        <img
          src={ACB_BRAND.animationPingpong}
          alt=""
          width={40}
          height={40}
          className="brand-acb-spinner-anim size-full object-contain"
          aria-hidden
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ACB_BRAND.logoIcon}
          alt=""
          width={40}
          height={40}
          className="brand-acb-spinner-static size-full object-contain"
          aria-hidden
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-block size-5 shrink-0 animate-spin rounded-full border-2 border-amber-500 border-t-transparent ${className}`}
      role="status"
      aria-label="Yükleniyor"
    />
  );
}
