import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
  useState,
  useEffect,
  useRef,
  useMemo,
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
    "w-full min-h-[var(--acb-cta,52px)] rounded-[var(--acb-radius,1.125rem)] py-3.5 px-3 xs:px-5 font-semibold text-[13px] xs:text-[15px] sm:text-base whitespace-nowrap overflow-hidden text-ellipsis transition-[background-color,box-shadow,transform,opacity,filter] duration-200 active:duration-100 ease-out touch-manipulation cursor-pointer hover:-translate-y-px active:translate-y-0 active:scale-[0.97] disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const variants = {
    primary:
      "bg-gradient-to-b from-[#0aa932] to-[#068a27] text-white border border-[#099a2c] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_14px_rgba(8,155,45,0.35)] hover:brightness-[1.03] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_18px_rgba(8,155,45,0.4)] active:translate-y-[1px] active:scale-[0.98] focus-visible:ring-[var(--acb-primary,#089b2d)]",
    secondary:
      "bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 hover:shadow-[var(--acb-shadow)] focus-visible:ring-slate-400",
    /** Sticky alt nav — white fill next to primary CTA */
    geri: "bg-white text-[var(--acb-dark,#1b2d2a)] border border-[var(--acb-border,#e5e7eb)] shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-[var(--acb-soft,#eaf8ee)] hover:shadow-[var(--acb-shadow)] focus-visible:ring-[var(--acb-border,#e5e7eb)]",
    success:
      "bg-gradient-to-b from-[#0aa932] to-[#068a27] text-white border border-[#099a2c] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_14px_rgba(8,155,45,0.35)] hover:brightness-[1.03] active:translate-y-[1px] focus-visible:ring-[var(--acb-green)]",
    outline:
      "bg-white border-2 border-[var(--acb-primary,#089b2d)] text-[var(--acb-dark,#1b2d2a)] hover:shadow-[var(--acb-shadow)] focus-visible:ring-[var(--acb-primary)]",
    danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:shadow-[var(--acb-shadow)] focus-visible:ring-red-400",
    emergency:
      "bg-gradient-to-b from-[#0aa932] to-[#068a27] text-white border border-[#099a2c] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_14px_rgba(8,155,45,0.35)] hover:brightness-[1.03] active:translate-y-[1px] focus-visible:ring-[var(--acb-emergency)]",
    dark: "bg-[var(--acb-dark,#1b2d2a)] text-white hover:opacity-95 hover:shadow-[var(--acb-shadow-lg)] focus-visible:ring-[var(--acb-dark)]",
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
  `w-full rounded-[var(--acb-radius,1.125rem)] bg-white border px-4 py-3.5 text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1px_2px_rgba(27,45,42,0.035)] transition-[box-shadow,border-color] duration-200 ease-out focus:shadow-none focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100 disabled:opacity-70 disabled:shadow-none ${
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

export interface CustomSelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  label?: string;
  value: string;
  options: (string | CustomSelectOption)[];
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
}

export function CustomSelect({
  label,
  value,
  options,
  placeholder = "Seçiniz",
  disabled = false,
  invalid = false,
  className = "",
  searchable,
  searchPlaceholder = "Ara...",
  onChange,
  "aria-label": ariaLabel,
}: CustomSelectProps) {
  const [acik, setAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const normalizeOptions = useMemo(() => {
    return options.map((opt) =>
      typeof opt === "string" ? { value: opt, label: opt } : opt
    );
  }, [options]);

  const seciliOption = normalizeOptions.find((opt) => opt.value === value);

  const shouldBeSearchable =
    searchable !== undefined
      ? searchable
      : normalizeOptions.length > 6;

  const filtreliOptions = useMemo(() => {
    if (!aramaMetni.trim()) return normalizeOptions;
    const q = aramaMetni.trim().toLocaleLowerCase("tr-TR");
    return normalizeOptions.filter((opt) =>
      opt.label.toLocaleLowerCase("tr-TR").includes(q)
    );
  }, [normalizeOptions, aramaMetni]);

  useEffect(() => {
    if (!acik) return;
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setAcik(false);
        setAramaMetni("");
      }
    }
    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [acik]);

  useEffect(() => {
    if (acik && shouldBeSearchable) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [acik, shouldBeSearchable]);

  useEffect(() => {
    if (!acik) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAcik(false);
        setAramaMetni("");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [acik]);

  return (
    <div
      ref={containerRef}
      className={label ? "relative space-y-1.5" : "relative min-w-0 flex-1"}
    >
      {label ? (
        <label
          className={`block text-sm font-medium ${
            invalid ? "text-red-700" : "text-slate-700"
          }`}
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          aria-label={ariaLabel || label || placeholder}
          aria-expanded={acik}
          aria-haspopup="listbox"
          onClick={() => {
            if (!disabled) setAcik((prev) => !prev);
          }}
          className={inputSinif(
            invalid,
            `flex w-full items-center justify-between gap-2 text-left transition-all ${
              disabled
                ? "cursor-not-allowed opacity-60 bg-slate-50 text-slate-400"
                : "cursor-pointer bg-white"
            } ${className}`
          )}
        >
          <span
            className={`block truncate ${
              seciliOption ? "text-slate-900 font-medium" : "text-slate-400"
            }`}
          >
            {seciliOption ? seciliOption.label : placeholder}
          </span>
          <span
            className={`pointer-events-none transition-transform duration-200 shrink-0 text-slate-500 ${
              acik ? "rotate-180 text-[var(--acb-green,#089b2d)]" : ""
            }`}
          >
            <SelectOkIkonu />
          </span>
        </button>

        {acik && !disabled && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.375rem)] z-50 rounded-[var(--acb-radius-lg)] bg-white border border-[var(--acb-border)] shadow-[var(--acb-shadow-lg)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 min-w-[160px]">
            {shouldBeSearchable && (
              <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                <div className="relative flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={aramaMetni}
                    onChange={(e) => setAramaMetni(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[var(--acb-green,#089b2d)] focus:outline-none focus:ring-2 focus:ring-[var(--acb-green,#089b2d)]/20"
                  />
                  {aramaMetni && (
                    <button
                      type="button"
                      onClick={() => setAramaMetni("")}
                      className="absolute right-2 text-slate-400 hover:text-slate-600 text-xs px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            )}

            <ul
              role="listbox"
              className="max-h-60 overflow-y-auto p-1.5 space-y-0.5"
            >
              {filtreliOptions.length === 0 ? (
                <li className="px-3 py-3 text-center text-sm text-slate-400">
                  Sonuç bulunamadı.
                </li>
              ) : (
                filtreliOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onChange(opt.value);
                          setAcik(false);
                          setAramaMetni("");
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-[var(--acb-soft,#eaf8ee)] text-[var(--acb-green,#089b2d)] font-semibold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="size-4 shrink-0 text-[var(--acb-green,#089b2d)]"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
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
        className={`w-full rounded-[var(--acb-radius,1.125rem)] bg-white border border-slate-200 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1px_2px_rgba(27,45,42,0.035)] transition-[box-shadow,border-color] duration-200 ease-out focus:shadow-none focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 resize-none ${className}`}
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
    <div
      className={`rounded-[var(--acb-radius-lg)] bg-white border border-[var(--acb-border)] shadow-[var(--acb-shadow)] p-4 ${className}`}
    >
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
