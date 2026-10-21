import React from 'react';
import { Menu } from 'lucide-react';

export default function Header({ onToggleMobileMenu }) {
  const userName = 'ERP Test Admin';

  return (
    <header className="reference-header">
      <div className="reference-header-left">
        <button
          className="mobile-menu-trigger"
          onClick={onToggleMobileMenu}
          aria-label="Open sidebar menu"
        >
          <Menu size={18} />
        </button>
        <span className="reference-header-breadcrumb">
          Workforce, Admin & MIS · Module 7
        </span>
      </div>

      <div className="reference-header-right">
        <span className="reference-header-user">{userName}</span>
      </div>
    </header>
  );
}
