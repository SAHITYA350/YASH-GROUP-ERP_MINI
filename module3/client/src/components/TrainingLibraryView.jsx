import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Video, Play, ExternalLink, BookOpen, Search, CheckCircle } from "lucide-react";

export default function TrainingLibraryView() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getDocuments({ type: "TRAINING" }).then((data) => {
      setTrainings(data);
      setLoading(false);
    });
  }, []);

  const filtered = trainings.filter((t) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(term) ||
      (t.description && t.description.toLowerCase().includes(term)) ||
      (t.product && t.product.sku.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--slate-900)" }}>
            Product & Engineering Training Library
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--slate-500)" }}>
            Installation procedures, deep driving protocols, ESE active terminal commissioning, and site quality standards
          </p>
        </div>

        <div style={{ width: 280 }}>
          <input
            type="text"
            className="input"
            placeholder="Search tutorials, SOPs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--slate-400)" }}>Loading Training Catalog...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate-400)" }}>
          No training resources found matching your search.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {filtered.map((t) => (
            <div
              key={t.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid var(--slate-200)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
            >
              <div
                style={{
                  height: 140,
                  backgroundColor: "var(--slate-900)",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  backgroundImage: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(5, 150, 105, 0.4) 100%)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                >
                  <Play size={20} style={{ marginLeft: 2 }} />
                </div>
                <span style={{ position: "absolute", bottom: 8, right: 10, fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.7)", background: "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: 4 }}>
                  {t.revision || "HD Video"}
                </span>
              </div>

              <div style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column" }}>
                {t.product && (
                  <span style={{ fontSize: "0.72rem", fontFamily: "monospace", fontWeight: 700, color: "var(--primary)", marginBottom: 4 }}>
                    {t.product.sku}
                  </span>
                )}
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--slate-900)", marginBottom: 8, lineHeight: 1.3 }}>
                  {t.title}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--slate-600)", lineHeight: 1.5, marginBottom: 16, flex: 1 }}>
                  {t.description || "Comprehensive audio-visual guide demonstrating correct site installation procedure and safety protocol."}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--slate-100)", paddingTop: 12 }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--slate-400)" }}>
                    Verified by Yash R&D
                  </span>
                  <a
                    href={t.storageKey}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline"
                  >
                    Watch Tutorial <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
