"use client";
import { useEffect, useMemo, useState } from "react";
import { buildJuiceboxCta } from "@/lib/utm";

type JDData = {
  role: string;
  slug: string;
  url: string;
  seoTitle: string;
  metaDescription: string;
  summary: string;
  responsibilities: string[];
  requirementsMust: string[];
  requirementsNice?: string[];
  benefits?: string[];
  jdTemplate: {
    title: string;
    intro: string;
    sections: { heading: string; bullets: string[] }[];
  };
};

export default function EmbedWidget({ initialRole = "" }: { initialRole?: string }) {
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [jd, setJd] = useState<JDData | null>(null);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  // Auto-resize the iframe height
  useEffect(() => {
    const resize = () => {
      parent.postMessage(
        { type: "JB_IFRAME_HEIGHT", height: document.body.scrollHeight },
        "*"
      );
    };
    resize();
    const id = setInterval(resize, 400);
    return () => clearInterval(id);
  }, []);

  const ctaHref = useMemo(() => buildJuiceboxCta(role || "Recruiter"), [role]);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    setJd(null);
    setCopied(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, locale: "en-US", estimateSalary: false }),
      });
      const out = await res.json();

      if (!out.ok || !out.data) {
        throw new Error(out.error || "Failed to generate JD");
      }

      const data = out.data;
      setJd({
        role: data.role,
        slug: data.slug,
        url: data.url,
        seoTitle: data.seoTitle,
        metaDescription: data.metaDescription,
        summary: data.summary,
        responsibilities: data.responsibilities,
        requirementsMust: data.requirementsMust,
        requirementsNice: data.requirementsNice,
        benefits: data.benefits,
        jdTemplate: data.jdTemplate,
      });

      // Analytics ping
      window.parent?.postMessage(
        { type: "JB_WIDGET_EVENT", event: "jd_generated", role },
        "*"
      );
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.parent?.postMessage(
      { type: "JB_WIDGET_EVENT", event: "copied", role },
      "*"
    );
  }

  function asMarkdown(j: JDData) {
    const sec = (h: string, arr?: string[]) =>
      arr && arr.length ? `\n\n### ${h}\n- ${arr.join("\n- ")}` : "";
    const tmpl = j.jdTemplate;
    const tmplStr = tmpl
      ? `\n\n## JD Template — ${tmpl.title}\n${tmpl.intro}\n` +
        tmpl.sections
          .map((s) => `\n**${s.heading}**\n- ${s.bullets.join("\n- ")}`)
          .join("\n")
      : "";
    return `# ${j.role} — Job Description\n\n${j.summary}${sec(
      "Responsibilities",
      j.responsibilities
    )}${sec("Requirements (Must Have)", j.requirementsMust)}${sec(
      "Requirements (Nice to Have)",
      j.requirementsNice
    )}${sec("Benefits", j.benefits)}${tmplStr}\n`;
  }

  function downloadMd() {
    if (!jd) return;
    const blob = new Blob([asMarkdown(jd)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${jd.slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
    window.parent?.postMessage(
      { type: "JB_WIDGET_EVENT", event: "downloaded", role },
      "*"
    );
  }

  async function captureLead() {
    if (email) {
      try {
        await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role, source: "jd-widget" }),
        });
      } catch {
        // Silent fail - still open signup
      }
    }
    window.parent?.postMessage(
      { type: "JB_WIDGET_EVENT", event: "cta_click", role, email: !!email },
      "*"
    );
    window.open(ctaHref, "_blank");
  }

  return (
    <div className="card">
      <h2>Generate a Free Job Description</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Build a clean, recruiter-ready JD in seconds — then source candidates in
        Juicebox.
      </p>

      <form onSubmit={onGenerate} style={{ marginTop: 16 }}>
        <div className="row">
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role (e.g., Marketing Manager)"
            required
            disabled={loading}
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="loading"></span> Generating…
              </>
            ) : (
              "Generate JD"
            )}
          </button>
        </div>
      </form>

      {jd && (
        <div style={{ marginTop: 24 }}>
          <div className="row">
            <button
              className="btn btn-secondary"
              onClick={() => copyText(asMarkdown(jd))}
            >
              {copied ? "✓ Copied!" : "Copy JD"}
            </button>
            <button className="btn btn-secondary" onClick={downloadMd}>
              Download .md
            </button>
          </div>

          <div style={{ marginTop: 20 }}>
            <h3>Preview</h3>
            <div className="preview-container">
              <pre>{asMarkdown(jd)}</pre>
            </div>
          </div>

          <div className="cta-section">
            <h3 style={{ marginTop: 0 }}>Ready to find candidates?</h3>
            <p className="muted" style={{ marginBottom: 16 }}>
              We'll pre-fill your Juicebox account with this role so you can start
              sourcing immediately.
            </p>
            <div className="row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work email (optional)"
              />
              <button className="btn" onClick={captureLead}>
                Find Candidates with Juicebox →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
