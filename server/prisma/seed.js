import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const now = new Date();
const daysAgo = (days) => new Date(now.getTime() - days * 86_400_000);

const users = [
  {
    name: "Priya Mehta",
    email: "priya.mehta@yashgroup.in",
    employeeCode: "YEC-S001",
    designation: "Sales Manager",
    role: "SALES_MANAGER",
  },
  {
    name: "Rahul Sharma",
    email: "rahul.sharma@yashgroup.in",
    employeeCode: "YEC-S002",
    designation: "Sales Consultant",
    role: "SALES_CONSULTANT",
  },
  {
    name: "Ananya Patel",
    email: "ananya.patel@yashgroup.in",
    employeeCode: "YEC-S003",
    designation: "Sales Consultant",
    role: "SALES_CONSULTANT",
  },
];

const catalogue = [
  [
    "COPPER_ROD",
    "Earthing electrodes",
    "YEC-CBR-17",
    "Copper bonded earth rod",
    "17.2 mm × 3000 mm",
    2380,
    18,
    true,
  ],
  [
    "COPPER_ROD",
    "Earthing electrodes",
    "YEC-CBR-14",
    "Copper bonded earth rod",
    "14.2 mm × 2400 mm",
    1760,
    18,
    true,
  ],
  [
    "GI_ROD",
    "Earthing electrodes",
    "YEC-GI-40",
    "GI earthing electrode",
    "40 mm × 3000 mm",
    1280,
    18,
    true,
  ],
  [
    "CHEM_ROD",
    "Earthing electrodes",
    "YEC-CE-50",
    "Chemical earthing electrode",
    "50 mm × 3000 mm",
    4250,
    18,
    true,
  ],
  [
    "EARTH_COMPOUND",
    "Earthing compounds",
    "YEC-EC-25",
    "Yash earthing compound",
    "25 kg bag",
    1580,
    18,
    true,
  ],
  [
    "EARTH_COMPOUND",
    "Earthing compounds",
    "YEC-EC-10",
    "Yash earthing compound",
    "10 kg bag",
    720,
    18,
    true,
  ],
  [
    "GI_STRIP",
    "Conductors & strips",
    "YEC-GIS-253",
    "GI earthing strip",
    "25 × 3 mm",
    365,
    18,
    false,
  ],
  [
    "COPPER_STRIP",
    "Conductors & strips",
    "YEC-CS-253",
    "Copper earthing strip",
    "25 × 3 mm",
    2140,
    18,
    false,
  ],
  [
    "LIGHTNING_KIT",
    "Lightning protection",
    "YEC-LPS-01",
    "Lightning protection kit",
    "Complete set",
    18500,
    18,
    true,
  ],
  [
    "TEST_LINK",
    "Accessories",
    "YEC-TL-01",
    "Test link and inspection chamber",
    "Heavy-duty set",
    890,
    18,
    false,
  ],
  [
    "BACKFILL",
    "Earthing compounds",
    "YEC-BF-01",
    "Conductive backfill compound",
    "50 kg bag",
    2640,
    18,
    false,
  ],
  [
    "SURGE_DEVICE",
    "Lightning protection",
    "YEC-SPD-40",
    "Surge protection device",
    "40 kA, Type 2",
    4350,
    18,
    false,
  ],
];

const prospects = [
  [
    "SuryaGrid Projects",
    "Amit Kulkarni",
    "amit@suryagrid.in",
    "+91 98220 44108",
    "Pune",
    "Maharashtra",
    "INDIAN_MART",
    "YEC-CBR-17",
    120,
    286000,
    "PO_RECEIVED",
    "HIGH",
    2,
  ],
  [
    "Apex Infra Systems",
    "Neha Shah",
    "neha@apexinfra.in",
    "+91 98250 21884",
    "Ahmedabad",
    "Gujarat",
    "WEBSITE",
    "YEC-EC-25",
    80,
    148000,
    "QUOTATION_SENT",
    "MEDIUM",
    2,
  ],
  [
    "Narmada Electricals",
    "Sanjay Patel",
    "sanjay@narmadaelectricals.in",
    "+91 98980 77032",
    "Vadodara",
    "Gujarat",
    "JUSTDIAL",
    "YEC-GIS-253",
    250,
    91250,
    "REQUIREMENT_CAPTURED",
    "HIGH",
    2,
  ],
  [
    "Meridian Power EPC",
    "Farhan Ali",
    "farhan@meridianpower.com",
    "+91 98191 60276",
    "Navi Mumbai",
    "Maharashtra",
    "EXPORT_INDIA",
    "YEC-CBR-14",
    60,
    105600,
    "CONTACTED",
    "MEDIUM",
    3,
  ],
  [
    "GreenSpark Energy",
    "Kavita Rao",
    "kavita@greenspark.co.in",
    "+91 98490 11234",
    "Hyderabad",
    "Telangana",
    "REFERRAL",
    "YEC-LPS-01",
    12,
    222000,
    "NEW",
    "LOW",
    1,
  ],
  [
    "BuildCore Engineering",
    "Rohit Deshmukh",
    "rohit@buildcore.in",
    "+91 97654 33821",
    "Nashik",
    "Maharashtra",
    "TRADE_INDIA",
    "YEC-CE-50",
    36,
    153000,
    "QUOTATION_DRAFT",
    "HIGH",
    3,
  ],
  [
    "Prism Renewables",
    "Isha Nair",
    "isha@prismrenewables.in",
    "+91 98470 14522",
    "Kochi",
    "Kerala",
    "GOOGLE_ADS",
    "YEC-CBR-17",
    48,
    114240,
    "QUALIFIED",
    "MEDIUM",
    2,
  ],
  [
    "Eastern Switchgear",
    "Debashish Sen",
    "debashish@easternswitchgear.in",
    "+91 98300 12783",
    "Kolkata",
    "West Bengal",
    "SULEKHA",
    "YEC-GI-40",
    100,
    128000,
    "NEGOTIATION",
    "HIGH",
    3,
  ],
  [
    "Vardhan Industrial",
    "Mehul Joshi",
    "mehul@vardhanindustrial.in",
    "+91 98790 44201",
    "Rajkot",
    "Gujarat",
    "META_ADS",
    "YEC-EC-10",
    140,
    100800,
    "CONTACTED",
    "MEDIUM",
    1,
  ],
  [
    "NorthStar EPC",
    "Pooja Arora",
    "pooja@northstarepc.in",
    "+91 98100 91827",
    "Gurugram",
    "Haryana",
    "INDIAN_MART",
    "YEC-CS-253",
    75,
    160500,
    "QUOTATION_SENT",
    "HIGH",
    2,
  ],
  [
    "Deccan Solar Works",
    "Vivek Reddy",
    "vivek@deccansolar.in",
    "+91 98480 26091",
    "Vijayawada",
    "Andhra Pradesh",
    "WEBSITE",
    "YEC-TL-01",
    90,
    80100,
    "REQUIREMENT_CAPTURED",
    "LOW",
    1,
  ],
  [
    "Pioneer Cement Ltd",
    "Anil Soni",
    "anil@pioneercement.in",
    "+91 94141 15007",
    "Jaipur",
    "Rajasthan",
    "EXCEL",
    "YEC-BF-01",
    64,
    168960,
    "PO_RECEIVED",
    "HIGH",
    3,
  ],
  [
    "BluePeak Data Centres",
    "Ritu Menon",
    "ritu@bluepeakdc.in",
    "+91 98451 02035",
    "Bengaluru",
    "Karnataka",
    "REFERRAL",
    "YEC-SPD-40",
    24,
    104400,
    "QUOTATION_DRAFT",
    "CRITICAL",
    2,
  ],
  [
    "Sahyadri Electricals",
    "Prakash Jadhav",
    "prakash@sahyadrielectricals.in",
    "+91 94220 34017",
    "Kolhapur",
    "Maharashtra",
    "JUSTDIAL",
    "YEC-GIS-253",
    320,
    116800,
    "CONTACTED",
    "MEDIUM",
    1,
  ],
  [
    "Orbit Infra Projects",
    "Sonal Gupta",
    "sonal@orbitinfra.in",
    "+91 98110 76322",
    "Noida",
    "Uttar Pradesh",
    "GOOGLE_ADS",
    "YEC-CE-50",
    18,
    76500,
    "NEW",
    "MEDIUM",
    3,
  ],
  [
    "Coastal Wind Energy",
    "Martin Dsouza",
    "martin@coastalwind.in",
    "+91 83224 45018",
    "Panaji",
    "Goa",
    "EXPORT_INDIA",
    "YEC-LPS-01",
    8,
    148000,
    "LOST",
    "LOW",
    2,
  ],
  [
    "Rudra Transformers",
    "Kiran Shah",
    "kiran@rudratransformers.in",
    "+91 26522 40977",
    "Vadodara",
    "Gujarat",
    "TRADE_INDIA",
    "YEC-CBR-17",
    40,
    95200,
    "QUOTATION_SENT",
    "MEDIUM",
    1,
  ],
  [
    "Kaveri Agri Power",
    "Chandru Rao",
    "chandru@kaveriagri.in",
    "+91 94480 62531",
    "Mysuru",
    "Karnataka",
    "WEBSITE",
    "YEC-EC-25",
    55,
    101750,
    "QUALIFIED",
    "LOW",
    3,
  ],
  [
    "Aster Hospitals",
    "Divya Krishnan",
    "divya@asterfacilities.in",
    "+91 48441 80103",
    "Kochi",
    "Kerala",
    "REFERRAL",
    "YEC-GI-40",
    32,
    40960,
    "NEGOTIATION",
    "HIGH",
    2,
  ],
  [
    "Horizon Rail Systems",
    "Arvind Bhat",
    "arvind@horizonrail.in",
    "+91 22288 41703",
    "Mumbai",
    "Maharashtra",
    "INDIAN_MART",
    "YEC-CBR-14",
    200,
    352000,
    "NEW",
    "HIGH",
    1,
  ],
  [
    "Sunfield Developers",
    "Maya Thomas",
    "maya@sunfielddev.in",
    "+91 80421 37250",
    "Bengaluru",
    "Karnataka",
    "MANUAL",
    "YEC-GIS-253",
    90,
    32850,
    "LOST",
    "LOW",
    3,
  ],
];

async function main() {
  const seedPassword = process.env.SEED_PASSWORD;
  if (!seedPassword || seedPassword.length < 12)
    throw new Error(
      "Set SEED_PASSWORD to a development-only password of at least 12 characters before seeding.",
    );
  const passwordHash = await bcrypt.hash(
    seedPassword,
    Number(process.env.BCRYPT_ROUNDS || 12),
  );
  const salesUsers = await Promise.all(
    users.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          employeeCode: user.employeeCode,
          designation: user.designation,
          role: user.role,
          isActive: true,
        },
        create: { ...user, passwordHash, department: "Sales" },
      }),
    ),
  );
  const manager = salesUsers[0];

  const categoryNames = [...new Set(catalogue.map((item) => item[1]))];
  const categories = Object.fromEntries(
    await Promise.all(
      categoryNames.map(async (name) => {
        const type =
          name === "Earthing compounds" ? "CONSUMABLE" : "FINISHED_GOOD";
        const category = await prisma.category.upsert({
          where: { name },
          update: { type },
          create: { name, type },
        });
        return [name, category.id];
      }),
    ),
  );

  const products = await Promise.all(
    catalogue.map(
      async ([
        sku,
        category,
        productSku,
        name,
        variant,
        price,
        gstPercent,
        isManufactured,
      ]) =>
        prisma.product.upsert({
          where: { sku: productSku },
          update: {
            name,
            variant,
            listPrice: price,
            gstPercent,
            isManufactured,
            isActive: true,
            categoryId: categories[category],
          },
          create: {
            sku: productSku,
            name,
            variant,
            listPrice: price,
            gstPercent,
            isManufactured,
            isActive: true,
            categoryId: categories[category],
            standardMake: "YASH",
            unitOfMeasure: "PCS",
            description: `${name} · ${variant}`,
          },
        }),
    ),
  );
  const productBySku = Object.fromEntries(
    products.map((product) => [product.sku, product]),
  );

  for (const [index, row] of prospects.entries()) {
    const [
      name,
      contactName,
      email,
      phone,
      city,
      state,
      source,
      sku,
      quantity,
      expectedValue,
      stage,
      priority,
      ownerIndex,
    ] = row;
    const code = `DEMO-LD-${String(index + 1).padStart(3, "0")}`;
    const product = productBySku[sku];
    const owner = salesUsers[ownerIndex - 1];
    if (!product) throw new Error(`Seed product ${sku} is missing for ${code}`);
    if (!owner)
      throw new Error(
        `Seed owner ${ownerIndex} is invalid for ${code}; expected 1-${salesUsers.length}`,
      );
    const customer = await prisma.customer.upsert({
      where: { code: `DEMO-C-${String(index + 1).padStart(3, "0")}` },
      update: { name, email, phone, city, state, isActive: true },
      create: {
        code: `DEMO-C-${String(index + 1).padStart(3, "0")}`,
        name,
        email,
        phone,
        city,
        state,
      },
    });
    const lead = await prisma.lead.upsert({
      where: { code },
      update: {
        source,
        customerName: name,
        contactName,
        email,
        phone,
        city,
        state,
        productName: product.name,
        productSku: sku,
        variant: product.variant,
        productId: product.id,
        quantity,
        expectedValue: new Prisma.Decimal(expectedValue),
        stage,
        priority,
        customerId: customer.id,
        assignedToId: owner.id,
        requirement: `Confirm ${product.name} (${product.variant}), order quantity ${quantity}, delivery to ${city}.`,
      },
      create: {
        code,
        source,
        customerName: name,
        contactName,
        email,
        phone,
        city,
        state,
        productName: product.name,
        productSku: sku,
        variant: product.variant,
        productId: product.id,
        quantity,
        expectedValue: new Prisma.Decimal(expectedValue),
        stage,
        priority,
        customerId: customer.id,
        assignedToId: owner.id,
        assignedById: manager.id,
        assignedByName: manager.name,
        contactType: "New Contact",
        requirement: `Confirm ${product.name} (${product.variant}), order quantity ${quantity}, delivery to ${city}.`,
      },
    });

    if (
      [
        "CONTACTED",
        "QUALIFIED",
        "REQUIREMENT_CAPTURED",
        "QUOTATION_DRAFT",
        "QUOTATION_SENT",
        "NEGOTIATION",
        "PO_RECEIVED",
        "CONVERTED",
      ].includes(stage)
    ) {
      const call = await prisma.callLog.findFirst({
        where: { leadId: lead.id },
      });
      if (!call)
        await prisma.callLog.create({
          data: {
            leadId: lead.id,
            callerId: owner.id,
            customerName: name,
            phone,
            outcome: "ANSWERED",
            durationSeconds: 245,
            discussionHighlights: `Spoke with ${contactName}. Confirmed ${quantity} units for ${city}; reviewed site and delivery requirement.`,
            nextFollowUpAt: ["CONTACTED", "NEGOTIATION"].includes(stage)
              ? new Date(now.getTime() + 2 * 86_400_000)
              : null,
            intent: "Positive",
            quoteRequested: [
              "QUOTATION_DRAFT",
              "QUOTATION_SENT",
              "NEGOTIATION",
              "PO_RECEIVED",
            ].includes(stage),
            loggedAt: daysAgo(Math.max(1, index % 9)),
          },
        });
    }

    if (
      [
        "QUOTATION_DRAFT",
        "QUOTATION_SENT",
        "NEGOTIATION",
        "PO_RECEIVED",
        "CONVERTED",
      ].includes(stage)
    ) {
      const quotationNo = `DEMO-QT-${String(index + 1).padStart(3, "0")}`;
      const subtotal = new Prisma.Decimal(expectedValue)
        .div(1.18)
        .toDecimalPlaces(2);
      const gstAmount = new Prisma.Decimal(expectedValue)
        .minus(subtotal)
        .toDecimalPlaces(2);
      const quoteStatus =
        stage === "QUOTATION_DRAFT"
          ? "DRAFT"
          : stage === "PO_RECEIVED" || stage === "CONVERTED"
            ? "CONVERTED"
            : "SENT_TO_CLIENT";
      const quotation = await prisma.quotation.upsert({
        where: { quotationNo },
        update: {
          leadId: lead.id,
          customerId: customer.id,
          salesRepresentativeId: owner.id,
          status: quoteStatus,
          subtotal,
          taxableAmount: subtotal,
          gstPercent: 18,
          gstAmount,
          taxAmount: gstAmount,
          total: expectedValue,
          validUntil: new Date(daysAgo(-15)),
          paymentTerms: "50% advance, balance before dispatch",
          deliveryTerms: "Delivery to customer site",
          sentAt:
            quoteStatus === "DRAFT" ? null : daysAgo(Math.max(1, index % 7)),
          emailSentAt:
            quoteStatus === "DRAFT" ? null : daysAgo(Math.max(1, index % 7)),
          emailRecipient: quoteStatus === "DRAFT" ? null : email,
        },
        create: {
          quotationNo,
          leadId: lead.id,
          customerId: customer.id,
          salesRepresentativeId: owner.id,
          status: quoteStatus,
          subtotal,
          taxableAmount: subtotal,
          gstPercent: 18,
          gstAmount,
          taxAmount: gstAmount,
          total: expectedValue,
          validUntil: new Date(daysAgo(-15)),
          validityDays: 15,
          callerName: contactName,
          preparedBy: owner.name,
          paymentTerms: "50% advance, balance before dispatch",
          deliveryTerms: "Delivery to customer site",
          sentAt:
            quoteStatus === "DRAFT" ? null : daysAgo(Math.max(1, index % 7)),
          emailSentAt:
            quoteStatus === "DRAFT" ? null : daysAgo(Math.max(1, index % 7)),
          emailRecipient: quoteStatus === "DRAFT" ? null : email,
          items: {
            create: [
              {
                productId: product.id,
                description: `${product.name} · ${product.variant}`,
                quantity,
                unitPrice: subtotal.div(quantity).toDecimalPlaces(2),
                taxPercent: 18,
                subtotal,
                lineTotal: new Prisma.Decimal(expectedValue),
              },
            ],
          },
        },
      });

      if (quoteStatus !== "DRAFT") {
        const communication = await prisma.communication.findFirst({
          where: { quotationId: quotation.id, channel: "EMAIL" },
        });
        if (!communication)
          await prisma.communication.create({
            data: {
              leadId: lead.id,
              quotationId: quotation.id,
              userId: owner.id,
              channel: "EMAIL",
              recipient: email,
              subject: `Yash Group quotation ${quotationNo}`,
              body: `Please find quotation ${quotationNo} for ${product.name}, ${quantity} units.`,
              status: "SENT",
              sentAt: quotation.sentAt || now,
            },
          });
      }

      if (stage === "PO_RECEIVED" || stage === "CONVERTED") {
        const customerPONumber = `DEMO-PO-${String(index + 1).padStart(3, "0")}`;
        const existingOrder = await prisma.salesOrder.findUnique({
          where: { quotationId: quotation.id },
        });
        if (!existingOrder) {
          const order = await prisma.salesOrder.create({
            data: {
              orderNumber: `DEMO-SO-${String(index + 1).padStart(3, "0")}`,
              quotationId: quotation.id,
              customerId: customer.id,
              createdById: owner.id,
              customerPONumber,
              productSummary: `${product.name} · ${product.variant}`,
              quantitySummary: String(quantity),
              deliveryLocation: `${city}, ${state}`,
              status: stage === "CONVERTED" ? "CONFIRMED" : "PENDING",
              orderDate: daysAgo(Math.max(1, index % 6)),
              confirmedAt: stage === "CONVERTED" ? daysAgo(1) : null,
              subtotal,
              gstAmount,
              grandTotal: expectedValue,
              notes:
                "Seeded demonstration order; verify customer PO before fulfilment.",
            },
          });
          await prisma.salesOrderItem.create({
            data: {
              salesOrderId: order.id,
              productId: product.id,
              productSkuSnapshot: product.sku,
              productNameSnapshot: product.name,
              quantity,
              unitPrice: subtotal.div(quantity).toDecimalPlaces(2),
              gstPercent: 18,
              baseAmount: subtotal,
              taxableAmount: subtotal,
              gstAmount,
              lineTotal: expectedValue,
            },
          });
        }
      }
    }
  }

  for (const [index, user] of salesUsers.entries()) {
    await prisma.salesTarget.upsert({
      where: {
        targetCode: `DEMO-TARGET-${String(index + 1).padStart(3, "0")}`,
      },
      update: {
        assignedById: manager.id,
        assignedToId: user.id,
        targetCalls: 25,
        targetValue: new Prisma.Decimal(500000),
        status: "Active",
      },
      create: {
        targetCode: `DEMO-TARGET-${String(index + 1).padStart(3, "0")}`,
        assignedById: manager.id,
        assignedToId: user.id,
        title: "Monthly qualified enquiry target",
        period: "MONTHLY",
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        targetCalls: 25,
        targetValue: new Prisma.Decimal(500000),
        completedCalls: 12,
        answeredCalls: 9,
        cutOffCalls: 2,
        notConnectedCalls: 1,
        status: "Active",
      },
    });
  }

  console.log(
    `Seeded ${salesUsers.length} sales users, ${products.length} products, ${prospects.length} demo leads and linked pipeline data.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
