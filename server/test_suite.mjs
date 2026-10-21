import http from "node:http";
import app from "./index.js";
import prisma from "./src/shared/database/prisma.js";

async function runTestSuite() {
  console.log("==================================================");
  console.log("       ERP PRODUCTION & QUALITY MODULE TEST       ");
  console.log("==================================================");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Test server running on ${baseUrl}\n`);

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  async function testEndpoint(name, path, options = {}, expectedStatus = [200]) {
    totalTests++;
    const t0 = Date.now();
    try {
      const res = await fetch(`${baseUrl}${path}`, options);
      const elapsed = Date.now() - t0;
      const json = await res.json().catch(() => null);

      if (expectedStatus.includes(res.status)) {
        passedTests++;
        console.log(`[PASS] (${elapsed}ms) [${res.status}] ${name} -> ${path}`);
        return { ok: true, status: res.status, data: json };
      } else {
        failedTests++;
        console.error(`[FAIL] (${elapsed}ms) [${res.status}] ${name} -> ${path}`);
        console.error("       Response:", json);
        return { ok: false, status: res.status, data: json };
      }
    } catch (err) {
      failedTests++;
      console.error(`[ERROR] ${name} -> ${path}:`, err.message);
      return { ok: false, error: err };
    }
  }

  try {
    console.log("--- 1. SYSTEM & HEALTH ENDPOINTS ---");
    await testEndpoint("System Health", "/api/health");
    await testEndpoint("Database Readiness", "/api/ready", {}, [200, 503]);

    console.log("\n--- 2. PRODUCTION DASHBOARD & PLANNING ---");
    await testEndpoint("Production Dashboard", "/api/production/dashboard");
    await testEndpoint("Production Timeline", "/api/production/timeline");
    await testEndpoint("Planning Dashboard", "/api/production/planning/dashboard");
    await testEndpoint("Production Calendar", "/api/production/planning/calendar");
    await testEndpoint("Demand Forecast", "/api/production/planning/forecast");
    await testEndpoint("Capacity Plan", "/api/production/planning/capacity");

    console.log("\n--- 3. WORK ORDERS & BOM ---");
    await testEndpoint("Order Stats", "/api/production/orders/stats");
    await testEndpoint("List Orders (limit 100)", "/api/production/orders?limit=100");
    await testEndpoint("BOM Stats", "/api/production/bom/stats");
    await testEndpoint("List BOMs", "/api/production/bom");

    console.log("\n--- 4. WORKFORCE & SHOPFLOOR OPERATIONS ---");
    await testEndpoint("Workforce List", "/api/production/workforce");
    await testEndpoint("Sales Orders List", "/api/production/sales-orders");
    await testEndpoint("Products List", "/api/production/products");
    await testEndpoint("Allocations List", "/api/production/allocations");
    await testEndpoint("Machines List", "/api/production/machines");

    console.log("\n--- 5. PRODUCTION SUPPORT & ADVANCED MODULES ---");
    await testEndpoint("Alerts", "/api/production/alerts");
    await testEndpoint("Equipment Maintenance", "/api/production/machines/maintenance");
    await testEndpoint("Production Costs", "/api/production/costs");
    await testEndpoint("Costs Summary", "/api/production/costs/summary");
    await testEndpoint("Traceability", "/api/production/traceability");
    await testEndpoint("Analytics", "/api/production/analytics");
    await testEndpoint("Audit Log", "/api/production/audit");

    console.log("\n--- 6. QUALITY MANAGEMENT MODULE ---");
    await testEndpoint("Quality Stats", "/api/quality/stats");
    await testEndpoint("Quality Inspections", "/api/quality/inspections");
    await testEndpoint("Quality Defects", "/api/quality/defects");
    await testEndpoint("Rework Orders", "/api/quality/rework");
    await testEndpoint("Quality Reports", "/api/quality/reports");

    console.log("\n--- 7. VALIDATION & ERROR HANDLING ---");
    await testEndpoint(
      "Non-existent order 404/400 check",
      "/api/production/orders/999999",
      {},
      [400, 404]
    );
    await testEndpoint(
      "Invalid order ID format validation",
      "/api/production/orders/invalid-id",
      {},
      [400]
    );
    await testEndpoint(
      "Invalid BOM creation (missing fields)",
      "/api/production/bom",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
      [400]
    );

    console.log("\n==================================================");
    console.log(`TOTAL: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
    console.log("==================================================");

    if (failedTests > 0) {
      process.exitCode = 1;
    }
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTestSuite();
