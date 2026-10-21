import React, { useEffect, useState } from "react";
import { api } from "../api";
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Copy,
  Edit,
  Eye,
  Trash2,
  ExternalLink,
  CheckCircle,
  FileText,
  Layers,
  Image as ImageIcon,
  X,
} from "lucide-react";

export default function ProductsView({ onSelectProductForTrace }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [manufacturedOnly, setManufacturedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Modals & Drawer State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState("overview");

  // Form State
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    categoryId: "",
    variant: "",
    diameter: "",
    length: "",
    modelName: "",
    hsnCode: "8538",
    standardMake: "YASH",
    gstPercent: "18",
    listPrice: "",
    unitOfMeasure: "PCS",
    isManufactured: true,
    drawingId: "",
    drawingUrl: "",
    imageUrl: "",
    description: "",
    minReorderLevel: "10",
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts({
        search,
        categoryId: selectedCategory,
        isManufactured: manufacturedOnly ? "true" : "",
        page,
        limit: 25,
      });
      setProducts(res.products);
      setCategories(res.categories);
      setPagination(res.pagination);
    } catch (err) {
      alert("Failed to load products: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory, manufacturedOnly, page]);

  const handleOpenDetail = async (id) => {
    try {
      setDetailLoading(true);
      const detail = await api.getProduct(id);
      setSelectedProductDetail(detail);
      setDetailTab("overview");
    } catch (err) {
      alert("Could not load product details: " + err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleClone = async (id) => {
    if (!window.confirm("Clone this product into a new draft product?")) return;
    try {
      const res = await api.cloneProduct(id);
      alert(res.message);
      loadProducts();
    } catch (err) {
      alert("Error cloning product: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate/archive this product?")) return;
    try {
      const res = await api.deleteProduct(id);
      alert(res.message);
      loadProducts();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createProduct(formData);
      alert("Product created successfully!");
      setShowCreateModal(false);
      setFormData({
        sku: "",
        name: "",
        categoryId: "",
        variant: "",
        diameter: "",
        length: "",
        modelName: "",
        hsnCode: "8538",
        standardMake: "YASH",
        gstPercent: "18",
        listPrice: "",
        unitOfMeasure: "PCS",
        isManufactured: true,
        drawingId: "",
        drawingUrl: "",
        imageUrl: "",
        description: "",
        minReorderLevel: "10",
      });
      loadProducts();
    } catch (err) {
      alert("Error creating product: " + err.message);
    }
  };

  return (
    <div>
      {/* Action Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 320 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 10, top: 10, color: "var(--slate-400)" }} />
            <input
              type="text"
              className="input"
              placeholder="Search by SKU, Name, Model, Drawing..."
              style={{ paddingLeft: 34 }}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <select
            className="select"
            style={{ width: 220 }}
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--slate-700)", cursor: "pointer", whiteSpace: "nowrap" }}>
            <input
              type="checkbox"
              checked={manufacturedOnly}
              onChange={(e) => { setManufacturedOnly(e.target.checked); setPage(1); }}
            />
            Manufactured Only
          </label>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> New Product
        </button>
      </div>

      {/* Product Data Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="data-table-wrapper" style={{ border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Img</th>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Dimensions</th>
                  <th>Standard / Make</th>
                  <th style={{ textAlign: "right" }}>List Price</th>
                  <th>Mfg</th>
                  <th>Drawing</th>
                  <th style={{ textAlign: "center", width: 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: 40, color: "var(--slate-400)" }}>
                      Loading Product Catalog...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: 40, color: "var(--slate-400)" }}>
                      No matching products found.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            style={{ width: 34, height: 34, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--slate-200)" }}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div style={{ width: 34, height: 34, backgroundColor: "var(--slate-100)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--slate-400)" }}>
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </td>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>
                        {p.sku}
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--slate-900)" }}>
                        {p.name}
                        {p.variant && <span style={{ display: "block", fontSize: "0.72rem", color: "var(--slate-500)", fontWeight: 400 }}>{p.variant}</span>}
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "var(--slate-600)" }}>
                        {p.category?.name}
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "var(--slate-600)" }}>
                        {p.diameter ? `Ø ${p.diameter}` : ""} {p.length ? `x ${p.length}` : ""}
                        {!p.diameter && !p.length ? (p.bagSize || "-") : ""}
                      </td>
                      <td style={{ fontSize: "0.78rem" }}>
                        <span style={{ fontWeight: 600 }}>{p.standardMake}</span>
                        <span style={{ color: "var(--slate-400)", marginLeft: 4 }}>HSN: {p.hsnCode}</span>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--slate-900)" }}>
                        ₹{Number(p.listPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className={`badge ${p.isManufactured ? "badge-released" : "badge-draft"}`}>
                          {p.isManufactured ? "In-House" : "Bought"}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.75rem", fontFamily: "monospace" }}>
                        {p.drawingId || "-"}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <button
                            className="btn btn-sm btn-outline"
                            title="View Product Workspace"
                            onClick={() => handleOpenDetail(p.id)}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            title="Clone Product"
                            onClick={() => handleClone(p.id)}
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            style={{ color: "var(--rose-700)" }}
                            title="Deactivate / Archive"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--slate-100)", fontSize: "0.8rem", color: "var(--slate-500)" }}>
            <span>Showing {products.length} of {pagination.total} products</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="btn btn-sm btn-outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span style={{ padding: "5px 10px", fontWeight: 700, color: "var(--slate-800)" }}>Page {page} of {pagination.pages}</span>
              <button
                className="btn btn-sm btn-outline"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE PRODUCT MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--slate-900)" }}>Create New Engineering Product Master</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Product SKU * (Unique)</label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="e.g. YEC-CBR-172-3000"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="select"
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="e.g. Copper Bonded Earth Rod 17.2mm x 3000mm (254 Microns)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Diameter / Size</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 17.2 mm"
                      value={formData.diameter}
                      onChange={(e) => setFormData({ ...formData, diameter: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Length</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 3000 mm"
                      value={formData.length}
                      onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Model Name</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. YEC-UL-172"
                      value={formData.modelName}
                      onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">HSN Code</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.hsnCode}
                      onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GST %</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.gstPercent}
                      onChange={(e) => setFormData({ ...formData, gstPercent: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">List Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      placeholder="0.00"
                      value={formData.listPrice}
                      onChange={(e) => setFormData({ ...formData, listPrice: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">UOM</label>
                    <select
                      className="select"
                      value={formData.unitOfMeasure}
                      onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                    >
                      <option value="PCS">PCS</option>
                      <option value="KG">KG</option>
                      <option value="BAG">BAG</option>
                      <option value="COIL">COIL</option>
                      <option value="SET">SET</option>
                      <option value="MTR">MTR</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Drawing Number / ID</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. DWG-CBR-172-3000"
                      value={formData.drawingId}
                      onChange={(e) => setFormData({ ...formData, drawingId: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Drawing URL (CAD / PDF)</label>
                    <input
                      type="url"
                      className="input"
                      placeholder="https://..."
                      value={formData.drawingUrl}
                      onChange={(e) => setFormData({ ...formData, drawingUrl: e.target.value })}
                    />
                  </div>
                </div>

                {/* PRODUCT IMAGE URL SUPPORT (User Provided Link) */}
                <div className="form-group">
                  <label className="form-label">Product Image URL (External / User Link)</label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://example.com/product-image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                  {formData.imageUrl && (
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "var(--radius-md)", border: "1px solid var(--slate-200)" }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                      <span style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>Live Image Preview</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Engineering Description & Scope</label>
                  <textarea
                    className="textarea"
                    rows="3"
                    placeholder="Technical description, specifications, and manufacturing notes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div style={{ display: "flex", gap: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.isManufactured}
                      onChange={(e) => setFormData({ ...formData, isManufactured: e.target.checked })}
                    />
                    <strong>In-House Manufactured</strong>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Product Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL WORKSPACE DRAWER */}
      {selectedProductDetail && (
        <div className="drawer-overlay" onClick={() => setSelectedProductDetail(null)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--slate-200)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", backgroundColor: "var(--slate-50)" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>
                  {selectedProductDetail.sku}
                </span>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--slate-900)", marginTop: 2 }}>
                  {selectedProductDetail.name}
                </h2>
                <span style={{ fontSize: "0.8rem", color: "var(--slate-500)" }}>
                  {selectedProductDetail.category?.name} • Standard: {selectedProductDetail.standardMake}
                </span>
              </div>
              <button onClick={() => setSelectedProductDetail(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)" }}>
                <X size={22} />
              </button>
            </div>

            {/* Tab navigation */}
            <div style={{ padding: "0 24px" }}>
              <div className="tabs-nav">
                <button className={`tab-btn ${detailTab === "overview" ? "active" : ""}`} onClick={() => setDetailTab("overview")}>
                  Overview
                </button>
                <button className={`tab-btn ${detailTab === "specs" ? "active" : ""}`} onClick={() => setDetailTab("specs")}>
                  Specs ({selectedProductDetail.productSpecifications?.length || 0})
                </button>
                <button className={`tab-btn ${detailTab === "boms" ? "active" : ""}`} onClick={() => setDetailTab("boms")}>
                  BOMs ({selectedProductDetail.bomRevisions?.length || 0})
                </button>
                <button className={`tab-btn ${detailTab === "media" ? "active" : ""}`} onClick={() => setDetailTab("media")}>
                  Media & DWG ({selectedProductDetail.mediaAssets?.length || 0})
                </button>
                <button className={`tab-btn ${detailTab === "trace" ? "active" : ""}`} onClick={() => {
                  setSelectedProductDetail(null);
                  onSelectProductForTrace(selectedProductDetail.sku);
                }}>
                  Traceability <ExternalLink size={12} />
                </button>
              </div>
            </div>

            {/* Tab Body */}
            <div style={{ padding: "0 24px 30px", flex: 1, overflowY: "auto" }}>
              {detailTab === "overview" && (
                <div>
                  {selectedProductDetail.imageUrl && (
                    <div style={{ marginBottom: 16, textAlign: "center" }}>
                      <img
                        src={selectedProductDetail.imageUrl}
                        alt={selectedProductDetail.name}
                        style={{ maxHeight: 200, maxWidth: "100%", borderRadius: "var(--radius-md)", border: "1px solid var(--slate-200)" }}
                      />
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                    <div style={{ padding: 12, backgroundColor: "var(--slate-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--slate-200)" }}>
                      <div style={{ fontSize: "0.72rem", color: "var(--slate-500)", fontWeight: 600 }}>LIST PRICE (INR)</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--slate-900)", marginTop: 4 }}>
                        ₹{Number(selectedProductDetail.listPrice).toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--slate-400)" }}>GST: {selectedProductDetail.gstPercent}% (HSN {selectedProductDetail.hsnCode})</div>
                    </div>

                    <div style={{ padding: 12, backgroundColor: "var(--slate-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--slate-200)" }}>
                      <div style={{ fontSize: "0.72rem", color: "var(--slate-500)", fontWeight: 600 }}>CURRENT PHYSICAL STOCK</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>
                        {Number(selectedProductDetail.inventory?.physicalQuantity || 0)} {selectedProductDetail.unitOfMeasure}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--slate-400)" }}>Reserved: {Number(selectedProductDetail.inventory?.reservedQuantity || 0)}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--slate-800)", marginBottom: 6 }}>Description</h4>
                    <p style={{ fontSize: "0.82rem", color: "var(--slate-600)", lineHeight: 1.5 }}>
                      {selectedProductDetail.description || "No description provided."}
                    </p>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--slate-800)", marginBottom: 8 }}>Technical Parameters</h4>
                    <table className="data-table">
                      <tbody>
                        <tr><td><strong>Diameter / Section</strong></td><td>{selectedProductDetail.diameter || "N/A"}</td></tr>
                        <tr><td><strong>Length</strong></td><td>{selectedProductDetail.length || "N/A"}</td></tr>
                        <tr><td><strong>Model Code</strong></td><td>{selectedProductDetail.modelName || "N/A"}</td></tr>
                        <tr><td><strong>Manufacturing Type</strong></td><td>{selectedProductDetail.isManufactured ? "In-House Manufacturing" : "Bought-out Material"}</td></tr>
                        <tr><td><strong>Drawing Number</strong></td><td style={{ fontFamily: "monospace" }}>{selectedProductDetail.drawingId || "N/A"}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {detailTab === "specs" && (
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--slate-800)", marginBottom: 12 }}>Product Specifications Register</h4>
                  {selectedProductDetail.productSpecifications?.length === 0 ? (
                    <p style={{ fontSize: "0.82rem", color: "var(--slate-500)" }}>No formal specifications recorded.</p>
                  ) : (
                    selectedProductDetail.productSpecifications.map((s) => (
                      <div key={s.id} style={{ border: "1px solid var(--slate-200)", borderRadius: "var(--radius-md)", padding: 14, marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontWeight: 700, color: "var(--slate-900)" }}>{s.revision}</span>
                          <span className={`badge ${s.status === "RELEASED" ? "badge-released" : "badge-draft"}`}>{s.status}</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--slate-500)", marginBottom: 8 }}>Drawing Ref: {s.drawingNumber || "N/A"}</div>
                        <pre style={{ fontSize: "0.75rem", backgroundColor: "var(--slate-50)", padding: 10, borderRadius: 6, overflowX: "auto" }}>
                          {JSON.stringify(s.specification, null, 2)}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailTab === "boms" && (
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--slate-800)", marginBottom: 12 }}>Bill of Materials Revisions</h4>
                  {selectedProductDetail.bomRevisions?.length === 0 ? (
                    <p style={{ fontSize: "0.82rem", color: "var(--slate-500)" }}>No BOM created for this product yet.</p>
                  ) : (
                    selectedProductDetail.bomRevisions.map((b) => (
                      <div key={b.id} style={{ border: "1px solid var(--slate-200)", borderRadius: "var(--radius-md)", padding: 14, marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontWeight: 700, color: "var(--primary)" }}>{b.revision}</span>
                          <span className="badge badge-released">{b.status}</span>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--slate-600)", marginBottom: 10 }}>{b.notes}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: "0.75rem", marginBottom: 10 }}>
                          <div>Material: <strong>₹{Number(b.materialCost)}</strong></div>
                          <div>Labor: <strong>₹{Number(b.laborCost)}</strong></div>
                          <div>Overhead: <strong>₹{Number(b.overheadCost)}</strong></div>
                        </div>
                        <h5 style={{ fontSize: "0.78rem", fontWeight: 700, marginTop: 10, marginBottom: 6 }}>Components ({b.items.length})</h5>
                        <ul style={{ fontSize: "0.78rem", paddingLeft: 18, color: "var(--slate-700)" }}>
                          {b.items.map((it) => (
                            <li key={it.id}>
                              {it.component?.sku} ({it.component?.name}): {Number(it.quantity)} {it.component?.unitOfMeasure} (+{Number(it.scrapPercent)}% scrap)
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailTab === "media" && (
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--slate-800)", marginBottom: 12 }}>Engineering Media & Drawings</h4>
                  {selectedProductDetail.mediaAssets?.length === 0 ? (
                    <p style={{ fontSize: "0.82rem", color: "var(--slate-500)" }}>No media assets linked to this product.</p>
                  ) : (
                    selectedProductDetail.mediaAssets.map((m) => (
                      <div key={m.id} style={{ border: "1px solid var(--slate-200)", borderRadius: "var(--radius-md)", padding: 12, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{m.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>Type: {m.type} • Rev: {m.revision || "R1"}</div>
                        </div>
                        <a href={m.storageKey} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">
                          Open <ExternalLink size={12} />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
