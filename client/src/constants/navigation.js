export const navigation = [
  {
    title: "WORKSPACE",
    links: [
      ["dashboard", "Overview", "◫"],
      ["planning", "Planning", "▦"],
    ],
  },
  {
    title: "PRODUCTION",
    links: [
      ["orders", "Production orders", "▤"],
      ["work-orders", "Work orders", "▧"],
      ["tracking", "Production tracking", "◷"],
      ["workers", "Worker allocation", "♙"],
      ["machines", "Machine management", "⚙"],
      ["materials", "Material consumption", "▥"],
      ["complete", "Production complete", "✓"],
      ["bom", "Bill of materials", "⊞"],
    ],
  },
  {
    title: "QUALITY",
    links: [
      ["inspections", "Inspections", "⌕"],
      ["defects", "Defects", "⚑"],
      ["rework", "Rework", "↻"],
      ["reports", "Quality reports", "▥"],
    ],
  },
];

export const titles = {
  ...Object.fromEntries(
    navigation.flatMap((group) =>
      group.links.map(([key, label]) => [key, label]),
    ),
  ),
  "order-detail": "Work order details",
};

export const today = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

export const weekday = new Intl.DateTimeFormat("en-IN", { weekday: "long" })
  .format(new Date())
  .toUpperCase();

export const modalTitles = {
  order: "Create production order",
  editOrder: "Edit production order",
  machine: "Add machine",
  worker: "Allocate a worker",
  inspection: "Record quality inspection",
  defect: "Log a quality defect",
  rework: "Create a rework order",
  tracking: "Record production output",
  consumption: "Record material consumption",
  assignMachine: "Assign a machine",
  bom: "Create BOM revision",
};
