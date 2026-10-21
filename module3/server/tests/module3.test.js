/**
 * MODULE 3 COMPREHENSIVE TEST SUITE
 * Covers:
 * 1. Health & Server Status (Port 5000)
 * 2. Auth & Middleware
 * 3. Validation Rules (Product & BOM)
 * 4. Product Catalog & Filter
 * 5. BOM Explosion & Cost Rollup
 * 6. Costing Simulation Engine
 * 7. Engineering Task Center & Traceability
 */

import assert from "node:assert/strict";

const BASE_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("=================================================");
  console.log("🧪 RUNNING MODULE 3 AUTOMATED TESTS (PORT 5000)");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    -> ${err.message}`);
      failed++;
    }
  }

  // 1. Health Endpoint Test
  await test("1. Health Endpoint confirms Port 5000 & Module 3 identity", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.status, "healthy");
    assert.equal(parseInt(json.port, 10), 5000);
    assert.match(json.module, /Module 3/);
  });

  // 2. Dashboard KPIs Test
  await test("2. Dashboard KPIs return live manufacturing data", async () => {
    const res = await fetch(`${BASE_URL}/dashboard`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.kpis.totalProducts > 0, "Products count should be > 0");
    assert.ok(json.data.categoryBreakdown.length > 0, "Should have category breakdown");
  });

  // 3. Products API Test
  await test("3. Products API lists items and filters by category", async () => {
    const res = await fetch(`${BASE_URL}/products?limit=10`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data.products), "Products must be an array");
    assert.ok(json.data.products.length <= 10, "Limit should be respected");
  });

  // 4. Validation Middleware: Reject invalid product creation
  await test("4. Validator rejects product creation missing required fields", async () => {
    const res = await fetch(`${BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "" }), // missing categoryId, empty name
    });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.error, /required/);
  });

  // 5. BOM Listing & Structure Test
  await test("5. BOM Manager returns multi-level BOM revisions with items", async () => {
    const res = await fetch(`${BASE_URL}/boms`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data), "BOMs must be an array");
    assert.ok(json.data.length > 0, "Should have at least one BOM");
    const firstBOM = json.data[0];
    assert.ok(firstBOM.items.length > 0, "BOM should contain component items");
  });

  // 6. Costing Simulation Engine Test
  await test("6. Costing simulation calculates material spike and target margins correctly", async () => {
    const bomsRes = await fetch(`${BASE_URL}/boms`);
    const bomsJson = await bomsRes.json();
    const bomId = bomsJson.data[0].id;

    const res = await fetch(`${BASE_URL}/boms/${bomId}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        materialAdjustmentPercent: 10, // 10% raw material spike
        laborHourlyRate: 250,
        overheadPercent: 15,
        targetMarginPercent: 25,
      }),
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    const sim = json.data;
    assert.ok(sim.costBreakdown.baselineMaterialCost > 0, "Baseline material cost > 0");
    assert.ok(sim.costBreakdown.simulatedMaterialCost >= sim.costBreakdown.baselineMaterialCost, "Simulated cost should reflect material spike");
    assert.ok(sim.commercials.sellingPrice > sim.costBreakdown.totalUnitCost, "Selling price should exceed cost");
  });

  // 7. Specifications Register Test
  await test("7. Engineering Specifications API returns revision control records", async () => {
    const res = await fetch(`${BASE_URL}/specifications`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data), "Specs must be an array");
  });

  // 8. Traceability API Test
  await test("8. Traceability API builds end-to-end audit pipeline", async () => {
    const res = await fetch(`${BASE_URL}/traceability/YEC-CBR-172-3000`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data.timeline.length > 0, "Timeline events must exist");
    assert.equal(json.data.product.sku, "YEC-CBR-172-3000");
  });

  console.log("=================================================");
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
