// client/src/components/common/Module2Modals.jsx
import React, { useState } from 'react';
import DatePickerField from './DatePickerField';

/* =========================================================================
   1. CREATE / EDIT VENDOR MODAL
   ========================================================================= */
export function CreateVendorModal({ initialData, onClose, onSubmit }) {
  const isEdit = Boolean(initialData?.id);
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    name: initialData?.name || '',
    category: initialData?.category || 'RAW_MATERIAL',
    contactPerson: initialData?.contactPerson || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    city: initialData?.city || 'Pune',
    state: initialData?.state || 'Maharashtra',
    gstin: initialData?.gstin || '',
    pan: initialData?.pan || '',
    paymentTerms: initialData?.paymentTerms || '30 Days Net',
    leadTimeDays: initialData?.leadTimeDays ?? 3,
    rating: initialData?.rating ?? 4.5,
    isActive: initialData?.isActive ?? true,
    notes: initialData?.notes || '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      leadTimeDays: parseInt(formData.leadTimeDays, 10) || 0,
      rating: parseFloat(formData.rating) || 4.0,
      id: initialData?.id,
    });
  };

  return (
    <div className="modalback" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        <form onSubmit={handleSubmit}>
          <div className="modalhead">
            <h3>{isEdit ? 'Edit Vendor Master Record' : 'Register Qualified Vendor'}</h3>
            <button type="button" className="modalclose" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modalbody">
            <div className="form-grid-pro">
              <div className="form-item">
                <label>Vendor Code *</label>
                <input
                  name="code"
                  required
                  placeholder="e.g. VND-011"
                  value={formData.code}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="RAW_MATERIAL">Raw Material (Copper/Steel/Minerals)</option>
                  <option value="PACKAGING">Packaging & Crating</option>
                  <option value="CONSUMABLE">Consumables & Hardware</option>
                  <option value="EQUIPMENT">Equipment & Machinery</option>
                  <option value="SERVICE">External Job Work / Service</option>
                </select>
              </div>

              <div className="form-item span2">
                <label>Company / Vendor Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Apex Copper Solutions Pvt Ltd"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Contact Person</label>
                <input
                  name="contactPerson"
                  placeholder="e.g. Rajesh Patil"
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Phone / WhatsApp *</label>
                <input
                  name="phone"
                  required
                  placeholder="e.g. +91 98220 12345"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. sales@apexcopper.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>City *</label>
                <input
                  name="city"
                  required
                  placeholder="e.g. Pune / Mumbai / Nashik"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item span2">
                <label>Factory / Office Address</label>
                <input
                  name="address"
                  placeholder="e.g. Plot 42, Bhosari MIDC, Pune, Maharashtra 411026"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>GSTIN (15 Digits)</label>
                <input
                  name="gstin"
                  placeholder="e.g. 27AABCT3518Q1Z4"
                  value={formData.gstin}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>PAN Number</label>
                <input
                  name="pan"
                  placeholder="e.g. AABCT3518Q"
                  value={formData.pan}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Lead Time (Days)</label>
                <input
                  type="number"
                  name="leadTimeDays"
                  min="1"
                  max="120"
                  value={formData.leadTimeDays}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Quality / Capability Rating (1-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item span2">
                <label>Payment Terms</label>
                <input
                  name="paymentTerms"
                  placeholder="e.g. 30 Days Net, 20% Advance + 80% Against Dispatch"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item span2">
                <label>Manufacturing Capability & Quality Notes</label>
                <textarea
                  name="notes"
                  rows="2"
                  placeholder="e.g. ISO 9001 certified, tested up to 25kA fault current tolerance..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item span2">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span><b>Active in Qualified Supplier Master</b> (Approved for RFQs and PO release)</span>
                </label>
              </div>
            </div>
          </div>
          <div className="modalfoot">
            <button type="submit" className="btn primary">
              {isEdit ? '✓ Update Vendor' : '✓ Register & Authorize Vendor'}
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   2. CREATE PURCHASE ORDER (PO) MODAL
   ========================================================================= */
export function CreatePOModal({ vendors = [], products = [], onClose, onSubmit }) {
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState('');
  const [vendorId, setVendorId] = useState(vendors[0]?.id || '');
  const [poNumber, setPoNumber] = useState(`PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [paymentTerms, setPaymentTerms] = useState('30 Days Net');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('DRAFT');

  // Line items state
  const [items, setItems] = useState([
    {
      productId: products[0]?.id || '',
      quantity: 10,
      unitPrice: 1200,
    },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: products[0]?.id || '', quantity: 1, unitPrice: 500 },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const calculatedTotal = items.reduce(
    (sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0),
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vendorId) {
      alert('Please select a vendor.');
      return;
    }
    const cleanItems = items.map((it) => ({
      productId: parseInt(it.productId, 10),
      quantity: parseFloat(it.quantity) || 1,
      unitPrice: parseFloat(it.unitPrice) || 0,
      totalPrice: (parseFloat(it.quantity) || 1) * (parseFloat(it.unitPrice) || 0),
    }));

    onSubmit({
      poNumber,
      vendorId: parseInt(vendorId, 10),
      orderDate: orderDate ? new Date(orderDate).toISOString() : new Date().toISOString(),
      expectedDate: expectedDate ? new Date(expectedDate).toISOString() : null,
      total: calculatedTotal,
      status,
      paymentTerms,
      notes,
      items: cleanItems,
    });
  };

  return (
    <div className="modalback" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          <div className="modalhead">
            <h3>Release Authoritative Purchase Order (PO)</h3>
            <button type="button" className="modalclose" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modalbody">
            <div className="form-grid-pro">
              <div className="form-item">
                <label>PO Number *</label>
                <input
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  required
                  placeholder="e.g. PO-2026-009"
                />
              </div>

              <div className="form-item">
                <label>Select Qualified Vendor *</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  required
                >
                  <option value="">Choose Supplier...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.code} — {v.name} ({v.city || 'Standard'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-item">
                <label>PO Issue Date *</label>
                <DatePickerField
                  value={orderDate}
                  onChange={setOrderDate}
                  placeholder="Select order date"
                />
              </div>

              <div className="form-item">
                <label>Expected Delivery Date *</label>
                <DatePickerField
                  value={expectedDate}
                  onChange={setExpectedDate}
                  placeholder="Target delivery date"
                />
              </div>

              <div className="form-item">
                <label>Initial Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="DRAFT">DRAFT (Pending Approval)</option>
                  <option value="SENT">SENT (Transmitted to Vendor)</option>
                  <option value="CONFIRMED">CONFIRMED (Accepted by Vendor)</option>
                </select>
              </div>

              <div className="form-item">
                <label>Commercial Payment Terms</label>
                <input
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g. 30 Days Net, 100% on GRN"
                />
              </div>

              {/* LINE ITEMS */}
              <div className="form-item span2" style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0 }}><b>Order Line Items (BOM / Material Requirement)</b></label>
                  <button type="button" className="btn" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={handleAddItem}>
                    ＋ Add Item
                  </button>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 100px 120px 100px 30px',
                        gap: '8px',
                        alignItems: 'center',
                        marginBottom: idx < items.length - 1 ? '8px' : 0,
                      }}
                    >
                      <div>
                        <small style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Product / Material</small>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          style={{ width: '100%', fontSize: '12px' }}
                          required
                        >
                          <option value="">Select product...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <small style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Quantity</small>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          style={{ width: '100%', fontSize: '12px' }}
                          required
                        />
                      </div>

                      <div>
                        <small style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Unit Price (₹)</small>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          style={{ width: '100%', fontSize: '12px' }}
                          required
                        />
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <small style={{ color: 'var(--muted)', display: 'block', fontSize: '10px' }}>Line Total</small>
                        <span style={{ fontWeight: 600, fontSize: '12px', color: '#166534' }}>
                          ₹{((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            style={{
                              background: '#fee2e2',
                              border: 'none',
                              color: '#b91c1c',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              padding: '4px 6px',
                              fontSize: '11px',
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #cbd5e1', display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Calculated Total PO Value:</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#173d31' }}>
                      ₹{calculatedTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-item span2">
                <label>Special Terms / Dispatch Instructions</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Material test certificate required with shipment, gate entry before 4 PM..."
                />
              </div>
            </div>
          </div>
          <div className="modalfoot">
            <button type="submit" className="btn primary">
              ✓ Generate & Transmit PO
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   3. CREATE PURCHASE REQUEST (PR) MODAL
   ========================================================================= */
export function CreatePRModal({ products = [], onClose, onSubmit }) {
  const [requiredDate, setRequiredDate] = useState('');
  const [formData, setFormData] = useState({
    prNumber: `PR-${Math.floor(100 + Math.random() * 900)}`,
    materialName: '',
    productId: products[0]?.id || '',
    quantity: 50,
    priority: 'MEDIUM',
    reason: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selProd = products.find((p) => p.id === parseInt(formData.productId, 10));
    onSubmit({
      ...formData,
      productId: formData.productId ? parseInt(formData.productId, 10) : null,
      materialName: selProd ? selProd.name : formData.materialName,
      quantity: parseFloat(formData.quantity) || 1,
      requiredDate: requiredDate ? new Date(requiredDate).toISOString() : null,
    });
  };

  return (
    <div className="modalback" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <form onSubmit={handleSubmit}>
          <div className="modalhead">
            <h3>Raise Material Purchase Request (PR)</h3>
            <button type="button" className="modalclose" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modalbody">
            <div className="form-grid-pro">
              <div className="form-item">
                <label>PR Number *</label>
                <input
                  name="prNumber"
                  required
                  value={formData.prNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium (Standard)</option>
                  <option value="HIGH">High (Factory Critical)</option>
                  <option value="URGENT">Urgent (Line Stoppage)</option>
                </select>
              </div>

              <div className="form-item span2">
                <label>Select Authoritative Product / Raw Material</label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                >
                  <option value="">Or enter custom description below...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              {!formData.productId && (
                <div className="form-item span2">
                  <label>Material Name / Specification</label>
                  <input
                    name="materialName"
                    placeholder="e.g. Copper Flat Strip 25x3mm Grade C101"
                    value={formData.materialName}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="form-item">
                <label>Required Quantity</label>
                <input
                  type="number"
                  min="1"
                  name="quantity"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Target Delivery Date</label>
                <DatePickerField
                  value={requiredDate}
                  onChange={setRequiredDate}
                  placeholder="When is material needed?"
                />
              </div>

              <div className="form-item span2">
                <label>Justification / Linked Sales Order or Project</label>
                <textarea
                  name="reason"
                  rows="2"
                  placeholder="e.g. Stock shortage for Pune Solar Substation Earthing batch release..."
                  value={formData.reason}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="modalfoot">
            <button type="submit" className="btn primary">
              ✓ Submit PR for Procurement
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   4. CREATE GOODS RECEIPT NOTE (GRN) MODAL
   ========================================================================= */
export function CreateGRNModal({ purchaseOrders = [], vendors = [], onClose, onSubmit }) {
  const [receivedDate, setReceivedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    receiptNumber: `GRN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    purchaseOrderId: purchaseOrders[0]?.id || '',
    vendorId: purchaseOrders[0]?.vendorId || vendors[0]?.id || '',
    challanNo: '',
    vehicleNo: '',
    receivedQty: 50,
    acceptedQty: 50,
    rejectedQty: 0,
    rejectionReason: '',
    qcStatus: 'ACCEPTED',
    warehouseLocation: 'WH-A-01',
    receivedBy: 'Store Supervisor',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'receivedQty' || name === 'rejectedQty') {
        const rec = parseFloat(name === 'receivedQty' ? value : updated.receivedQty) || 0;
        const rej = parseFloat(name === 'rejectedQty' ? value : updated.rejectedQty) || 0;
        updated.acceptedQty = Math.max(0, rec - rej);
      }
      return updated;
    });
  };

  const handlePOSelect = (e) => {
    const poId = parseInt(e.target.value, 10);
    const po = purchaseOrders.find((p) => p.id === poId);
    setFormData((prev) => ({
      ...prev,
      purchaseOrderId: poId || '',
      vendorId: po ? po.vendorId : prev.vendorId,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      receiptNumber: formData.receiptNumber,
      purchaseOrderId: formData.purchaseOrderId ? parseInt(formData.purchaseOrderId, 10) : null,
      vendorId: formData.vendorId ? parseInt(formData.vendorId, 10) : null,
      receivedDate: receivedDate ? new Date(receivedDate).toISOString() : new Date().toISOString(),
      challanNo: formData.challanNo,
      vehicleNo: formData.vehicleNo,
      receivedQty: parseFloat(formData.receivedQty) || 0,
      acceptedQty: parseFloat(formData.acceptedQty) || 0,
      rejectedQty: parseFloat(formData.rejectedQty) || 0,
      rejectionReason: formData.rejectionReason,
      qcStatus: formData.qcStatus,
      warehouseLocation: formData.warehouseLocation,
      receivedBy: formData.receivedBy,
      notes: formData.notes,
    });
  };

  return (
    <div className="modalback" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        <form onSubmit={handleSubmit}>
          <div className="modalhead">
            <h3>Gate Inward & Goods Receipt Note (GRN)</h3>
            <button type="button" className="modalclose" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modalbody">
            <div className="form-grid-pro">
              <div className="form-item">
                <label>GRN Document No *</label>
                <input
                  name="receiptNumber"
                  required
                  value={formData.receiptNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Link to Purchase Order (PO)</label>
                <select
                  name="purchaseOrderId"
                  value={formData.purchaseOrderId}
                  onChange={handlePOSelect}
                >
                  <option value="">Direct Gate Inward / Spot Receipt</option>
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.poNumber} — {po.vendor?.name || 'Vendor'} (₹{Number(po.total).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-item">
                <label>Supplier / Vendor *</label>
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Vendor...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-item">
                <label>Gate Inward Date *</label>
                <DatePickerField
                  value={receivedDate}
                  onChange={setReceivedDate}
                  placeholder="Select gate entry date"
                />
              </div>

              <div className="form-item">
                <label>Delivery Challan / Invoice No *</label>
                <input
                  name="challanNo"
                  required
                  placeholder="e.g. DC-2026/8849"
                  value={formData.challanNo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Vehicle / Transporter No</label>
                <input
                  name="vehicleNo"
                  placeholder="e.g. MH-12-PQ-9941"
                  value={formData.vehicleNo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Total Physical Received Qty *</label>
                <input
                  type="number"
                  min="1"
                  name="receivedQty"
                  required
                  value={formData.receivedQty}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>QC Accepted Qty *</label>
                <input
                  type="number"
                  min="0"
                  name="acceptedQty"
                  required
                  value={formData.acceptedQty}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Rejected Qty</label>
                <input
                  type="number"
                  min="0"
                  name="rejectedQty"
                  value={formData.rejectedQty}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Quality Inspection Decision</label>
                <select name="qcStatus" value={formData.qcStatus} onChange={handleChange}>
                  <option value="ACCEPTED">QC Passed (Full Acceptance)</option>
                  <option value="PARTIALLY_ACCEPTED">Partially Accepted / Concession</option>
                  <option value="REJECTED">Full Rejection (Return to Vendor)</option>
                </select>
              </div>

              <div className="form-item">
                <label>Put-Away Warehouse Bin Location *</label>
                <input
                  name="warehouseLocation"
                  required
                  placeholder="e.g. WH-A-01, RM-YARD-02"
                  value={formData.warehouseLocation}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Inspected & Gate Entered By</label>
                <input
                  name="receivedBy"
                  placeholder="e.g. Suresh Shinde"
                  value={formData.receivedBy}
                  onChange={handleChange}
                />
              </div>

              {Number(formData.rejectedQty) > 0 && (
                <div className="form-item span2">
                  <label style={{ color: '#b91c1c' }}>Rejection Reason / QC Discrepancy Note</label>
                  <input
                    name="rejectionReason"
                    placeholder="e.g. Copper coating thickness under 250 microns, surface pitting..."
                    value={formData.rejectionReason}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="form-item span2">
                <label>Gate Entry & Receiving Remarks</label>
                <textarea
                  name="notes"
                  rows="2"
                  placeholder="e.g. Weighbridge slip verified, packaging intact..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="modalfoot">
            <button type="submit" className="btn primary">
              ✓ Issue GRN & Update Inventory
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   5. RECORD STOCK MOVEMENT MODAL
   ========================================================================= */
export function StockMoveModal({ inventory = [], products = [], onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    productId: inventory[0]?.productId || products[0]?.id || '',
    movementType: 'TRANSFER', // 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT'
    quantity: 10,
    fromLocation: inventory[0]?.warehouseLocation || 'CENTRAL-WAREHOUSE',
    toLocation: 'LINE-FEED-A',
    referenceNo: `TR-${Math.floor(100 + Math.random() * 900)}`,
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productId) {
      alert('Please select a product.');
      return;
    }
    onSubmit({
      ...formData,
      productId: parseInt(formData.productId, 10),
      quantity: parseFloat(formData.quantity) || 1,
    });
  };

  return (
    <div className="modalback" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <form onSubmit={handleSubmit}>
          <div className="modalhead">
            <h3>Record Material Movement / Bin Transfer</h3>
            <button type="button" className="modalclose" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modalbody">
            <div className="form-grid-pro">
              <div className="form-item span2">
                <label>Material / Inventory Item *</label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose item from stock...</option>
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.productId}>
                      {inv.product?.name} ({inv.product?.sku}) — Avail: {inv.physicalQuantity - inv.reservedQuantity} in {inv.warehouseLocation}
                    </option>
                  ))}
                  {inventory.length === 0 &&
                    products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-item">
                <label>Movement Type *</label>
                <select name="movementType" value={formData.movementType} onChange={handleChange}>
                  <option value="TRANSFER">Internal Transfer (Bin to Bin)</option>
                  <option value="OUT">Production Issue (To Shopfloor)</option>
                  <option value="IN">Direct Adjustment Inward</option>
                  <option value="ADJUSTMENT">Physical Audit Correction</option>
                </select>
              </div>

              <div className="form-item">
                <label>Quantity to Move *</label>
                <input
                  type="number"
                  min="1"
                  name="quantity"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Source Location (From)</label>
                <input
                  name="fromLocation"
                  placeholder="e.g. WH-A-01"
                  value={formData.fromLocation}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Destination Location (To)</label>
                <input
                  name="toLocation"
                  placeholder="e.g. SHOPFLOOR-BAY-3 or SITE-PUNE"
                  value={formData.toLocation}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item">
                <label>Reference Job / Dispatch No</label>
                <input
                  name="referenceNo"
                  placeholder="e.g. JOB-401 or SO-118"
                  value={formData.referenceNo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-item span2">
                <label>Reason / Audit Note</label>
                <textarea
                  name="notes"
                  rows="2"
                  placeholder="e.g. Material issued to assembly team for lightning rod fabrication..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="modalfoot">
            <button type="submit" className="btn primary">
              ✓ Execute Material Movement
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
