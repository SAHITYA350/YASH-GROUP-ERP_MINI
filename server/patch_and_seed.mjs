import fs from "node:fs";

let code = fs.readFileSync("seed.js", "utf8");

// 1. Transaction options
code = code.replace(
  "await prisma.$transaction(async (tx) => {",
  "await prisma.$transaction(async (tx) => {\n",
);

// 2. Add timeout options to $transaction
code = code.replace(
  /await prisma\.\$transaction\s*\(\s*async\s*\(tx\)\s*=>\s*\{/,
  "await prisma.$transaction(\n    async (tx) => {"
);

code = code.replace(
  /\}\);\s*console\.log\("Demo data seeded successfully\."\);/,
  '}, { maxWait: 60000, timeout: 180000 });\n    console.log("Demo data seeded successfully.");'
);

// 3. Update machine reference to modulo
code = code.replace(
  "const machine = machines[workOrders.length - 1];",
  "const machine = machines[(workOrders.length - 1) % machines.length];"
);

// 4. Update workOrderItem upsert to findFirst + update/create
const oldItemUpsert = `        if (workOrder.bomRevisionId) {
          await tx.workOrderItem.upsert({
            where: {
              workOrderId_productId: {
                workOrderId: workOrder.id,
                productId: products[2].id,
              },
            },
            update: {
              plannedQuantity: spec.quantity * 0.8 * 1.02,
              issuedQuantity: spec.produced * 0.8,
              consumedQuantity: spec.produced * 0.8,
            },
            create: {
              workOrderId: workOrder.id,
              productId: products[2].id,
              plannedQuantity: spec.quantity * 0.8 * 1.02,
              issuedQuantity: spec.produced * 0.8,
              consumedQuantity: spec.produced * 0.8,
            },
          });
        }`;

const newItemUpsert = `        if (workOrder.bomRevisionId) {
          const existingItem = await tx.workOrderItem.findFirst({
            where: {
              workOrderId: workOrder.id,
              productId: products[2].id,
            },
          });
          const itemData = {
            plannedQuantity: spec.quantity * 0.8 * 1.02,
            issuedQuantity: spec.produced * 0.8,
            consumedQuantity: spec.produced * 0.8,
          };
          if (existingItem) {
            await tx.workOrderItem.update({
              where: { id: existingItem.id },
              data: itemData,
            });
          } else {
            await tx.workOrderItem.create({
              data: {
                workOrderId: workOrder.id,
                productId: products[2].id,
                ...itemData,
              },
            });
          }
        }`;

code = code.replace(oldItemUpsert.replace(/\r?\n/g, "\r\n"), newItemUpsert.replace(/\r?\n/g, "\r\n"));

// 5. Enrich workOrderSpecs with diverse quality data
const oldSpecs = `        {
          number: "DEMO-WO-003",
          salesOrder: salesOrders[2],
          quantity: 300,
          status: "PLANNED",
          good: 0,
          rejected: 0,
          produced: 0,
          startOffset: 4,
          endOffset: 12,
        },
      ];`;

const newSpecs = `        {
          number: "DEMO-WO-003",
          salesOrder: salesOrders[2],
          quantity: 300,
          status: "COMPLETED",
          good: 300,
          rejected: 0,
          produced: 300,
          startOffset: -10,
          endOffset: -2,
          inspection: {
            number: "DEMO-QI-003",
            status: "PASS",
            inspected: 300,
            accepted: 300,
            rejected: 0,
          },
        },
        {
          number: "DEMO-WO-004",
          salesOrder: salesOrders[0],
          quantity: 150,
          status: "QC_HOLD",
          good: 120,
          rejected: 30,
          produced: 150,
          startOffset: -5,
          endOffset: 2,
          inspection: {
            number: "DEMO-QI-004",
            status: "FAIL",
            inspected: 150,
            accepted: 120,
            rejected: 30,
          },
        },
      ];`;

code = code.replace(oldSpecs.replace(/\r?\n/g, "\r\n"), newSpecs.replace(/\r?\n/g, "\r\n"));

// 6. Update defect description for multiple defects
code = code.replace(
  'const defect = await tx.qualityDefect.findFirst({\r\n              where: {\r\n                inspectionId: inspection.id,\r\n                defectCode: "DEMO-SURFACE-FINISH",\r\n              },\r\n            });',
  `const dCode = spec.number === "DEMO-WO-004" ? "DEMO-DIMENSION-ERR" : "DEMO-SURFACE-FINISH";
            const defect = await tx.qualityDefect.findFirst({
              where: {
                inspectionId: inspection.id,
                defectCode: dCode,
              },
            });`
);

code = code.replace(
  'defectCode: "DEMO-SURFACE-FINISH",\r\n              category: "Surface finish",\r\n              description:\r\n                "Minor surface blemish found during visual inspection.",\r\n              severity: "MEDIUM",',
  `defectCode: dCode,
              category: spec.number === "DEMO-WO-004" ? "Dimensions" : "Surface finish",
              description: spec.number === "DEMO-WO-004"
                ? "Critical dimensional deviation exceeding tolerance limits."
                : "Minor surface blemish found during visual inspection.",
              severity: spec.number === "DEMO-WO-004" ? "HIGH" : "MEDIUM",`
);

fs.writeFileSync("seed.js", code, "utf8");
console.log("seed.js patched successfully.");
