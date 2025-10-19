"use client";
import { useState } from "react";

export default function JobForm() {
  const [json, setJson] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    setJson(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: fd.get("role"),
          locale: fd.get("locale") || "en-US",
          estimateSalary: fd.get("estimateSalary") === "on",
        }),
      });

      const out = await res.json();

      if (!res.ok || !out.ok) {
        setError(out.error || "Generation failed");
      } else {
        setJson(out?.data || out);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            name="role"
            required
            placeholder="Role (e.g., Marketing Manager)"
            className="px-3 py-2 rounded-lg bg-jb-card border border-jb-accent/20 focus:border-jb-accent outline-none transition-colors"
          />
          <input
            name="locale"
            placeholder="en-US | en-GB"
            defaultValue="en-US"
            className="px-3 py-2 rounded-lg bg-jb-card border border-jb-accent/20 focus:border-jb-accent outline-none transition-colors"
          />
          <label className="flex items-center gap-2 col-span-1 md:col-span-2 cursor-pointer">
            <input
              type="checkbox"
              name="estimateSalary"
              className="w-4 h-4 accent-jb-accent"
            />
            <span className="text-sm">Estimate salary insights</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-jb-accent text-jb-bg font-semibold shadow-glow hover:shadow-none transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating…" : "Generate JD"}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {json && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-jb-accent">
              Generated Output
            </h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(json, null, 2));
              }}
              className="px-4 py-2 text-sm rounded-lg bg-jb-card border border-jb-accent/30 hover:bg-jb-accent/10 transition-colors"
            >
              Copy JSON
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-jb-card border border-jb-accent/20 overflow-auto text-xs leading-relaxed">
            {JSON.stringify(json, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
