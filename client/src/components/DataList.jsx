import { useState } from "react";
import { Search } from "lucide-react";
import useApi from "../hooks/useApi.js";
import { Empty, ErrorMessage, PageHeader } from "./ui.jsx";

export default function DataList({ resource, title, columns, row, action }) {
  const [search, setSearch] = useState("");
  const query = useApi(`/${resource}?search=${encodeURIComponent(search)}`);

  return (
    <>
      <PageHeader title={title}>{action}</PageHeader>
      <div className="panel">
        <label className="search">
          <Search size={17} />
          <input
            aria-label={`Search ${title}`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search records…"
          />
        </label>
        {query.loading ? (
          <p className="pad">Loading…</p>
        ) : query.error ? (
          <ErrorMessage error={query.error} />
        ) : (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {query.data.data.length ? (
                  query.data.data.map(row)
                ) : (
                  <tr>
                    <td colSpan={columns.length}>
                      <Empty message={`No ${title.toLowerCase()} found.`} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}