import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("==================================================================");
  console.log("YASH GROUP ERP - Module 3: Product & Engineering Seed Script");
  console.log("==================================================================");

  // 1. Ensure Engineering & Admin Users exist
  const engUser = await prisma.user.upsert({
    where: { email: "engineer@yashgroup.com" },
    update: {},
    create: {
      name: "Er. Rajesh Sharma",
      email: "engineer@yashgroup.com",
      passwordHash: "$2a$12$e6y517mHj8tW.4xVzH70k.c0zQ3eCqD.cT3fR2kH2kL.123456789",
      department: "Engineering",
      role: "ENGINEER",
      designation: "Chief Engineering Architect & R&D Lead",
      employeeCode: "EMP-ENG-001",
      phone: "+91 98200 12345",
      address: "Engineering Tech Center, Pune Plant",
      isActive: true,
    },
  });

  const prodMgr = await prisma.user.upsert({
    where: { email: "production@yashgroup.com" },
    update: {},
    create: {
      name: "Anil Kulkarni",
      email: "production@yashgroup.com",
      passwordHash: "$2a$12$e6y517mHj8tW.4xVzH70k.c0zQ3eCqD.cT3fR2kH2kL.123456789",
      department: "Production",
      role: "PRODUCTION_MANAGER",
      designation: "Plant Operations Manager",
      employeeCode: "EMP-PRD-002",
      phone: "+91 98200 54321",
      isActive: true,
    },
  });

  console.log("✔ Engineering & Plant Users verified");

  // 2. Categories
  const categoriesData = [
    { name: "Copper Bonded Earthing Rods", type: "FINISHED_GOOD", description: "High tensile steel core molecularly bonded with 99.9% pure electrolytic copper (254 microns minimum)" },
    { name: "Pure Copper Earthing Electrodes", type: "FINISHED_GOOD", description: "Heavy gauge electrolytic copper pipe with internal conductive cavity and crystalline mineral filling" },
    { name: "Galvanized Iron Earthing", type: "FINISHED_GOOD", description: "Hot dip galvanized iron rods, pipes and earthing strips for cost-effective industrial grounding" },
    { name: "Earth Pit Covers & Chambers", type: "FINISHED_GOOD", description: "Heavy duty polymer composite, cast iron, and concrete inspection chambers (10T - 40T load rating)" },
    { name: "Backfill & Earth Enhancement", type: "FINISHED_GOOD", description: "Moisture-retaining non-corrosive chemical backfill compounds conforming to IEC 62561-7" },
    { name: "ESE Lightning Arresters", type: "FINISHED_GOOD", description: "Early Streamer Emission active lightning terminals tested as per NFC 17-102 standards" },
    { name: "Lightning Strike Counters", type: "FINISHED_GOOD", description: "Digital and mechanical lightning discharge event registers with inductive pickup" },
    { name: "Earthing Clamps & Connectors", type: "FINISHED_GOOD", description: "Gunmetal, brass, and copper rod-to-tape, tape-to-tape, and U-bolt clamps and exothermic accessories" },
    { name: "Raw Materials - Metals & Chemicals", type: "RAW_MATERIAL", description: "Steel core bars, pure copper tubes, electrolytic copper cathodes, zinc ingots, and chemical compounds" },
    { name: "Bought Out Accessories", type: "BOUGHT_OUT", description: "Standard fasteners, hardware, PVC sleeves, brass couplings, and driving studs" },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { name: cat.name },
      update: { type: cat.type, description: cat.description },
      create: cat,
    });
    categoryMap[cat.name] = record.id;
  }
  console.log(`✔ ${Object.keys(categoryMap).length} Categories initialized`);

  // 3. Products List (50+ realistic products)
  const productsList = [
    // --- Finished Goods: Copper Bonded Rods ---
    {
      sku: "YEC-CBR-142-3000",
      name: "Copper Bonded Earth Rod 14.2mm x 3000mm (254 Microns)",
      categoryName: "Copper Bonded Earthing Rods",
      variant: "14.2mm x 3m",
      diameter: "14.2 mm",
      length: "3000 mm",
      modelName: "YEC-UL-142",
      hsnCode: "8538",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 1850.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-CBR-142-3000",
      drawingUrl: "https://yashgroup.com/drawings/DWG-CBR-142-3000-REV-B.pdf",
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60",
      description: "High tensile low-carbon steel core rod molecularly bonded with 99.9% electrolytic copper layer of 254 microns minimum thickness. Conforms to UL 467 and IS 3043.",
      minReorderLevel: 100,
    },
    {
      sku: "YEC-CBR-172-3000",
      name: "Copper Bonded Earth Rod 17.2mm x 3000mm (254 Microns)",
      categoryName: "Copper Bonded Earthing Rods",
      variant: "17.2mm x 3m",
      diameter: "17.2 mm",
      length: "3000 mm",
      modelName: "YEC-UL-172",
      hsnCode: "8538",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 2450.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-CBR-172-3000",
      drawingUrl: "https://yashgroup.com/drawings/DWG-CBR-172-3000-REV-C.pdf",
      imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=60",
      description: "Heavy duty copper bonded earth rod with roll-threaded ends for seamless coupling. Designed for substations, transmission towers, and industrial earthing.",
      minReorderLevel: 80,
    },
    {
      sku: "YEC-CBR-190-3000",
      name: "Copper Bonded Earth Rod 19.0mm x 3000mm (254 Microns)",
      categoryName: "Copper Bonded Earthing Rods",
      variant: "19.0mm x 3m",
      diameter: "19.0 mm",
      length: "3000 mm",
      modelName: "YEC-UL-190",
      hsnCode: "8538",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 3200.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-CBR-190-3000",
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=60",
      description: "Extra heavy duty 3/4 inch copper bonded electrode with high mechanical strength for deep earth driving through rocky strata.",
      minReorderLevel: 50,
    },
    {
      sku: "YEC-CBR-142-2000",
      name: "Copper Bonded Earth Rod 14.2mm x 2000mm (100 Microns)",
      categoryName: "Copper Bonded Earthing Rods",
      variant: "14.2mm x 2m Commercial",
      diameter: "14.2 mm",
      length: "2000 mm",
      modelName: "YEC-COM-142",
      hsnCode: "8538",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 1100.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-CBR-142-2000",
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60",
      description: "Commercial grade copper bonded grounding rod for telecom BTS shelters and commercial building earthing.",
      minReorderLevel: 150,
    },
    {
      sku: "YEC-CBR-172-2000",
      name: "Copper Bonded Earth Rod 17.2mm x 2000mm (254 Microns)",
      categoryName: "Copper Bonded Earthing Rods",
      variant: "17.2mm x 2m",
      diameter: "17.2 mm",
      length: "2000 mm",
      modelName: "YEC-UL-172-2M",
      hsnCode: "8538",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 1750.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-CBR-172-2000",
      minReorderLevel: 60,
    },

    // --- Pure Copper Earthing Electrodes ---
    {
      sku: "YEC-PCE-50-3000",
      name: "Pure Copper Chemical Earth Electrode 50mm x 3000mm",
      categoryName: "Pure Copper Earthing Electrodes",
      variant: "50mm Outer Dia x 3m",
      diameter: "50.0 mm",
      length: "3000 mm",
      modelName: "YEC-COPPERMAX-50",
      hsnCode: "8538",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 8900.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-PCE-5030-REV-A",
      imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=60",
      description: "100% Electrolytic high grade copper pipe with internal crystalline ionic mineral formulation for low soil resistivity and 30+ years lifespan.",
      minReorderLevel: 25,
    },
    {
      sku: "YEC-PCE-40-3000",
      name: "Pure Copper Chemical Earth Electrode 40mm x 3000mm",
      categoryName: "Pure Copper Earthing Electrodes",
      variant: "40mm Outer Dia x 3m",
      diameter: "40.0 mm",
      length: "3000 mm",
      modelName: "YEC-COPPERMAX-40",
      hsnCode: "8538",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 6800.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-PCE-4030-REV-A",
      minReorderLevel: 30,
    },
    {
      sku: "YEC-PCE-76-3000",
      name: "Heavy Duty Pure Copper Earth Pipe 76mm x 3000mm",
      categoryName: "Pure Copper Earthing Electrodes",
      variant: "76mm Outer Dia x 3m Heavy",
      diameter: "76.0 mm",
      length: "3000 mm",
      modelName: "YEC-COPPERMAX-76",
      hsnCode: "8538",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 15400.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-PCE-7630-REV-A",
      minReorderLevel: 15,
    },

    // --- Galvanized Iron Earthing ---
    {
      sku: "YEC-GIE-50-3000",
      name: "GI Chemical Pipe Electrode 50mm x 3000mm Class B",
      categoryName: "Galvanized Iron Earthing",
      variant: "50mm GI x 3m",
      diameter: "50.0 mm",
      length: "3000 mm",
      modelName: "YEC-GIMAX-50",
      hsnCode: "7308",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 2850.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-GIE-5030-REV-1",
      minReorderLevel: 100,
    },
    {
      sku: "YEC-GIE-80-3000",
      name: "GI Chemical Pipe Electrode 80mm x 3000mm Heavy Class C",
      categoryName: "Galvanized Iron Earthing",
      variant: "80mm GI x 3m",
      diameter: "80.0 mm",
      length: "3000 mm",
      modelName: "YEC-GIMAX-80",
      hsnCode: "7308",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 4200.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-GIE-8030-REV-1",
      minReorderLevel: 50,
    },
    {
      sku: "YEC-GIS-25-6-50M",
      name: "Hot Dip Galvanized Iron Earthing Strip 25mm x 6mm (50m Coil)",
      categoryName: "Galvanized Iron Earthing",
      variant: "25x6mm Strip",
      diameter: "6.0 mm",
      length: "50000 mm",
      modelName: "YEC-STRIP-256",
      hsnCode: "7308",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 6200.00,
      unitOfMeasure: "COIL",
      isManufactured: true,
      minReorderLevel: 40,
    },
    {
      sku: "YEC-GIS-50-6-50M",
      name: "Hot Dip Galvanized Iron Earthing Strip 50mm x 6mm (50m Coil)",
      categoryName: "Galvanized Iron Earthing",
      variant: "50x6mm Strip",
      diameter: "6.0 mm",
      length: "50000 mm",
      modelName: "YEC-STRIP-506",
      hsnCode: "7308",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 11800.00,
      unitOfMeasure: "COIL",
      isManufactured: true,
      minReorderLevel: 30,
    },

    // --- Earth Pit Covers & Inspection Chambers ---
    {
      sku: "YEC-EPC-POLY-10T",
      name: "Heavy Duty Poly-Plastic Earth Pit Cover 10 Ton Load Rating",
      categoryName: "Earth Pit Covers & Chambers",
      variant: "Polymer 10 Ton",
      diameter: "300 mm",
      length: "260 mm",
      modelName: "YEC-PIT-P10",
      hsnCode: "3925",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 950.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-EPC-POLY10-REV-C",
      imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=60",
      description: "UV-stabilized polypropylene inspection chamber with locked lid, designed for light vehicular traffic and industrial pavements.",
      minReorderLevel: 120,
    },
    {
      sku: "YEC-EPC-CI-25T",
      name: "Cast Iron Heavy Duty Earth Pit Inspection Chamber 25 Ton",
      categoryName: "Earth Pit Covers & Chambers",
      variant: "Cast Iron 25 Ton",
      diameter: "320 mm",
      length: "300 mm",
      modelName: "YEC-PIT-CI25",
      hsnCode: "7325",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 3450.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-EPC-CI25-REV-B",
      minReorderLevel: 40,
    },
    {
      sku: "YEC-EPC-CONC-40T",
      name: "Precast Reinforced Concrete Earth Pit Chamber 40 Ton Substation",
      categoryName: "Earth Pit Covers & Chambers",
      variant: "Precast Concrete 40 Ton",
      diameter: "450 mm",
      length: "450 mm",
      modelName: "YEC-PIT-CONC40",
      hsnCode: "6810",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 4800.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      minReorderLevel: 20,
    },

    // --- Backfill & Enhancement Compounds ---
    {
      sku: "YEC-BFC-25KG",
      name: "YASH RESISTO-PLUS Advanced Chemical Backfill Compound (25 Kg Bag)",
      categoryName: "Backfill & Earth Enhancement",
      variant: "25 Kg Laminated Bag",
      bagType: "HDPE Woven Laminated",
      bagSize: "25 KG",
      bagQuantity: 1,
      modelName: "RESISTO-PLUS-25",
      hsnCode: "3824",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 650.00,
      unitOfMeasure: "BAG",
      isManufactured: true,
      imageUrl: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=60",
      description: "Low-resistivity non-leaching earthing enhancement compound containing thermally stabilized graphite and moisture retaining minerals. Conforms to IEC 62561-7.",
      minReorderLevel: 300,
    },
    {
      sku: "YEC-BFC-COND-20KG",
      name: "YASH CONDUCT-MAX Ultra Conductive Carbon Compound (20 Kg Bag)",
      categoryName: "Backfill & Earth Enhancement",
      variant: "20 Kg Moisture Proof Bag",
      bagType: "Moisture Barrier Poly",
      bagSize: "20 KG",
      bagQuantity: 1,
      modelName: "CONDUCT-MAX-20",
      hsnCode: "3824",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 1250.00,
      unitOfMeasure: "BAG",
      isManufactured: true,
      description: "Super-conductive compound for rocky soils, dry sandy areas, and high-frequency lightning discharge grounds (resistivity < 0.05 ohm-m).",
      minReorderLevel: 150,
    },
    {
      sku: "YEC-BFC-BENT-25KG",
      name: "Standard Sodium Bentonite Earthing Powder (25 Kg Bag)",
      categoryName: "Backfill & Earth Enhancement",
      variant: "25 Kg Paper Bag",
      bagType: "Multiwall Kraft",
      bagSize: "25 KG",
      bagQuantity: 1,
      modelName: "BENTONITE-25",
      hsnCode: "2508",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 380.00,
      unitOfMeasure: "BAG",
      isManufactured: false,
      minReorderLevel: 200,
    },

    // --- ESE Lightning Arresters ---
    {
      sku: "YEC-ESE-STAR-60",
      name: "YASH ESE Lightning Arrester ΔT = 60 μs (Protection Radius up to 107m)",
      categoryName: "ESE Lightning Arresters",
      variant: "ESE 60 Microseconds",
      modelName: "YASH-STRIKE-60",
      hsnCode: "8535",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 38500.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-ESE-60M-REV-D",
      imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=60",
      description: "Active Early Streamer Emission terminal fabricated with marine grade SS 316L. Tested at high-voltage laboratory under NFC 17-102:2011 Annex C.",
      minReorderLevel: 15,
    },
    {
      sku: "YEC-ESE-STAR-45",
      name: "YASH ESE Lightning Arrester ΔT = 45 μs (Protection Radius up to 89m)",
      categoryName: "ESE Lightning Arresters",
      variant: "ESE 45 Microseconds",
      modelName: "YASH-STRIKE-45",
      hsnCode: "8535",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 29500.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-ESE-45M-REV-C",
      minReorderLevel: 15,
    },
    {
      sku: "YEC-ESE-STAR-30",
      name: "YASH ESE Lightning Arrester ΔT = 30 μs (Protection Radius up to 71m)",
      categoryName: "ESE Lightning Arresters",
      variant: "ESE 30 Microseconds",
      modelName: "YASH-STRIKE-30",
      hsnCode: "8535",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 22000.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-ESE-30M-REV-C",
      minReorderLevel: 10,
    },
    {
      sku: "YEC-LPA-FRANK-5P",
      name: "Conventional Pure Copper Franklin Multi-Prong Arrester with Base",
      categoryName: "ESE Lightning Arresters",
      variant: "5-Prong Copper",
      modelName: "YASH-FRANKLIN-5P",
      hsnCode: "8535",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 3200.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      minReorderLevel: 40,
    },

    // --- Lightning Strike Counters ---
    {
      sku: "YEC-LSC-DIGI-6D",
      name: "YASH Intelligent Digital Lightning Strike Counter (6-Digit IP67)",
      categoryName: "Lightning Strike Counters",
      variant: "Digital IP67",
      modelName: "YSC-DIGI-600",
      hsnCode: "9029",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 8500.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-LSC-DIGI-REV-A",
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
      description: "Non-resettable 6-digit electronic impulse counter triggered by inductive toroid sensor. Current sensitivity 1kA to 100kA (8/20 μs).",
      minReorderLevel: 20,
    },
    {
      sku: "YEC-LSC-MECH-6D",
      name: "Mechanical Lightning Event Counter (6-Digit No External Power)",
      categoryName: "Lightning Strike Counters",
      variant: "Mechanical Step",
      modelName: "YSC-MECH-600",
      hsnCode: "9029",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 4800.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      minReorderLevel: 30,
    },

    // --- Earthing Clamps & Connectors ---
    {
      sku: "YEC-CLP-ROD-TAPE-172",
      name: "Gunmetal Rod to Tape Clamp for 17.2mm Rod to 25x3/6mm Tape",
      categoryName: "Earthing Clamps & Connectors",
      variant: "17.2mm to 25mm Tape",
      modelName: "YEC-GMC-172",
      hsnCode: "8538",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 340.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      drawingId: "DWG-CLP-GMC-172",
      minReorderLevel: 300,
    },
    {
      sku: "YEC-CLP-ROD-CABLE-172",
      name: "Heavy Duty Brass Rod to Cable Clamp 17.2mm to 70-120 sq.mm",
      categoryName: "Earthing Clamps & Connectors",
      variant: "17.2mm to Cable",
      modelName: "YEC-BRC-172",
      hsnCode: "8538",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 310.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      minReorderLevel: 250,
    },
    {
      sku: "YEC-CLP-UBOLT-DOUBLE",
      name: "Naval Brass Double Plate U-Bolt Clamp for 50mm Pipe Grounding",
      categoryName: "Earthing Clamps & Connectors",
      variant: "50mm U-Bolt",
      modelName: "YEC-UB-50",
      hsnCode: "8538",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 580.00,
      unitOfMeasure: "PCS",
      isManufactured: true,
      minReorderLevel: 150,
    },
    {
      sku: "YEC-EXO-WELD-150G",
      name: "Exothermic Welding Powder 150g Cartridge with Igniter Metal Disk",
      categoryName: "Earthing Clamps & Connectors",
      variant: "150g Cartridge",
      modelName: "YASH-WELD-150",
      hsnCode: "8468",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 280.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 200,
    },
    {
      sku: "YEC-GRAPHITE-MOLD-T",
      name: "High Density Graphite Mold for Cable to Rod Tee Connection",
      categoryName: "Earthing Clamps & Connectors",
      variant: "Mold Tee CR-1",
      modelName: "YASH-MOLD-T",
      hsnCode: "6815",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 3500.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 25,
    },

    // --- Raw Materials (BOM Components) ---
    {
      sku: "RAW-MS-ROD-172",
      name: "High Tensile Carbon Steel Core Rod 16.8mm OD x 3000mm Annealed",
      categoryName: "Raw Materials - Metals & Chemicals",
      variant: "Grade SAE 1018 Steel",
      diameter: "16.8 mm",
      length: "3000 mm",
      hsnCode: "7214",
      standardMake: "TATA",
      gstPercent: 18,
      listPrice: 780.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 500,
    },
    {
      sku: "RAW-MS-ROD-142",
      name: "High Tensile Carbon Steel Core Rod 13.8mm OD x 3000mm",
      categoryName: "Raw Materials - Metals & Chemicals",
      variant: "Grade SAE 1018 Steel",
      diameter: "13.8 mm",
      length: "3000 mm",
      hsnCode: "7214",
      standardMake: "JINDAL",
      gstPercent: 18,
      listPrice: 580.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 600,
    },
    {
      sku: "RAW-CU-CATHODE-999",
      name: "Electrolytic Copper Cathode Plates 99.99% Grade A (Per Kg)",
      categoryName: "Raw Materials - Metals & Chemicals",
      variant: "Grade A Cathode",
      hsnCode: "7403",
      standardMake: "HINDALCO",
      gstPercent: 18,
      listPrice: 820.00,
      unitOfMeasure: "KG",
      isManufactured: false,
      minReorderLevel: 1000,
    },
    {
      sku: "RAW-CU-PIPE-50MM",
      name: "Electrolytic Half-Hard Copper Tube 50mm OD x 2mm Wall x 3m",
      categoryName: "Raw Materials - Metals & Chemicals",
      variant: "50mm OD x 2mm wall",
      diameter: "50.0 mm",
      length: "3000 mm",
      hsnCode: "7411",
      standardMake: "BIRLA",
      gstPercent: 18,
      listPrice: 4800.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 80,
    },
    {
      sku: "RAW-CU-PIPE-40MM",
      name: "Electrolytic Half-Hard Copper Tube 40mm OD x 1.8mm Wall x 3m",
      categoryName: "Raw Materials - Metals & Chemicals",
      variant: "40mm OD x 1.8mm wall",
      diameter: "40.0 mm",
      length: "3000 mm",
      hsnCode: "7411",
      standardMake: "BIRLA",
      gstPercent: 18,
      listPrice: 3800.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 100,
    },
    {
      sku: "RAW-GI-PIPE-50MM",
      name: "Heavy Gauge Mild Steel Pipe 50mm NB Hot Dipped Galvanized x 3m",
      categoryName: "Raw Materials - Metals & Chemicals",
      variant: "50mm NB Class B",
      diameter: "60.3 mm",
      length: "3000 mm",
      hsnCode: "7306",
      standardMake: "APL APOLLO",
      gstPercent: 18,
      listPrice: 1450.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 150,
    },
    {
      sku: "RAW-GRAPHITE-FLAKE",
      name: "High Purity Micro-Crystalline Natural Flake Graphite (Per Kg)",
      categoryName: "Raw Materials - Metals & Chemicals",
      variant: "95% Fixed Carbon",
      hsnCode: "2504",
      standardMake: "IMPORT",
      gstPercent: 18,
      listPrice: 140.00,
      unitOfMeasure: "KG",
      isManufactured: false,
      minReorderLevel: 2000,
    },
    {
      sku: "RAW-BENTONITE-SODIUM",
      name: "High Swelling Activated Sodium Bentonite Clay Bulk (Per Kg)",
      categoryName: "Raw Materials - Metals & Chemicals",
      variant: "300 Mesh Activated",
      hsnCode: "2508",
      standardMake: "KUTCH",
      gstPercent: 18,
      listPrice: 9.50,
      unitOfMeasure: "KG",
      isManufactured: false,
      minReorderLevel: 10000,
    },
    {
      sku: "RAW-SS316-ROD-25MM",
      name: "Marine Grade Stainless Steel 316L Solid Round Bar 25mm x 1m",
      categoryName: "Raw Materials - Metals & Chemicals",
      variant: "SS 316L Annealed",
      diameter: "25.0 mm",
      length: "1000 mm",
      hsnCode: "7222",
      standardMake: "VIRAJ",
      gstPercent: 18,
      listPrice: 1650.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 40,
    },
    {
      sku: "RAW-PLATING-CHEM",
      name: "Copper Sulfate & Fluoroborate Electroplating Chemical Salt Blend",
      categoryName: "Raw Materials - Metals & Chemicals",
      variant: "Plating Grade",
      hsnCode: "2833",
      standardMake: "ATOTECH",
      gstPercent: 18,
      listPrice: 320.00,
      unitOfMeasure: "KG",
      isManufactured: false,
      minReorderLevel: 500,
    },

    // --- Bought Out Accessories ---
    {
      sku: "BOU-BRASS-COUPLER-172",
      name: "High Strength Silicone Bronze Threaded Coupler 17.2mm",
      categoryName: "Bought Out Accessories",
      variant: "17.2mm Threaded",
      hsnCode: "7412",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 220.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 500,
    },
    {
      sku: "BOU-STEEL-DRIVE-STUD",
      name: "Case Hardened Alloy Steel Driving Stud 17.2mm for Rotary Hammer",
      categoryName: "Bought Out Accessories",
      variant: "17.2mm Drive Stud",
      hsnCode: "7318",
      standardMake: "YASH",
      gstPercent: 18,
      listPrice: 190.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 300,
    },
    {
      sku: "BOU-PVC-END-CAP-172",
      name: "High Impact Protective PVC Thread Shield Cap 17.2mm Yellow",
      categoryName: "Bought Out Accessories",
      variant: "17.2mm PVC Cap",
      hsnCode: "3923",
      standardMake: "GENERIC",
      gstPercent: 18,
      listPrice: 6.50,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 2000,
    },
    {
      sku: "BOU-HDPE-BAG-PRINT",
      name: "Heavy Duty 25Kg Printed Woven Sack with LDPE Inner Liner",
      categoryName: "Bought Out Accessories",
      variant: "25kg Laminated",
      hsnCode: "6305",
      standardMake: "POLYSACK",
      gstPercent: 18,
      listPrice: 28.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 3000,
    },
    {
      sku: "BOU-ESE-PCB-CIRCUIT",
      name: "Encapsulated High Voltage Ion Pulse Trigger Module for ESE 60",
      categoryName: "Bought Out Accessories",
      variant: "HV Ion Pulse Generator",
      hsnCode: "8538",
      standardMake: "TESLA-TECH",
      gstPercent: 18,
      listPrice: 7200.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 30,
    },
    {
      sku: "BOU-SENS-TOROID-100K",
      name: "Epoxy Cast Rogowski Inductive Pickup Toroid Current Sensor",
      categoryName: "Bought Out Accessories",
      variant: "Toroid 100kA",
      hsnCode: "8504",
      standardMake: "CURRENT-SENS",
      gstPercent: 18,
      listPrice: 1850.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 50,
    },
    {
      sku: "BOU-DISPL-LCD-6D",
      name: "Ultra-Low Power Reflective 6-Digit Counter LCD Module with Flash",
      categoryName: "Bought Out Accessories",
      variant: "6-Digit LCD",
      hsnCode: "8528",
      standardMake: "DISP-TECH",
      gstPercent: 18,
      listPrice: 1200.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 50,
    },
    {
      sku: "BOU-FASTENER-SS-M10",
      name: "SS 304 Hex Bolt M10 x 35mm with Spring & Flat Washers Kit",
      categoryName: "Bought Out Accessories",
      variant: "SS304 M10x35",
      hsnCode: "7318",
      standardMake: "UNBRAKO",
      gstPercent: 18,
      listPrice: 38.00,
      unitOfMeasure: "SET",
      isManufactured: false,
      minReorderLevel: 1000,
    },
    {
      sku: "BOU-COPPER-LUG-70",
      name: "Heavy Duty Electrolytic Tinned Copper Cable Terminal Lug 70 sq.mm",
      categoryName: "Bought Out Accessories",
      variant: "70 sq.mm M10",
      hsnCode: "8538",
      standardMake: "DOWELLS",
      gstPercent: 18,
      listPrice: 95.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 500,
    },
    {
      sku: "BOU-COPPER-LUG-120",
      name: "Heavy Duty Electrolytic Tinned Copper Cable Terminal Lug 120 sq.mm",
      categoryName: "Bought Out Accessories",
      variant: "120 sq.mm M12",
      hsnCode: "8538",
      standardMake: "DOWELLS",
      gstPercent: 18,
      listPrice: 165.00,
      unitOfMeasure: "PCS",
      isManufactured: false,
      minReorderLevel: 400,
    },
  ];

  const productMap = {};
  for (const item of productsList) {
    const categoryId = categoryMap[item.categoryName];
    const data = {
      sku: item.sku,
      name: item.name,
      variant: item.variant || null,
      diameter: item.diameter || null,
      length: item.length || null,
      modelName: item.modelName || null,
      bagType: item.bagType || null,
      bagSize: item.bagSize || null,
      bagQuantity: item.bagQuantity || 1,
      hsnCode: item.hsnCode || "8538",
      standardMake: item.standardMake || "YASH",
      gstPercent: item.gstPercent || 18,
      listPrice: item.listPrice || 0,
      unitOfMeasure: item.unitOfMeasure || "PCS",
      isManufactured: item.isManufactured ?? false,
      drawingId: item.drawingId || null,
      drawingUrl: item.drawingUrl || null,
      imageUrl: item.imageUrl || null,
      description: item.description || null,
      minReorderLevel: item.minReorderLevel || 10,
      isActive: true,
      categoryId,
    };

    const saved = await prisma.product.upsert({
      where: { sku: item.sku },
      update: data,
      create: data,
    });
    productMap[item.sku] = saved;
  }
  console.log(`✔ ${Object.keys(productMap).length} Products seeded & indexed`);

  // 4. Product Specifications (Formal technical standards and tolerances)
  const specRecords = [
    {
      productSku: "YEC-CBR-172-3000",
      revision: "REV-C",
      status: "RELEASED",
      drawingNumber: "DWG-CBR-172-3000",
      spec: {
        electricalStandard: "UL 467 / IS 3043 / IEEE 80",
        coreMaterial: "Cold Drawn Low Carbon Steel SAE 1018",
        tensileStrength: ">= 600 N/mm² (87,000 PSI)",
        copperPurity: "99.9% Electrolytic Grade IACS 100%",
        copperCoatingThickness: "254 Microns (10 Mils) minimum at all points",
        coatingAdhesionTest: "Passes 90-degree cold bend test with no peeling or flaking (UL 467 Section 9.2)",
        straightnessTolerance: "< 1.5mm per meter",
        diameterTolerance: "17.2mm ± 0.15mm",
        lengthTolerance: "3000mm ± 5.0mm",
        threadSpecification: "3/4-10 UNC Cold Rolled Thread on both ends",
        expectedServiceLife: "35+ Years in non-aggressive soil",
        applicableCertifications: ["UL Listed (File E354890)", "CE Marked", "CPRI Tested 40kA 1-sec fault"],
      },
    },
    {
      productSku: "YEC-CBR-142-3000",
      revision: "REV-B",
      status: "RELEASED",
      drawingNumber: "DWG-CBR-142-3000",
      spec: {
        electricalStandard: "UL 467 / IS 3043",
        coreMaterial: "Cold Drawn Low Carbon Steel",
        tensileStrength: ">= 580 N/mm²",
        copperPurity: "99.9% Electrolytic Copper",
        copperCoatingThickness: "254 Microns (10 Mils) uniform",
        coatingAdhesionTest: "No separation on sharp knife cutting",
        diameterTolerance: "14.2mm ± 0.12mm",
        lengthTolerance: "3000mm ± 5.0mm",
        threadSpecification: "5/8-11 UNC Rolled Thread",
        certifications: ["UL Listed", "ERDA Type Tested"],
      },
    },
    {
      productSku: "YEC-PCE-50-3000",
      revision: "REV-A",
      status: "RELEASED",
      drawingNumber: "DWG-PCE-5030-REV-A",
      spec: {
        electricalStandard: "IS 3043:2018 / IEC 62561-2",
        tubeMaterial: "100% Electrolytic Tough Pitch (ETP) Copper",
        copperPurity: ">= 99.95% Cu",
        outerDiameter: "50.0 mm ± 0.25mm",
        wallThickness: "2.5 mm ± 0.15mm",
        internalElectrolyte: "Hygroscopic ionic conductive crystalline salt mixture",
        currentCarryingCapacity: "50 kA for 1 second",
        terminalConnection: "Integrated 50x6mm Pure Copper terminal flat with 2 x 12mm holes",
        soilResistivityReduction: "Reduces local earth resistance by up to 60%",
      },
    },
    {
      productSku: "YEC-BFC-25KG",
      revision: "REV-A",
      status: "RELEASED",
      drawingNumber: "TDS-BFC-25KG",
      spec: {
        standardCompliance: "IEC 62561-7 (Lightning Protection - Earth Enhancing Compounds)",
        chemicalFormulation: "Thermally stabilized graphite, bentonite, and inorganic accelerator salts",
        leachingCharacteristics: "Non-leaching, non-polluting to groundwater (passes EPA Toxicity Characteristic Leaching TCLP)",
        electricalResistivity: "< 0.12 ohm-meter when cured with water",
        phValue: "7.2 - 8.5 (Neutral to slightly alkaline, protects copper and steel against corrosion)",
        density: "1.35 g/cm³ uncompacted",
        shelfLife: "Indefinite in unopened dry packaging",
      },
    },
    {
      productSku: "YEC-ESE-STAR-60",
      revision: "REV-D",
      status: "RELEASED",
      drawingNumber: "DWG-ESE-60M-REV-D",
      spec: {
        standardCompliance: "NFC 17-102:2011 / UNE 21186 / IEC 62305",
        emissionTimeGain: "ΔT = 60 μs (Lab verified at 100kV/μs steepness)",
        protectionRadiusLevel1: "79 meters at h = 5 meters",
        protectionRadiusLevel4: "107 meters at h = 5 meters",
        materialConstruction: "High-grade Marine Stainless Steel 316L body and central tip",
        impulseCurrentWithstand: "100 kA (10/350 μs waveform) as per IEC 62561-1",
        operatingConditions: "-40°C to +90°C, 100% humidity, resistant to acid rain and salt fog",
        weight: "4.85 Kg",
        terminalThread: "M20 internal thread for mast adaptation",
      },
    },
  ];

  for (const s of specRecords) {
    const prod = productMap[s.productSku];
    if (prod) {
      await prisma.productSpecification.upsert({
        where: {
          productId_revision: {
            productId: prod.id,
            revision: s.revision,
          },
        },
        update: {
          status: s.status,
          specification: s.spec,
          drawingNumber: s.drawingNumber,
          releasedAt: new Date(),
        },
        create: {
          productId: prod.id,
          revision: s.revision,
          status: s.status,
          specification: s.spec,
          drawingNumber: s.drawingNumber,
          releasedAt: new Date(),
        },
      });
    }
  }
  console.log(`✔ Product Specifications verified`);

  // 5. Multi-Level BOMs (BOMRevision, BOMItem, BOMOperation)
  // BOM 1: YEC-CBR-172-3000 (Copper Bonded Rod 17.2mm x 3m)
  const cbr172 = productMap["YEC-CBR-172-3000"];
  if (cbr172) {
    const bomRev = await prisma.bOMRevision.upsert({
      where: {
        productId_revision: {
          productId: cbr172.id,
          revision: "BOM-CBR-172-R3",
        },
      },
      update: {
        status: "RELEASED",
        materialCost: 1480.00,
        laborCost: 240.00,
        overheadCost: 180.00,
        notes: "Standard 254 micron electroplated copper bonded earth rod manufacturing BOM with rolling threads.",
        releasedAt: new Date(),
      },
      create: {
        productId: cbr172.id,
        revision: "BOM-CBR-172-R3",
        status: "RELEASED",
        materialCost: 1480.00,
        laborCost: 240.00,
        overheadCost: 180.00,
        notes: "Standard 254 micron electroplated copper bonded earth rod manufacturing BOM with rolling threads.",
        releasedAt: new Date(),
      },
    });

    // BOM Items
    const items = [
      { sku: "RAW-MS-ROD-172", qty: 1.0, scrap: 2.0 },
      { sku: "RAW-CU-CATHODE-999", qty: 0.68, scrap: 4.5 },
      { sku: "RAW-PLATING-CHEM", qty: 0.15, scrap: 1.0 },
      { sku: "BOU-PVC-END-CAP-172", qty: 2.0, scrap: 0.0 },
    ];

    for (const it of items) {
      const comp = productMap[it.sku];
      if (comp) {
        await prisma.bOMItem.upsert({
          where: {
            bomRevisionId_componentProductId: {
              bomRevisionId: bomRev.id,
              componentProductId: comp.id,
            },
          },
          update: { quantity: it.qty, scrapPercent: it.scrap },
          create: {
            bomRevisionId: bomRev.id,
            componentProductId: comp.id,
            quantity: it.qty,
            scrapPercent: it.scrap,
          },
        });
      }
    }

    // Routing Operations
    const ops = [
      { seq: 10, name: "Bar Straightening & De-scaling", center: "Prep Shop 1", mins: 3.5, instructions: "Check straightness < 1.0mm/m. Acid dip and wash." },
      { seq: 20, name: "Continuous Electroplating Bath", center: "Plating Line A", mins: 14.0, instructions: "Maintain cathode current density for 254 micron uniform layer." },
      { seq: 30, name: "End Pointing & Thread Rolling", center: "Machine Center 2", mins: 4.5, instructions: "Cold roll 3/4-10 UNC thread. Verify with Go/No-Go ring gauge." },
      { seq: 40, name: "Eddy-Current Coating QA & Testing", center: "QC Lab 1", mins: 3.0, instructions: "Perform 12-point thickness measurement and 90-degree adhesion test." },
      { seq: 50, name: "Cap Fitting & Bundle Packaging", center: "Packing Station", mins: 2.5, instructions: "Attach yellow PVC cap, apply anti-tarnish coat, bundle in 5s." },
    ];

    for (const op of ops) {
      await prisma.bOMOperation.upsert({
        where: {
          bomRevisionId_sequence: {
            bomRevisionId: bomRev.id,
            sequence: op.seq,
          },
        },
        update: { name: op.name, workCenter: op.center, standardMinutes: op.mins, instructions: op.instructions },
        create: {
          bomRevisionId: bomRev.id,
          sequence: op.seq,
          name: op.name,
          workCenter: op.center,
          standardMinutes: op.mins,
          instructions: op.instructions,
        },
      });
    }
  }

  // BOM 2: YEC-ESE-STAR-60 (Lightning Arrester)
  const ese60 = productMap["YEC-ESE-STAR-60"];
  if (ese60) {
    const bomRev = await prisma.bOMRevision.upsert({
      where: {
        productId_revision: {
          productId: ese60.id,
          revision: "BOM-ESE-60-R2",
        },
      },
      update: {
        status: "RELEASED",
        materialCost: 18400.00,
        laborCost: 3200.00,
        overheadCost: 2600.00,
        notes: "High precision CNC machined SS316 ESE lightning arrester with encapsulated ion generator.",
        releasedAt: new Date(),
      },
      create: {
        productId: ese60.id,
        revision: "BOM-ESE-60-R2",
        status: "RELEASED",
        materialCost: 18400.00,
        laborCost: 3200.00,
        overheadCost: 2600.00,
        notes: "High precision CNC machined SS316 ESE lightning arrester with encapsulated ion generator.",
        releasedAt: new Date(),
      },
    });

    const items = [
      { sku: "RAW-SS316-ROD-25MM", qty: 2.4, scrap: 3.0 },
      { sku: "BOU-ESE-PCB-CIRCUIT", qty: 1.0, scrap: 0.0 },
      { sku: "BOU-FASTENER-SS-M10", qty: 4.0, scrap: 0.0 },
    ];

    for (const it of items) {
      const comp = productMap[it.sku];
      if (comp) {
        await prisma.bOMItem.upsert({
          where: {
            bomRevisionId_componentProductId: {
              bomRevisionId: bomRev.id,
              componentProductId: comp.id,
            },
          },
          update: { quantity: it.qty, scrapPercent: it.scrap },
          create: {
            bomRevisionId: bomRev.id,
            componentProductId: comp.id,
            quantity: it.qty,
            scrapPercent: it.scrap,
          },
        });
      }
    }
  }

  // BOM 3: YEC-BFC-25KG (Backfill Compound)
  const bfc25 = productMap["YEC-BFC-25KG"];
  if (bfc25) {
    const bomRev = await prisma.bOMRevision.upsert({
      where: {
        productId_revision: {
          productId: bfc25.id,
          revision: "BOM-BFC-25-R1",
        },
      },
      update: {
        status: "RELEASED",
        materialCost: 380.00,
        laborCost: 65.00,
        overheadCost: 45.00,
        notes: "Dry blender batch formula for Resisto-Plus 25Kg packaged compound.",
        releasedAt: new Date(),
      },
      create: {
        productId: bfc25.id,
        revision: "BOM-BFC-25-R1",
        status: "RELEASED",
        materialCost: 380.00,
        laborCost: 65.00,
        overheadCost: 45.00,
        notes: "Dry blender batch formula for Resisto-Plus 25Kg packaged compound.",
        releasedAt: new Date(),
      },
    });

    const items = [
      { sku: "RAW-BENTONITE-SODIUM", qty: 18.5, scrap: 1.0 },
      { sku: "RAW-GRAPHITE-FLAKE", qty: 5.5, scrap: 1.5 },
      { sku: "BOU-HDPE-BAG-PRINT", qty: 1.0, scrap: 0.5 },
    ];

    for (const it of items) {
      const comp = productMap[it.sku];
      if (comp) {
        await prisma.bOMItem.upsert({
          where: {
            bomRevisionId_componentProductId: {
              bomRevisionId: bomRev.id,
              componentProductId: comp.id,
            },
          },
          update: { quantity: it.qty, scrapPercent: it.scrap },
          create: {
            bomRevisionId: bomRev.id,
            componentProductId: comp.id,
            quantity: it.qty,
            scrapPercent: it.scrap,
          },
        });
      }
    }
  }
  console.log(`✔ Multi-Level Manufacturing BOMs & Operations initialized`);

  // 6. MediaAssets (Engineering Technical Drawings, Datasheets, Training Videos)
  const mediaList = [
    {
      title: "DWG-CBR-172-3000: Copper Bonded Rod Assembly Drawing",
      type: "DRAWING",
      storageKey: "drawings/DWG-CBR-172-3000-REV-C.pdf",
      mimeType: "application/pdf",
      fileSize: 2450000n,
      revision: "REV-C",
      description: "CAD fabrication drawing showing 3/4-inch rolled thread details, chamfered driving tip, and 254-micron copper cladding thickness specifications.",
      isApproved: true,
      productSku: "YEC-CBR-172-3000",
    },
    {
      title: "DWG-ESE-60M: ESE 60 Arrester Internal Assembly & Mast Adaptor",
      type: "DRAWING",
      storageKey: "drawings/DWG-ESE-60M-REV-D.pdf",
      mimeType: "application/pdf",
      fileSize: 4120000n,
      revision: "REV-D",
      description: "Sectional assembly drawing with exploded view of SS316 upper finial, internal spark accelerator, and M20 mast coupling.",
      isApproved: true,
      productSku: "YEC-ESE-STAR-60",
    },
    {
      title: "TDS-BFC-25KG: Resisto-Plus Chemical Backfill Technical Datasheet",
      type: "DOCUMENT",
      storageKey: "datasheets/TDS-RESISTO-PLUS-25.pdf",
      mimeType: "application/pdf",
      fileSize: 1180000n,
      revision: "R1",
      description: "Engineering material safety data sheet (MSDS) and IEC 62561-7 environmental compliance report.",
      isApproved: true,
      productSku: "YEC-BFC-25KG",
    },
    {
      title: "VIDEO: Deep Earth Rod Driving with Pneumatic Hammer & Couplers",
      type: "TRAINING",
      storageKey: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      mimeType: "video/mp4",
      fileSize: 45000000n,
      revision: "2026-V1",
      description: "Site training procedure: driving 3 x 3m copper bonded rods to 9-meter depth using hydraulic driver and bronze threaded couplers.",
      isApproved: true,
      productSku: "YEC-CBR-172-3000",
    },
    {
      title: "VIDEO: Chemical Earth Pit Excavation & Slurry Preparation Protocol",
      type: "TRAINING",
      storageKey: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      mimeType: "video/mp4",
      fileSize: 68000000n,
      revision: "2026-V1",
      description: "Step-by-step mixing ratio of Resisto-Plus compound with water and backfilling around 50mm copper pipe electrode.",
      isApproved: true,
      productSku: "YEC-BFC-25KG",
    },
    {
      title: "VIDEO: ESE Arrester Roof Mast Installation & Down-conductor Route",
      type: "TRAINING",
      storageKey: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      mimeType: "video/mp4",
      fileSize: 85000000n,
      revision: "2026-V1",
      description: "Certified lightning protection installation guidelines conforming to NFC 17-102 and IEC 62305.",
      isApproved: true,
      productSku: "YEC-ESE-STAR-60",
    },
  ];

  for (const m of mediaList) {
    const prod = productMap[m.productSku];
    await prisma.mediaAsset.create({
      data: {
        title: m.title,
        type: m.type,
        storageKey: m.storageKey,
        mimeType: m.mimeType,
        fileSize: m.fileSize,
        revision: m.revision,
        description: m.description,
        isApproved: m.isApproved,
        uploadedById: engUser.id,
        productId: prod ? prod.id : null,
      },
    });
  }
  console.log(`✔ Engineering Media Assets & Training Videos registered`);

  // 7. Engineering Tasks
  const tasksData = [
    {
      taskNo: "ENG-TSK-101",
      title: "UL 467 Re-certification Audit: Copper Bonded Rod Cladding Tests",
      department: "Engineering",
      stakeholderName: "UL Inspection Bureau",
      roleTitle: "Lead Standards Engineer",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      description: "Prepare 15 sample specimens of 17.2mm x 3m rod from Batch 2026-A for third-party micro-section plating thickness verification.",
      dueAt: new Date(Date.now() + 86400000 * 5),
    },
    {
      taskNo: "ENG-TSK-102",
      title: "Approve BOM-ESE-60-R2 Alternate Material for SS316 Finial Tip",
      department: "Engineering",
      stakeholderName: "R&D Metallurgy Lab",
      roleTitle: "Senior Design Engineer",
      status: "OPEN",
      priority: "HIGH",
      description: "Evaluate cold-worked vs hot-rolled SS316L round bar corrosion resistance in marine atmospheric conditions.",
      dueAt: new Date(Date.now() + 86400000 * 2),
    },
    {
      taskNo: "ENG-TSK-103",
      title: "Update CAD Technical Datasheet for 10 Ton Poly-Plastic Pit Cover",
      department: "Engineering",
      stakeholderName: "Product Management",
      roleTitle: "CAD Engineer",
      status: "COMPLETED",
      priority: "MEDIUM",
      description: "Revise drawing DWG-EPC-POLY10 with internal rib reinforcement details to sustain wheel-load testing.",
      completedAt: new Date(),
    },
    {
      taskNo: "ENG-TSK-104",
      title: "Design Site Earthing Layout for 50MW Solar Power Plant (EPC Grid)",
      department: "Engineering",
      stakeholderName: "Renewable EPC Division",
      roleTitle: "Project Systems Engineer",
      status: "IN_PROGRESS",
      priority: "HIGH",
      description: "Calculate IEEE 80 touch and step potentials with 40 ohm-m soil profile. Specify 450 earth pits with Resisto-Plus.",
      dueAt: new Date(Date.now() + 86400000 * 12),
    },
  ];

  for (const t of tasksData) {
    await prisma.task.upsert({
      where: { taskNo: t.taskNo },
      update: t,
      create: {
        ...t,
        createdById: engUser.id,
        assignedToId: engUser.id,
      },
    });
  }
  console.log(`✔ Engineering Tasks created`);

  // 8. Inventory stock levels for accurate component shortage calculations
  const inventorySetup = [
    { sku: "RAW-MS-ROD-172", onHand: 1250, reserved: 300, reorder: 500, cost: 780.00 },
    { sku: "RAW-CU-CATHODE-999", onHand: 2400, reserved: 850, reorder: 1000, cost: 820.00 },
    { sku: "RAW-PLATING-CHEM", onHand: 850, reserved: 200, reorder: 300, cost: 320.00 },
    { sku: "BOU-PVC-END-CAP-172", onHand: 6200, reserved: 1500, reorder: 2000, cost: 6.50 },
    { sku: "RAW-SS316-ROD-25MM", onHand: 8, reserved: 15, reorder: 20, cost: 1650.00 }, // Intended shortage!
    { sku: "BOU-ESE-PCB-CIRCUIT", onHand: 12, reserved: 10, reorder: 15, cost: 7200.00 },
    { sku: "YEC-CBR-172-3000", onHand: 450, reserved: 120, reorder: 80, cost: 1900.00 },
  ];

  for (const inv of inventorySetup) {
    const prod = productMap[inv.sku];
    if (prod) {
      await prisma.inventory.upsert({
        where: { productId: prod.id },
        update: {
          physicalQuantity: inv.onHand,
          reservedQuantity: inv.reserved,
          reorderLevel: inv.reorder,
          unitCost: inv.cost,
        },
        create: {
          productId: prod.id,
          physicalQuantity: inv.onHand,
          reservedQuantity: inv.reserved,
          reorderLevel: inv.reorder,
          unitCost: inv.cost,
          warehouseLocation: "Central Finished & Raw Stores",
        },
      });

      await prisma.inventoryItem.upsert({
        where: { itemCode: inv.sku },
        update: {
          onHandStock: inv.onHand,
          reservedStock: inv.reserved,
          reorderLevel: inv.reorder,
          unitCost: inv.cost,
        },
        create: {
          itemCode: inv.sku,
          itemName: prod.name,
          category: "Engineering Stock",
          onHandStock: inv.onHand,
          reservedStock: inv.reserved,
          reorderLevel: inv.reorder,
          unitCost: inv.cost,
        },
      });
    }
  }
  console.log(`✔ Physical & ERP Inventory stocks established with real shortages`);

  // 9. Traceability Simulation: Customer -> Lead -> SalesOrder -> WorkOrder -> Project
  const testCustomer = await prisma.customer.upsert({
    where: { code: "CUST-LNT-001" },
    update: {},
    create: {
      code: "CUST-LNT-001",
      name: "Larsen & Toubro Heavy Infrastructure Ltd.",
      legalName: "Larsen & Toubro Ltd.",
      email: "procurement.infra@lntecc.com",
      phone: "+91 22 6752 5656",
      gstin: "27AAACL0140P1ZY",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      isActive: true,
    },
  });

  const soOrder = await prisma.salesOrder.upsert({
    where: { orderNumber: "SO-ENG-2026-089" },
    update: {},
    create: {
      orderNumber: "SO-ENG-2026-089",
      customerId: testCustomer.id,
      createdById: engUser.id,
      customerPONumber: "LNT/METRO-PH3/GROUNDING/PO-4412",
      productSummary: "Copper Bonded Earth Rods 17.2mm x 3m (254 Micron) & ESE-60 Lightning Arresters",
      status: "CONFIRMED",
      orderDate: new Date(),
      subtotal: 580000.00,
      gstAmount: 104400.00,
      grandTotal: 684400.00,
    },
  });

  const cbr172Prod = productMap["YEC-CBR-172-3000"];
  if (cbr172Prod) {
    await prisma.salesOrderItem.upsert({
      where: {
        salesOrderId_productId: {
          salesOrderId: soOrder.id,
          productId: cbr172Prod.id,
        },
      },
      update: {},
      create: {
        salesOrderId: soOrder.id,
        productId: cbr172Prod.id,
        productSkuSnapshot: cbr172Prod.sku,
        productNameSnapshot: cbr172Prod.name,
        quantity: 200,
        unitPrice: 2450.00,
        baseAmount: 490000.00,
        taxableAmount: 490000.00,
        gstPercent: 18,
        gstAmount: 88200.00,
        lineTotal: 578200.00,
      },
    });

    const cbrBOM = await prisma.bOMRevision.findFirst({
      where: { productId: cbr172Prod.id, revision: "BOM-CBR-172-R3" },
    });

    await prisma.workOrder.upsert({
      where: { workOrderNo: "WO-2026-0044" },
      update: {},
      create: {
        workOrderNo: "WO-2026-0044",
        salesOrderId: soOrder.id,
        bomRevisionId: cbrBOM ? cbrBOM.id : null,
        createdById: prodMgr.id,
        status: "IN_PROGRESS",
        plannedQuantity: 200,
        goodQuantity: 185,
        rejectedQuantity: 3,
        plannedStart: new Date(),
        plannedEnd: new Date(Date.now() + 86400000 * 7),
        priority: "HIGH",
        notes: "Metro Rail Line 3 Substation earthing batch. Mandatory 100% micro-test.",
      },
    });
  }

  await prisma.project.upsert({
    where: { projectCode: "PRJ-MUM-METRO-03" },
    update: {},
    create: {
      projectCode: "PRJ-MUM-METRO-03",
      salesOrderId: soOrder.id,
      customerId: testCustomer.id,
      ownerId: engUser.id,
      name: "Mumbai Metro Line 3 Traction Substation Earthing & Lightning Protection",
      siteName: "Aarey Depot & BKC Underground Substation",
      status: "IN_PROGRESS",
      plannedStart: new Date(),
      plannedEnd: new Date(Date.now() + 86400000 * 60),
      notes: "EPC contract for complete grounding grid and rooftop ESE active lightning protection.",
    },
  });

  console.log(`✔ End-to-End Traceability records (Customer -> SalesOrder -> WorkOrder -> Project) established`);
  console.log("==================================================================");
  console.log("🎉 MODULE 3 SEEDING COMPLETED SUCCESSFULLY!");
  console.log("==================================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
