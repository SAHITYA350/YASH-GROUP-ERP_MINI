// client/src/components/layout/Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  apiOnline = true,
  counts = {},
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (tab, routePath) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
    if (routePath) {
      navigate(routePath);
    }
    if (sidebarOpen && setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const isCurrent = (tab, routePrefix) => {
    if (activeTab === tab) return true;
    if (routePrefix && location.pathname.startsWith(routePrefix)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay show"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="logo">
            <span>YG</span>
          </div>
          <div className="brand-info">
            <h1>YASH ERP</h1>
            <small>Enterprise Control System</small>
          </div>
          <button 
            type="button" 
            className="sidebar-close-btn" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            ✕
          </button>
        </div>

        {/* =========================================================
            MODULE 01 SECTION: SALES & CLIENT RELATIONS
           ========================================================= */}
        <div className="vtag">
          <div className="vtag-header">
            <span className="vtag-pulse"></span>
            <b>MODULE 01 · SALES & CLIENTS</b>
          </div>
          <span>Leads · Quotes · Orders · Access</span>
        </div>

        <div className="navgroup">
          <div className="navlabel">SALES & CRM</div>

          <button
            type="button"
            className={`navbtn ${isCurrent('customers', '/sales/customers') ? 'active' : ''}`}
            onClick={() => handleNavClick('customers', '/sales/customers')}
          >
            <span className="navico">👥</span>
            <div className="nav-text">
              <b>Customers</b>
              <small>Client Master Directory</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('enquiries', '/sales/enquiries') ? 'active' : ''}`}
            onClick={() => handleNavClick('enquiries', '/sales/enquiries')}
          >
            <span className="navico">💬</span>
            <div className="nav-text">
              <b>Enquiries & Leads</b>
              <small>Pipeline & Opportunities</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('quotations', '/sales/quotations') ? 'active' : ''}`}
            onClick={() => handleNavClick('quotations', '/sales/quotations')}
          >
            <span className="navico">📑</span>
            <div className="nav-text">
              <b>Quotations</b>
              <small>Proposals & Pricing</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('orders', '/sales/orders') ? 'active' : ''}`}
            onClick={() => handleNavClick('orders', '/sales/orders')}
          >
            <span className="navico">🛒</span>
            <div className="nav-text">
              <b>Sales Orders</b>
              <small>Confirmed Work Orders</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('products', '/sales/products') ? 'active' : ''}`}
            onClick={() => handleNavClick('products', '/sales/products')}
          >
            <span className="navico">📦</span>
            <div className="nav-text">
              <b>Product Catalog</b>
              <small>SKUs & Specs</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('access', '/sales/access') ? 'active' : ''}`}
            onClick={() => handleNavClick('access', '/sales/access')}
          >
            <span className="navico">🔒</span>
            <div className="nav-text">
              <b>Access Control</b>
              <small>RBAC Permissions</small>
            </div>
          </button>
        </div>

        {/* =========================================================
            MODULE 02 SECTION: VENDOR, PROCUREMENT & INVENTORY
           ========================================================= */}
        <div className="vtag" style={{ marginTop: '16px' }}>
          <div className="vtag-header">
            <span className="vtag-pulse"></span>
            <b>MODULE 02 · VENDOR & SUPPLY</b>
          </div>
          <span>Procurement · RFQ · PO · Inventory & GRN</span>
        </div>

        <div className="navgroup">
          <div className="navlabel">PROCUREMENT & INVENTORY</div>

          <button
            type="button"
            className={`navbtn ${isCurrent('vendors', '/procurement/vendors') ? 'active' : ''}`}
            onClick={() => handleNavClick('vendors', '/procurement/vendors')}
          >
            <span className="navico">🏢</span>
            <div className="nav-text">
              <b>Vendor Management</b>
              <small>Master · rating · capability</small>
            </div>
            {counts.vendors !== undefined && (
              <span className="nav-badge">{counts.vendors}</span>
            )}
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('procurement', '/procurement/orders') ? 'active' : ''}`}
            onClick={() => handleNavClick('procurement', '/procurement/orders')}
          >
            <span className="navico">📋</span>
            <div className="nav-text">
              <b>Procurement & PO</b>
              <small>PR · RFQ · compare · release</small>
            </div>
            {counts.purchaseOrders !== undefined && (
              <span className="nav-badge">{counts.purchaseOrders}</span>
            )}
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('inventory', '/procurement/inventory') ? 'active' : ''}`}
            onClick={() => handleNavClick('inventory', '/procurement/inventory')}
          >
            <span className="navico">📦</span>
            <div className="nav-text">
              <b>Inventory & Receipt</b>
              <small>GRN · stock · bin transfer</small>
            </div>
            {counts.inventory !== undefined && (
              <span className="nav-badge">{counts.inventory}</span>
            )}
          </button>
        </div>

        {/* =========================================================
            MODULE 05 SECTION: SITE & FIELD OPS
           ========================================================= */}
        <div className="vtag" style={{ marginTop: '16px' }}>
          <div className="vtag-header">
            <span className="vtag-pulse"></span>
            <b>MODULE 05 · SITE & FIELD OPS</b>
          </div>
          <span>Projects · Installation · Service</span>
        </div>

        <div className="navgroup">
          <div className="navlabel">FIELD & CLIENT OPERATIONS</div>

          <button
            type="button"
            className={`navbtn ${isCurrent('projects', '/operations/projects') ? 'active' : ''}`}
            onClick={() => handleNavClick('projects', '/operations/projects')}
          >
            <span className="navico">⌂</span>
            <div className="nav-text">
              <b>Project & Site Planning</b>
              <small>Survey · timeline · team</small>
            </div>
            {counts.projects !== undefined && (
              <span className="nav-badge">{counts.projects}</span>
            )}
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('installation', '/operations/installations') ? 'active' : ''}`}
            onClick={() => handleNavClick('installation', '/operations/installations')}
          >
            <span className="navico">⚙</span>
            <div className="nav-text">
              <b>Installation & Commissioning</b>
              <small>Site work · test · proof</small>
            </div>
            {counts.installations !== undefined && (
              <span className="nav-badge">{counts.installations}</span>
            )}
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('service', '/operations/service') ? 'active' : ''}`}
            onClick={() => handleNavClick('service', '/operations/service')}
          >
            <span className="navico">⚒</span>
            <div className="nav-text">
              <b>Service & Warranty</b>
              <small>Complaint · warranty · visit</small>
            </div>
            {counts.service !== undefined && (
              <span className="nav-badge">{counts.service}</span>
            )}
          </button>
        </div>

        {/* =========================================================
            MODULE 06 SECTION: FINANCE & COMMERCIAL
           ========================================================= */}
        <div className="vtag" style={{ marginTop: '16px' }}>
          <div className="vtag-header">
            <span className="vtag-pulse"></span>
            <b>MODULE 06 · COMMERCIAL & FINANCE</b>
          </div>
          <span>Billing · GST · Receivables · Costing</span>
        </div>

        <div className="navgroup">
          <div className="navlabel">COMMERCIAL DESK</div>

          <button
            type="button"
            className={`navbtn ${isCurrent('finance-dashboard', '/finance/dashboard') ? 'active' : ''}`}
            onClick={() => handleNavClick('finance-dashboard', '/finance/dashboard')}
          >
            <span className="navico">💰</span>
            <div className="nav-text">
              <b>Finance Dashboard</b>
              <small>Cashflow & Commercial KPI</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('finance-invoices', '/finance/invoices') ? 'active' : ''}`}
            onClick={() => handleNavClick('finance-invoices', '/finance/invoices')}
          >
            <span className="navico">🧾</span>
            <div className="nav-text">
              <b>Invoices & Tax Invoicing</b>
              <small>GST Invoices & Credit Notes</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('finance-receivables', '/finance/receivables') ? 'active' : ''}`}
            onClick={() => handleNavClick('finance-receivables', '/finance/receivables')}
          >
            <span className="navico">💳</span>
            <div className="nav-text">
              <b>Receivables & Ageing</b>
              <small>Customer outstanding & follow-up</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('finance-payments', '/finance/payments') ? 'active' : ''}`}
            onClick={() => handleNavClick('finance-payments', '/finance/payments')}
          >
            <span className="navico">💵</span>
            <div className="nav-text">
              <b>Payments Received</b>
              <small>NEFT / RTGS & Bank receipts</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('finance-bills', '/finance/vendor-bills') ? 'active' : ''}`}
            onClick={() => handleNavClick('finance-bills', '/finance/vendor-bills')}
          >
            <span className="navico">📑</span>
            <div className="nav-text">
              <b>Vendor Bills & Payables</b>
              <small>Supplier liability & payments</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('finance-expenses', '/finance/expenses') ? 'active' : ''}`}
            onClick={() => handleNavClick('finance-expenses', '/finance/expenses')}
          >
            <span className="navico">🏷️</span>
            <div className="nav-text">
              <b>Direct Site Expenses</b>
              <small>Travel, diesel & lodging</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('finance-costing', '/finance/costing') ? 'active' : ''}`}
            onClick={() => handleNavClick('finance-costing', '/finance/costing')}
          >
            <span className="navico">📈</span>
            <div className="nav-text">
              <b>Job Costing & Profit</b>
              <small>Revenue vs actual site expense</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('finance-reports', '/finance/reports') ? 'active' : ''}`}
            onClick={() => handleNavClick('finance-reports', '/finance/reports')}
          >
            <span className="navico">📊</span>
            <div className="nav-text">
              <b>Audit & MIS Reports</b>
              <small>GSTR-1, P&L & Cash summary</small>
            </div>
          </button>
        </div>

        {/* =========================================================
            MODULE 07 SECTION: WORKFORCE & MIS
           ========================================================= */}
        <div className="vtag" style={{ marginTop: '16px' }}>
          <div className="vtag-header">
            <span className="vtag-pulse"></span>
            <b>MODULE 07 · HR & WORKFORCE</b>
          </div>
          <span>HR · Payroll · Leaves · MIS & Tasks</span>
        </div>

        <div className="navgroup">
          <div className="navlabel">WORKFORCE & MANAGEMENT</div>

          <button
            type="button"
            className={`navbtn ${isCurrent('employees', '/workforce/employees') ? 'active' : ''}`}
            onClick={() => handleNavClick('employees', '/workforce/employees')}
          >
            <span className="navico">👥</span>
            <div className="nav-text">
              <b>Employees & Payroll</b>
              <small>Staff · attendance · salary</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('leaves', '/workforce/leaves') ? 'active' : ''}`}
            onClick={() => handleNavClick('leaves', '/workforce/leaves')}
          >
            <span className="navico">📅</span>
            <div className="nav-text">
              <b>Leave Management</b>
              <small>Approvals · balances · requests</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('tasks', '/workforce/tasks') ? 'active' : ''}`}
            onClick={() => handleNavClick('tasks', '/workforce/tasks')}
          >
            <span className="navico">✓</span>
            <div className="nav-text">
              <b>Tasks & Approvals</b>
              <small>Workflow · audit · decisions</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('mis', '/workforce/mis') ? 'active' : ''}`}
            onClick={() => handleNavClick('mis', '/workforce/mis')}
          >
            <span className="navico">📊</span>
            <div className="nav-text">
              <b>Management MIS</b>
              <small>Analytics · operational reports</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('trace', '/workforce/matrix') ? 'active' : ''}`}
            onClick={() => handleNavClick('trace', '/workforce/matrix')}
          >
            <span className="navico">💼</span>
            <div className="nav-text">
              <b>Job Matrix</b>
              <small>End-to-end execution</small>
            </div>
          </button>

          <button
            type="button"
            className={`navbtn ${isCurrent('media', '/workforce/media') ? 'active' : ''}`}
            onClick={() => handleNavClick('media', '/workforce/media')}
          >
            <span className="navico">📁</span>
            <div className="nav-text">
              <b>Media Library</b>
              <small>Site photos · documents</small>
            </div>
          </button>
        </div>

        <div className="sidebar-footer">
          <div className={`connection-pill ${apiOnline ? 'online' : 'offline'}`}>
            <span className="connection-dot"></span>
            <span>{apiOnline ? 'ERP Core Online' : 'Backend Reconnecting'}</span>
          </div>
          <div className="db-info-pill">
            <small>Integrated 5-Module PERN ERP</small>
          </div>
        </div>
      </aside>
    </>
  );
}
