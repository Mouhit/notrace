"use client";
import { useState } from "react";
import { Calendar, X, Clock } from "lucide-react";

interface DateTimePickerProps {
  value: string | null;
  onChange: (val: string | null) => void;
}

export default function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  // Min datetime = now + 5 minutes
  const minDate = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value ? new Date(e.target.value).toISOString() : null);
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
  };

  const formatDisplay = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        <Clock className="w-3.5 h-3.5" />
        {value ? (
          <span className="text-brand">Scheduled: {formatDisplay(value)}</span>
        ) : (
          <span>Schedule for later (optional)</span>
        )}
      </button>

      {open && (
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-brand" />
              <span>Reveal secret on</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-600 hover:text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            type="datetime-local"
            min={minDate}
            defaultValue={value ? new Date(value).toISOString().slice(0, 16) : ""}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-sm text-white focus:outline-none focus:border-brand-border transition-all [color-scheme:dark]"
          />

          <p className="text-xs text-slate-600">
            Recipient will see a countdown until this date.
          </p>

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
            >
              Remove schedule
            </button>
          )}
        </div>
      )}
    </div>
  );
}
