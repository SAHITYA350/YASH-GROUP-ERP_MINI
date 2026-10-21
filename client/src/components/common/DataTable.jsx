import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching your criteria.',
  onRowClick = null,
}) {
  if (loading) {
    return (
      <div className="table-container" style={{ padding: '3rem 0' }}>
        <LoadingSpinner text="Fetching data..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || col.accessor || idx}
                style={{
                  textAlign: col.align || 'left',
                  width: col.width || 'auto',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => {
            const rowKey = row[keyField] || rowIdx;
            return (
              <tr
                key={rowKey}
                onClick={() => onRowClick && onRowClick(row)}
                style={{
                  cursor: onRowClick ? 'pointer' : 'default',
                }}
              >
                {columns.map((col, colIdx) => {
                  let val;
                  if (col.render) {
                    val = col.render(row, rowIdx);
                  } else if (typeof col.accessor === 'function') {
                    val = col.accessor(row);
                  } else if (col.accessor) {
                    val = row[col.accessor];
                  } else {
                    val = null;
                  }

                  return (
                    <td
                      key={col.key || col.accessor || colIdx}
                      style={{
                        textAlign: col.align || 'left',
                      }}
                    >
                      {val !== null && val !== undefined ? val : '—'}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
