// client/src/utils/excel.js
// Lightweight, zero-dependency CSV/Excel export helper

export function exportToExcel(rows, fileName = 'export.csv') {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvRows = [];

  // Header row
  csvRows.push(headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','));

  // Data rows
  for (const row of rows) {
    const values = headers.map((header) => {
      const val = row[header] ?? '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\r\n');
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const utils = {
  json_to_sheet: (data) => data,
  book_new: () => ({ Sheets: {}, SheetNames: [] }),
  book_append_sheet: (wb, ws, name) => {
    wb.Sheets[name] = ws;
    wb.SheetNames.push(name);
  },
};

export function writeFile(workbook, fileName) {
  const sheetName = workbook.SheetNames[0];
  const rows = workbook.Sheets[sheetName] || [];
  exportToExcel(rows, fileName);
}

export default {
  utils,
  writeFile,
  exportToExcel,
};
