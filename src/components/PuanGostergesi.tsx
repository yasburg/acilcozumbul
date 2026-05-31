interface PuanGostergesiProps {
  label: string;
  puan: number | null;
  yuzde?: number | null;
  yuzdeEtiket?: string;
  altMetin?: string;
  variant?: "amber" | "emerald" | "blue";
}

const VARIANTS = {
  amber: {
    box: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
  },
  emerald: {
    box: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
  },
  blue: {
    box: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
  },
};

export function PuanGostergesi({
  label,
  puan,
  yuzde,
  yuzdeEtiket = "tercih",
  altMetin,
  variant = "amber",
}: PuanGostergesiProps) {
  const v = VARIANTS[variant];

  return (
    <div className={`rounded-xl border px-3 py-2 ${v.box}`}>
      <p className={`text-[10px] uppercase tracking-wide ${v.text} opacity-80`}>
        {label}
      </p>
      {puan != null ? (
        <>
          <p className={`text-lg font-bold leading-tight ${v.text}`}>
            {puan.toFixed(1)}
            <span className="text-xs font-medium opacity-70"> / 5</span>
          </p>
          {yuzde != null && (
            <p className={`text-[10px] ${v.text} opacity-75 mt-0.5`}>
              %{yuzde} {yuzdeEtiket}
            </p>
          )}
          {altMetin && (
            <p className={`text-[10px] ${v.text} opacity-75 mt-0.5`}>{altMetin}</p>
          )}
        </>
      ) : (
        <p className={`text-sm font-medium ${v.text} opacity-70`}>Yeni çekici</p>
      )}
    </div>
  );
}
