import "dotenv/config";
import prisma from "./src/Config/prisma.js";

const dateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

async function seedDatabase() {
  try {
    await prisma.$transaction(async (tx) => {
      const productionManager = await tx.user.upsert({
        where: { email: "demo.production@yashgroup.example" },
        update: {
          name: "Demo Production Manager",
          department: "Production",
          employeeCode: "DEMO-PROD-001",
          designation: "Production Manager",
          role: "PRODUCTION_MANAGER",
          isActive: true,
        },
        create: {
          name: "Demo Production Manager",
          email: "demo.production@yashgroup.example",
          passwordHash: "demo-seed-account-no-login",
          department: "Production",
          employeeCode: "DEMO-PROD-001",
          designation: "Production Manager",
          role: "PRODUCTION_MANAGER",
        },
      });

      const qualityInspector = await tx.user.upsert({
        where: { email: "demo.quality@yashgroup.example" },
        update: {
          name: "Demo Quality Inspector",
          department: "Quality",
          employeeCode: "DEMO-QUALITY-001",
          designation: "Quality Inspector",
          role: "QUALITY_INSPECTOR",
          isActive: true,
        },
        create: {
          name: "Demo Quality Inspector",
          email: "demo.quality@yashgroup.example",
          passwordHash: "demo-seed-account-no-login",
          department: "Quality",
          employeeCode: "DEMO-QUALITY-001",
          designation: "Quality Inspector",
          role: "QUALITY_INSPECTOR",
        },
      });

      const customers = await Promise.all([
        tx.customer.upsert({
          where: { code: "DEMO-CUST-001" },
          update: { name: "Acme Components", city: "Pune", state: "Maharashtra" },
          create: {
            code: "DEMO-CUST-001",
            name: "Acme Components",
            email: "purchasing@acme.example",
            phone: "+91 90000 10001",
            city: "Pune",
            state: "Maharashtra",
          },
        }),
        tx.customer.upsert({
          where: { code: "DEMO-CUST-002" },
          update: { name: "Orion Industrial Systems", city: "Nashik", state: "Maharashtra" },
          create: {
            code: "DEMO-CUST-002",
            name: "Orion Industrial Systems",
            email: "procurement@orion.example",
            phone: "+91 90000 10002",
            city: "Nashik",
            state: "Maharashtra",
          },
        }),
      ]);

      const categories = await Promise.all([
        tx.category.upsert({
          where: { name: "Demo Finished Goods" },
          update: { type: "FINISHED_GOOD" },
          create: { name: "Demo Finished Goods", type: "FINISHED_GOOD" },
        }),
        tx.category.upsert({
          where: { name: "Demo Raw Materials" },
          update: { type: "RAW_MATERIAL" },
          create: { name: "Demo Raw Materials", type: "RAW_MATERIAL" },
        }),
      ]);

      const products = await Promise.all([
        tx.product.upsert({
          where: { sku: "DEMO-PH-001" },
          update: { name: "Industrial Plastic Housing", categoryId: categories[0].id, isManufactured: true, isActive: true },
          create: {
            sku: "DEMO-PH-001",
            name: "Industrial Plastic Housing",
            description: "Demo finished product for production and quality workflows.",
            unitOfMeasure: "PCS",
            listPrice: 425,
            isManufactured: true,
            categoryId: categories[0].id,
          },
        }),
        tx.product.upsert({
          where: { sku: "DEMO-CVR-002" },
          update: { name: "Electrical Enclosure Cover", categoryId: categories[0].id, isManufactured: true, isActive: true },
          create: {
            sku: "DEMO-CVR-002",
            name: "Electrical Enclosure Cover",
            description: "Demo finished product for production and quality workflows.",
            unitOfMeasure: "PCS",
            listPrice: 310,
            isManufactured: true,
            categoryId: categories[0].id,
          },
        }),
        tx.product.upsert({
          where: { sku: "DEMO-RESIN-001" },
          update: { name: "Moulding Resin", categoryId: categories[1].id, isManufactured: false, isActive: true },
          create: {
            sku: "DEMO-RESIN-001",
            name: "Moulding Resin",
            description: "Demo raw material used in the housing bill of materials.",
            unitOfMeasure: "KG",
            listPrice: 145,
            isManufactured: false,
            categoryId: categories[1].id,
          },
        }),
      ]);

      await Promise.all([
        tx.inventory.upsert({
          where: { productId: products[0].id },
          update: { physicalQuantity: 180, reservedQuantity: 20, reorderLevel: 50, unitCost: 220 },
          create: {
            productId: products[0].id,
            warehouseLocation: "Finished Goods",
            physicalQuantity: 180,
            reservedQuantity: 20,
            reorderLevel: 50,
            unitCost: 220,
          },
        }),
        tx.inventory.upsert({
          where: { productId: products[1].id },
          update: { physicalQuantity: 95, reservedQuantity: 10, reorderLevel: 30, unitCost: 165 },
          create: {
            productId: products[1].id,
            warehouseLocation: "Finished Goods",
            physicalQuantity: 95,
            reservedQuantity: 10,
            reorderLevel: 30,
            unitCost: 165,
          },
        }),
        tx.inventory.upsert({
          where: { productId: products[2].id },
          update: { physicalQuantity: 1200, reservedQuantity: 250, reorderLevel: 300, unitCost: 110 },
          create: {
            productId: products[2].id,
            warehouseLocation: "Raw Materials",
            physicalQuantity: 1200,
            reservedQuantity: 250,
            reorderLevel: 300,
            unitCost: 110,
          },
        }),
      ]);

      const bom = await tx.bOMRevision.upsert({
        where: { productId_revision: { productId: products[0].id, revision: "DEMO-A" } },
        update: {
          status: "RELEASED",
          materialCost: 110,
          laborCost: 35,
          overheadCost: 20,
          releasedAt: dateOffset(-30),
        },
        create: {
          productId: products[0].id,
          revision: "DEMO-A",
          status: "RELEASED",
          notes: "Demo released bill of materials.",
          materialCost: 110,
          laborCost: 35,
          overheadCost: 20,
          releasedAt: dateOffset(-30),
        },
      });

      await tx.bOMItem.upsert({
        where: { bomRevisionId_componentProductId: { bomRevisionId: bom.id, componentProductId: products[2].id } },
        update: { quantity: 0.8, scrapPercent: 2 },
        create: { bomRevisionId: bom.id, componentProductId: products[2].id, quantity: 0.8, scrapPercent: 2 },
      });

      for (const [sequence, name, workCenter, standardMinutes] of [
        [1, "Injection Moulding", "Moulding", 4],
        [2, "Visual Inspection", "Quality", 2],
        [3, "Packing", "Packing", 1],
      ]) {
        await tx.bOMOperation.upsert({
          where: { bomRevisionId_sequence: { bomRevisionId: bom.id, sequence } },
          update: { name, workCenter, standardMinutes },
          create: { bomRevisionId: bom.id, sequence, name, workCenter, standardMinutes },
        });
      }

      const orderSpecs = [
        { number: "DEMO-SO-001", customer: customers[0], product: products[0], quantity: 1000, price: 425, status: "PROCESSING", daysUntilDelivery: 8 },
        { number: "DEMO-SO-002", customer: customers[1], product: products[0], quantity: 500, price: 425, status: "PROCESSING", daysUntilDelivery: 14 },
        { number: "DEMO-SO-003", customer: customers[0], product: products[1], quantity: 300, price: 310, status: "CONFIRMED", daysUntilDelivery: 21 },
      ];
      const salesOrders = [];
      for (const spec of orderSpecs) {
        const subtotal = spec.quantity * spec.price;
        const gstAmount = subtotal * 0.18;
        const salesOrder = await tx.salesOrder.upsert({
          where: { orderNumber: spec.number },
          update: {
            customerId: spec.customer.id,
            createdById: productionManager.id,
            productSummary: spec.product.name,
            quantitySummary: `${spec.quantity} PCS`,
            status: spec.status,
            dispatchStatus: "READY_FOR_FACTORY",
            expectedDeliveryDate: dateOffset(spec.daysUntilDelivery),
            subtotal,
            gstAmount,
            grandTotal: subtotal + gstAmount,
          },
          create: {
            orderNumber: spec.number,
            customerId: spec.customer.id,
            createdById: productionManager.id,
            productSummary: spec.product.name,
            quantitySummary: `${spec.quantity} PCS`,
            status: spec.status,
            dispatchStatus: "READY_FOR_FACTORY",
            expectedDeliveryDate: dateOffset(spec.daysUntilDelivery),
            subtotal,
            gstAmount,
            grandTotal: subtotal + gstAmount,
          },
        });
        await tx.salesOrderItem.upsert({
          where: { salesOrderId_productId: { salesOrderId: salesOrder.id, productId: spec.product.id } },
          update: {
            productSkuSnapshot: spec.product.sku,
            productNameSnapshot: spec.product.name,
            quantity: spec.quantity,
            unitPrice: spec.price,
            gstPercent: 18,
            baseAmount: subtotal,
            taxableAmount: subtotal,
            gstAmount,
            lineTotal: subtotal + gstAmount,
          },
          create: {
            salesOrderId: salesOrder.id,
            productId: spec.product.id,
            productSkuSnapshot: spec.product.sku,
            productNameSnapshot: spec.product.name,
            quantity: spec.quantity,
            unitPrice: spec.price,
            gstPercent: 18,
            baseAmount: subtotal,
            taxableAmount: subtotal,
            gstAmount,
            lineTotal: subtotal + gstAmount,
          },
        });
        salesOrders.push(salesOrder);
      }

      const machines = await Promise.all(
        ["A", "B", "C"].map((suffix) =>
          tx.machine.upsert({
            where: { machineCode: `DEMO-MCH-00${suffix}` },
            update: {
              name: `Demo Injection Moulding Press ${suffix}`,
              workCenter: "Moulding",
              status: "AVAILABLE",
              capacityPerShift: 1200,
              hourlyCost: 450,
            },
            create: {
              machineCode: `DEMO-MCH-00${suffix}`,
              name: `Demo Injection Moulding Press ${suffix}`,
              workCenter: "Moulding",
              capacityPerShift: 1200,
              hourlyCost: 450,
            },
          }),
        ),
      );

      const workOrderSpecs = [
        {
          number: "DEMO-WO-001",
          salesOrder: salesOrders[0],
          quantity: 1000,
          status: "IN_PROGRESS",
          good: 190,
          rejected: 10,
          produced: 200,
          startOffset: -3,
          endOffset: 5,
          inspection: { number: "DEMO-QI-001", status: "HOLD", inspected: 200, accepted: 190, rejected: 10 },
        },
        {
          number: "DEMO-WO-002",
          salesOrder: salesOrders[1],
          quantity: 500,
          status: "IN_PROGRESS",
          good: 0,
          rejected: 0,
          produced: 100,
          startOffset: -1,
          endOffset: 9,
          inspection: { number: "DEMO-QI-002", status: "PENDING", inspected: 0, accepted: 0, rejected: 0 },
        },
        {
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
      ];
      const workOrders = [];
      for (const spec of workOrderSpecs) {
        const workOrder = await tx.workOrder.upsert({
          where: { workOrderNo: spec.number },
          update: {
            salesOrderId: spec.salesOrder.id,
            bomRevisionId: spec.salesOrder.id === salesOrders[2].id ? null : bom.id,
            createdById: productionManager.id,
            status: spec.status,
            planApprovalStatus: "APPROVED",
            planApprovedAt: dateOffset(-4),
            planApprovedById: productionManager.id,
            plannedQuantity: spec.quantity,
            goodQuantity: spec.good,
            rejectedQuantity: spec.rejected,
            producedQuantity: spec.produced,
            plannedStart: dateOffset(spec.startOffset),
            plannedEnd: dateOffset(spec.endOffset),
            actualStart: spec.produced > 0 ? dateOffset(-2) : null,
            priority: spec.number === "DEMO-WO-001" ? "HIGH" : "MEDIUM",
            notes: "Sample production order generated by the demo seed.",
          },
          create: {
            workOrderNo: spec.number,
            salesOrderId: spec.salesOrder.id,
            bomRevisionId: spec.salesOrder.id === salesOrders[2].id ? null : bom.id,
            createdById: productionManager.id,
            status: spec.status,
            planApprovalStatus: "APPROVED",
            planApprovedAt: dateOffset(-4),
            planApprovedById: productionManager.id,
            plannedQuantity: spec.quantity,
            goodQuantity: spec.good,
            rejectedQuantity: spec.rejected,
            producedQuantity: spec.produced,
            plannedStart: dateOffset(spec.startOffset),
            plannedEnd: dateOffset(spec.endOffset),
            actualStart: spec.produced > 0 ? dateOffset(-2) : null,
            priority: spec.number === "DEMO-WO-001" ? "HIGH" : "MEDIUM",
            notes: "Sample production order generated by the demo seed.",
          },
        });
        workOrders.push(workOrder);
        const machine = machines[workOrders.length - 1];

        if (workOrder.bomRevisionId) {
          await tx.workOrderItem.upsert({
            where: { workOrderId_productId: { workOrderId: workOrder.id, productId: products[2].id } },
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
        }

        const existingOperation = await tx.operationLog.findFirst({
          where: { workOrderId: workOrder.id, sequence: 1 },
        });
        const operationData = {
          machineId: machine.id,
          operationName: "Injection Moulding",
          status: spec.produced > 0 ? "IN_PROGRESS" : "PENDING",
          goodQuantity: spec.good,
          rejectedQuantity: spec.rejected,
          startedAt: spec.produced > 0 ? dateOffset(-2) : null,
        };
        const operation = existingOperation
          ? await tx.operationLog.update({ where: { id: existingOperation.id }, data: operationData })
          : await tx.operationLog.create({
              data: {
                workOrderId: workOrder.id,
                sequence: 1,
                ...operationData,
              },
            });

        if (spec.inspection) {
          const inspection = await tx.qualityInspection.upsert({
            where: { inspectionNo: spec.inspection.number },
            update: {
              workOrderId: workOrder.id,
              status: spec.inspection.status,
              inspectedQuantity: spec.inspection.inspected,
              acceptedQuantity: spec.inspection.accepted,
              rejectedQuantity: spec.inspection.rejected,
              measurements: spec.inspection.status === "PENDING"
                ? { inspection: "Awaiting inspection", sampleSource: "Demo data" }
                : { visualCheck: spec.inspection.rejected === 0 ? "PASS" : "FAIL", sampleSource: "Demo data" },
              evidenceNotes: "Demo inspection record for the quality dashboard.",
              inspectedAt: spec.inspection.status === "PENDING" ? null : dateOffset(-1),
            },
            create: {
              inspectionNo: spec.inspection.number,
              workOrderId: workOrder.id,
              status: spec.inspection.status,
              inspectedQuantity: spec.inspection.inspected,
              acceptedQuantity: spec.inspection.accepted,
              rejectedQuantity: spec.inspection.rejected,
              measurements: spec.inspection.status === "PENDING"
                ? { inspection: "Awaiting inspection", sampleSource: "Demo data" }
                : { visualCheck: spec.inspection.rejected === 0 ? "PASS" : "FAIL", sampleSource: "Demo data" },
              evidenceNotes: "Demo inspection record for the quality dashboard.",
              inspectedAt: spec.inspection.status === "PENDING" ? null : dateOffset(-1),
            },
          });

          if (spec.inspection.rejected > 0) {
            const defect = await tx.qualityDefect.findFirst({
              where: { inspectionId: inspection.id, defectCode: "DEMO-SURFACE-FINISH" },
            });
            const defectData = {
              inspectionId: inspection.id,
              defectCode: "DEMO-SURFACE-FINISH",
              category: "Surface finish",
              description: "Minor surface blemish found during visual inspection.",
              severity: "MEDIUM",
              quantity: spec.inspection.rejected,
              status: "IN_REWORK",
              disposition: "Repair and reinspect",
            };
            const savedDefect = defect
              ? await tx.qualityDefect.update({ where: { id: defect.id }, data: defectData })
              : await tx.qualityDefect.create({ data: defectData });

            await tx.reworkOrder.upsert({
              where: { reworkNo: `DEMO-RW-${spec.number.slice(-3)}` },
              update: {
                workOrderId: workOrder.id,
                defectId: savedDefect.id,
                assignedToId: qualityInspector.id,
                quantity: spec.inspection.rejected,
                status: "IN_PROGRESS",
                reason: "Correct the surface finish and submit the parts for reinspection.",
              },
              create: {
                reworkNo: `DEMO-RW-${spec.number.slice(-3)}`,
                workOrderId: workOrder.id,
                defectId: savedDefect.id,
                assignedToId: qualityInspector.id,
                quantity: spec.inspection.rejected,
                status: "IN_PROGRESS",
                reason: "Correct the surface finish and submit the parts for reinspection.",
              },
            });
          }
        }

        const existingAssignment = await tx.machineAssignment.findFirst({
          where: { workOrderId: workOrder.id, machineId: machine.id },
        });
        const assignmentData = { startAt: dateOffset(spec.startOffset), endAt: dateOffset(spec.endOffset) };
        if (existingAssignment) {
          await tx.machineAssignment.update({ where: { id: existingAssignment.id }, data: assignmentData });
        } else {
          await tx.machineAssignment.create({
            data: {
              workOrderId: workOrder.id,
              machineId: machine.id,
              ...assignmentData,
            },
          });
        }

        if (spec.produced > 0) {
          const entry = await tx.productionEntry.findFirst({
            where: { workOrderId: workOrder.id, operationLogId: operation.id, notes: "Demo production entry." },
          });
          const entryData = {
            workOrderId: workOrder.id,
            operationLogId: operation.id,
            recordedById: productionManager.id,
            quantity: spec.produced,
            downtimeMinutes: 15,
            notes: "Demo production entry.",
            recordedAt: dateOffset(-1),
          };
          if (entry) {
            await tx.productionEntry.update({ where: { id: entry.id }, data: entryData });
          } else {
            await tx.productionEntry.create({ data: entryData });
          }
        }
      }

      await tx.productionAlert.upsert({
        where: { code: "DEMO-ALT-001" },
        update: {
          type: "QUALITY",
          severity: "MEDIUM",
          title: "Rework required for surface finish",
          message: "A demo inspection found parts requiring rework before release.",
          workOrderId: workOrders[0].id,
          machineId: machines[0].id,
          productId: products[0].id,
          status: "OPEN",
        },
        create: {
          code: "DEMO-ALT-001",
          type: "QUALITY",
          severity: "MEDIUM",
          title: "Rework required for surface finish",
          message: "A demo inspection found parts requiring rework before release.",
          workOrderId: workOrders[0].id,
          machineId: machines[0].id,
          productId: products[0].id,
          status: "OPEN",
        },
      });

    });
    console.log("Demo data seeded successfully.");
    console.log("Created or refreshed 2 customers, 3 products, 3 sales orders, 3 work orders, and related production and quality records.");
  } catch (error) {
    console.error("Demo data seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
