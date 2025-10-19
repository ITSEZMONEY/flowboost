import JobForm from "@/components/JobForm";

export default function Page() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-jb-accent to-jb-accent2 bg-clip-text text-transparent">
            Juicebox JD Generator
          </h1>
          <p className="text-jb-text/70">
            Role-focused job description generator for pSEO hub at{" "}
            <code className="text-jb-accent">/job-description/[role]</code>
          </p>
        </header>

        <div className="p-6 rounded-2xl bg-jb-card border border-jb-accent/10 shadow-glow">
          <JobForm />
        </div>

        <footer className="text-center text-sm text-jb-text/50">
          <p>
            Outputs CMS-ready JSON aligned to Research → Keywords → Scaffolding
            → Data Layer → Content → Design
          </p>
        </footer>
      </div>
    </main>
  );
}
