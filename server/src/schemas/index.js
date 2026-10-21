import { z } from "zod";

export const STAGES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "REQUIREMENT_CAPTURED",
  "QUOTATION_DRAFT",
  "QUOTATION_SENT",
  "NEGOTIATION",
  "PO_RECEIVED",
  "CONVERTED",
  "LOST",
];

export const SOURCES = [
  "INDIAN_MART",
  "EXPORT_INDIA",
  "JUSTDIAL",
  "TRADE_INDIA",
  "SULEKHA",
  "GOOGLE_ADS",
  "META_ADS",
  "WEBSITE",
  "EXCEL",
  "MANUAL",
  "REFERRAL",
  "OTHER",
];

export const pageSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const customerSchema = z.object({
  name: z.string().trim().min(2).max(160),
  legalName: z.string().max(160).optional().nullable(),
  email: z
    .string()
    .email()
    .max(254)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || null),
  phone: z.string().trim().min(7).max(30).optional().nullable(),
  gstin: z
    .string()
    .trim()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || null),
  city: z.string().max(80).optional().nullable(),
  state: z.string().max(80).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const enquirySchema = z.object({
  customerId: z.coerce.number().int().positive().optional().nullable(),
  customerName: z.string().trim().min(2).max(160),
  contactName: z.string().trim().max(120).optional().nullable(),
  email: z
    .string()
    .email()
    .max(254)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || null),
  phone: z.string().trim().min(7).max(30).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  state: z.string().max(80).optional().nullable(),
  source: z.enum(SOURCES).default("MANUAL"),
  productId: z.coerce.number().int().positive().optional().nullable(),
  productName: z.string().max(160).optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive().max(1000000),
      }),
    )
    .max(100)
    .optional(),
  quantity: z.coerce.number().positive().max(1000000).optional().nullable(),
  expectedValue: z.coerce
    .number()
    .nonnegative()
    .max(999999999999)
    .optional()
    .nullable(),
  requirement: z.string().max(4000).optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  nextFollowUpAt: z.coerce.date().optional().nullable(),
});

export const quoteSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  leadId: z.coerce.number().int().positive().optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  termsAndConditions: z.string().max(8000).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().positive(),
        unitPrice: z.coerce.number().nonnegative(),
        discountPercent: z.coerce.number().min(0).max(100).default(0),
        taxPercent: z.coerce.number().min(0).max(100).default(18),
        description: z.string().max(1000).optional().nullable(),
      }),
    )
    .min(1)
    .max(100),
});

export const userAccessibilitySchema = z.object({
  role: z.string().trim().min(2).max(50).optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});
