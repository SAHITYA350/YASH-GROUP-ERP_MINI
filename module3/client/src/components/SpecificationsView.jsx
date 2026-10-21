import React, { useEffect, useState } from "react";
import { api } from "../api";
import { FileText, Plus, Search, CheckCircle2, Clock, X, Sliders } from "lucide-react";

export default function SpecificationsView() {
  const [specs, setSpecs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    revision: "REV-A",
    status: "DRAFT",
    drawingNumber: "",
    electricalStandard: "UL 467 / IS 3043 / IEEE 80",
    tensileStrength: ">= 600 N/mm²",
    copperPurity: "99.9% Electrolytic Copper",
    copperCoatingThickness: "254 Microns (10 Mils) minimum",
    adhesionTest: "Passes 90-degree cold bend test",
    diameterTolerance: "± 0.15 mm",
    lengthTolerance: "± 5.0 mm",
    threadSpec: "UNC Cold Rolled",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [specData, prodData] = await Promise.all([
        api.getSpecifications({ status: statusFilter }),
        api.getProducts({ limit: 100 }),
      ]);
      setSpecs(specData);
      setProducts(prodData.products);
    } catch (err) {
      alert("Error loading specifications: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const specification = {
        electricalStandard: formData.electricalStandard,
        tensileStrength: formData.tensileStrength,
        copperPurity: formData.copperPurity,
        copperCoatingThickness: formData.copperCoatingThickness,
        adhesionTest: formData.adhesionTest,
        diameterTolerance: formData.diameterTolerance,
        lengthTolerance: formData.lengthTolerance,
        threadSpecification: formData.threadSpec,
      };

      await api.createSpecification({
        productId: formData.productId,
        revision: formData.revision,
        status: formData.status,
        drawingNumber: formData.drawingNumber,
        specification,
      });

      alert("Specification revision saved successfully!");
      setShowModal(false);
      loadData();
    } catch (err) {
      alert("Error saving specification: " + err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateSpecification(id, { status: newStatus });
      loadData();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const filteredSpecs = specs.filter((s) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      s.product?.sku?.toLowerCase().includes(term) ||
      s.product?.name?.toLowerCase().includes(term) ||
      s.revision?.toLowerCase().includes(term) ||
      s.drawingNumber?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 320 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 10, top: 10, color: "var(--slate-400)" }} />
            <input
              type="text"
              className="input"
              placeholder="Search by SKU, Product Name, Revision, Drawing..."
              style={{ paddingLeft: 34 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select"
            style={{ width: 180 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="RELEASED">Released</option>
            <option value="SUPERSEDED">Superseded</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Specification Revision
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="data-table-wrapper" style={{ border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU / Product</th>
                  <th>Revision</th>
                  <th>Status</th>
                  <th>Drawing Number</th>
                  <th>Key Parameters & Standards</th>
                  <th>Released At</th>
                  <th style={{ textAlign: "center" }}>Lifecycle Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 40, color: "var(--slate-400)" }}>
                      Loading Specifications...
                    </td>
                  </tr>
                ) : filteredSpecs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 40, color: "var(--slate-400)" }}>
                      No product specifications found.
                    </td>
                  </tr>
                ) : (
                  filteredSpecs.map((s) => {
                    const specObj = s.specification || {};
                    return (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>{s.product?.sku}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--slate-800)", fontWeight: 500 }}>{s.product?.name}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: "var(--slate-900)" }}>{s.revision}</span>
                        </td>
                        <td>
                          <span className={`badge ${s.status === "RELEASED" ? "badge-released" : s.status === "IN_REVIEW" ? "badge-review" : "badge-draft"}`}>
                            {s.status}
                          </span>
                        </td>
                        <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                          {s.drawingNumber || "-"}
                        </td>
                        <td style={{ fontSize: "0.78rem" }}>
                          {specObj.electricalStandard && <div>Std: <strong>{specObj.electricalStandard}</strong></div>}
                          {specObj.copperCoatingThickness && <div>Coating: <strong>{specObj.copperCoatingThickness}</strong></div>}
                          {specObj.tensileStrength && <div>Tensile: {specObj.tensileStrength}</div>}
                          {specObj.standardCompliance && <div>Compliance: <strong>{specObj.standardCompliance}</strong></div>}
                        </td>
                        <td style={{ fontSize: "0.78rem", color: "var(--slate-500)" }}>
                          {s.releasedAt ? new Date(s.releasedAt).toLocaleDateString() : "Not Released"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {s.status === "DRAFT" && (
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={() => handleStatusChange(s.id, "IN_REVIEW")}
                            >
                              Submit Review
                            </button>
                          )}
                          {s.status === "IN_REVIEW" && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleStatusChange(s.id, "RELEASED")}
                            >
                              Approve & Release
                            </button>
                          )}
                          {s.status === "RELEASED" && (
                            <button
                              className="btn btn-sm btn-outline"
                              style={{ color: "var(--slate-500)" }}
                              onClick={() => handleStatusChange(s.id, "SUPERSEDED")}
                            >
                              Supersede
                            </button>
                          )}
                          {s.status === "SUPERSEDED" && (
                            <span style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}>Archived</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE SPEC MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Add Engineering Technical Specification Revision</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Parent Product *</label>
                    <select
                      className="select"
                      required
                      value={formData.productId}
                      onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Revision Identifier *</label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="e.g. REV-D"
                      value={formData.revision}
                      onChange={(e) => setFormData({ ...formData, revision: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Drawing Reference Number</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. DWG-CBR-172-3000"
                      value={formData.drawingNumber}
                      onChange={(e) => setFormData({ ...formData, drawingNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select
                      className="select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="RELEASED">Released</option>
                    </select>
                  </div>
                </div>

                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--slate-800)", marginTop: 12, marginBottom: 10 }}>
                  Structured Parameters
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Technical Standard (IS / IEC / UL / IEEE)</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.electricalStandard}
                      onChange={(e) => setFormData({ ...formData, electricalStandard: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Coating Thickness Specification</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.copperCoatingThickness}
                      onChange={(e) => setFormData({ ...formData, copperCoatingThickness: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Copper Purity</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.copperPurity}
                      onChange={(e) => setFormData({ ...formData, copperPurity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tensile Strength (N/mm²)</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.tensileStrength}
                      onChange={(e) => setFormData({ ...formData, tensileStrength: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Diameter Tolerance</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.diameterTolerance}
                      onChange={(e) => setFormData({ ...formData, diameterTolerance: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Length Tolerance</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.lengthTolerance}
                      onChange={(e) => setFormData({ ...formData, lengthTolerance: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Specification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
