import DataList from "../components/DataList.jsx";
import { money } from "../utils/formatters.js";

export default function ProductsPage() {
  return (
    <DataList
      resource="products"
      title="Product catalogue"
      columns={["SKU", "Product", "Variant", "Unit", "List price"]}
      row={(product) => (
        <tr key={product.id}>
          <td>{product.sku}</td>
          <td>
            <b>{product.name}</b>
          </td>
          <td>{product.variant || "—"}</td>
          <td>{product.unitOfMeasure}</td>
          <td>{money(product.listPrice)}</td>
        </tr>
      )}
    />
  );
}