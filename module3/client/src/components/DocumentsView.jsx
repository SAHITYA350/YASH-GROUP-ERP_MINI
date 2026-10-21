import React, { useEffect, useState } from "react";
import { api } from "../api";
import { FileCode, Plus, Search, ExternalLink, Download, CheckCircle2, X } from "lucide-react";

export default function DocumentsView() {
  const [documents, setDocuments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "DRAWING",
    storageKey: "",
    revision: "REV-A",
    description: "",
    productId: "",
    isApproved: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [docs, prods] = await Promise.all([
        api.getDocuments({ type: typeFilter, search }),
        api.getProducts({ limit: 100 }),
      ]);
      setDocuments(docs);
      setProducts(prods.products);
    } catch (err) {
      alert("Error loading documents: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [typeFilter, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createDocument(formData);
      alert("Document registered successfully!");
      setShowModal(false);
      setFormData({
        title: "",
        type: "DRAWING",
        storageKey: "",
        revision: "REV-A",
        description: "",
        productId: "",
        isApproved: true,
      });
      loadData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 320 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 10, top: 10, color: "var(--slate-400)" }} />
            <input
              type="text"
              className="input"
              placeholder="Search drawings by Title, Rev, or Description..."
              style={{ paddingLeft: 34 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select"
            style={{ width: 180 }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Document Types</option>
            <option value="DRAWING">CAD Drawings (DWG/PDF)</option>
            <option value="DOCUMENT">Datasheets & Specs</option>
            <option value="TRAINING">Training Resources</option>
            <option value="PHOTO">Photographs</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Register Drawing / Document
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="data-table-wrapper" style={{ border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doc Type</th>
                  <th>Document Title</th>
                  <th>Rev</th>
                  <th>Linked Product</th>
                  <th>Storage Location / URL</th>
                  <th>Approval</th>
                  <th>Date</th>
                  <th style={{ textAlign: "center" }}>Open</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ textAlign: "center", padding: 30 }}>Loading documents...</td></tr>
                ) : documents.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: "center", padding: 30 }}>No documents found matching filters.</td></tr>
                ) : (
                  documents.map((d) => (
                    <tr key={d.id}>
                      <td><span className="badge badge-draft">{d.type}</span></td>
                      <td style={{ fontWeight: 600, color: "var(--slate-900)" }}>
                        {d.title}
                        {d.description && <span style={{ display: "block", fontSize: "0.74rem", color: "var(--slate-500)", fontWeight: 400 }}>{d.description}</span>}
                      </td>
                      <td><span className="badge badge-released">{d.revision || "R1"}</span></td>
                      <td>
                        {d.product ? (
                          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--primary)", fontFamily: "monospace" }}>
                            {d.product.sku}
                          </span>
                        ) : "-"}
                      </td>
                      <td style={{ fontSize: "0.75rem", color: "var(--slate-500)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.storageKey}
                      </td>
                      <td>
                        <span className={`badge ${d.isApproved ? "badge-released" : "badge-review"}`}>
                          {d.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}>
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <a
                          href={d.storageKey}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline"
                        >
                          <ExternalLink size={13} /> Open
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* REGISTER DOCUMENT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Register New Technical Document / Drawing</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Document Title *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="e.g. DWG-CBR-172-3000: Assembly Drawing"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Document Type</label>
                    <select
                      className="select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="DRAWING">Technical Drawing (CAD / PDF)</option>
                      <option value="DOCUMENT">Technical Datasheet (TDS)</option>
                      <option value="TRAINING">Training Resource / SOP</option>
                      <option value="PHOTO">Product Photograph</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">File / Storage URL *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="https://... or drawings/..."
                      value={formData.storageKey}
                      onChange={(e) => setFormData({ ...formData, storageKey: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Revision Identifier</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.revision}
                      onChange={(e) => setFormData({ ...formData, revision: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Link to Product Master</label>
                  <select
                    className="select"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  >
                    <option value="">General Engineering (No direct product)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Scope & Engineering Notes</label>
                  <textarea
                    className="textarea"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.isApproved}
                    onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                  />
                  <strong>Approved for Production Release</strong>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
