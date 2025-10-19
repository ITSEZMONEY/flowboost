import dynamic from "next/dynamic";

const EmbedWidget = dynamic(() => import("@/components/EmbedWidget"), { ssr: false });

export const runtime = "edge";

// /embed?role=Marketing%20Manager
export default function EmbedPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const role = (searchParams.role || "").toString();
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>{`
          :root { color-scheme: dark; }
          body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#0b0f14; color:#e6f2ff; }
          .card { background:#0f151d; border-radius:16px; padding:24px; box-shadow:0 0 30px rgba(0,255,204,.15),0 0 30px rgba(0,170,255,.15); }
          .btn { background:#00ffcc; color:#0b0f14; border-radius:12px; padding:12px 20px; font-weight:600; border:none; cursor:pointer; font-size:14px; transition:all 0.2s; }
          .btn:hover { background:#00e6b8; transform:translateY(-1px); }
          .btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
          .btn-secondary { background:#1a2332; color:#00ffcc; border:1px solid #00ffcc; }
          .btn-secondary:hover { background:#1f2a3d; }
          .muted { color:#8ea5bc; font-size:14px; }
          input, select, textarea { background:#0f151d; border:1px solid #1a2332; color:#e6f2ff; border-radius:10px; padding:12px; width:100%; font-size:14px; box-sizing:border-box; }
          input:focus, select:focus, textarea:focus { outline:none; border-color:#00ffcc; }
          .row { display:grid; gap:12px; grid-template-columns:1fr 1fr; }
          @media (max-width:680px) { .row { grid-template-columns:1fr; } }
          pre { white-space:pre-wrap; word-wrap:break-word; background:#0b0f14; padding:16px; border-radius:10px; font-size:13px; line-height:1.6; overflow-x:auto; }
          h2 { margin:0 0 8px 0; font-size:24px; color:#e6f2ff; }
          h3 { margin:24px 0 12px 0; font-size:18px; color:#e6f2ff; }
          .loading { display:inline-block; width:16px; height:16px; border:2px solid #0b0f14; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite; }
          @keyframes spin { to { transform:rotate(360deg); } }
          .cta-section { background:linear-gradient(135deg, rgba(0,255,204,0.1), rgba(0,170,255,0.1)); border-radius:12px; padding:20px; margin-top:20px; }
          .preview-container { max-height:500px; overflow-y:auto; }
          .preview-container::-webkit-scrollbar { width:8px; }
          .preview-container::-webkit-scrollbar-track { background:#0b0f14; border-radius:4px; }
          .preview-container::-webkit-scrollbar-thumb { background:#1a2332; border-radius:4px; }
          .preview-container::-webkit-scrollbar-thumb:hover { background:#243447; }
        `}</style>
      </head>
      <body>
        <EmbedWidget initialRole={role} />
      </body>
    </html>
  );
}
