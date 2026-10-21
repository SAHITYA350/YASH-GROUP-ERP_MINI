import Empty from "./Empty";

export default function Table({ columns, rows, emptyText }) {
  if (!rows?.length) return <Empty text={emptyText} />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? row.workOrderNo ?? row.inspectionNo ?? index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render
                    ? column.render(row)
                    : ((column.path || column.key)
                        .split(".")
                        .reduce((value, part) => value?.[part], row) ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
