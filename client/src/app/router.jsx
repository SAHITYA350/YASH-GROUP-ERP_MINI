import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layout
import MainLayout from '../layouts/MainLayout';

// Module 6: Finance & Commercial Pages
import FinanceDashboard from '../modules/finance/pages/FinanceDashboard';
import InvoicesPage from '../modules/finance/pages/InvoicesPage';
import InvoiceDetailsPage from '../modules/finance/pages/InvoiceDetailsPage';
import ReceivablesPage from '../modules/finance/pages/ReceivablesPage';
import PaymentsPage from '../modules/finance/pages/PaymentsPage';
import VendorBillsPage from '../modules/finance/pages/VendorBillsPage';
import ExpensesPage from '../modules/finance/pages/ExpensesPage';
import CostingPage from '../modules/finance/pages/CostingPage';
import FinanceReportsPage from '../modules/finance/pages/FinanceReportsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/finance/dashboard" replace />,
      },
      {
        path: 'finance',
        children: [
          {
            index: true,
            element: <Navigate to="/finance/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <FinanceDashboard />,
          },
          {
            path: 'invoices',
            element: <InvoicesPage />,
          },
          {
            path: 'invoices/:id',
            element: <InvoiceDetailsPage />,
          },
          {
            path: 'receivables',
            element: <ReceivablesPage />,
          },
          {
            path: 'payments',
            element: <PaymentsPage />,
          },
          {
            path: 'vendor-bills',
            element: <VendorBillsPage />,
          },
          {
            path: 'expenses',
            element: <ExpensesPage />,
          },
          {
            path: 'costing',
            element: <CostingPage />,
          },
          {
            path: 'reports',
            element: <FinanceReportsPage />,
          },
        ],
      },
      // Backwards-compatible aliases directly mapping to finance sections
      {
        path: 'dashboard',
        element: <Navigate to="/finance/dashboard" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/finance/dashboard" replace />,
  },
]);

export default router;
