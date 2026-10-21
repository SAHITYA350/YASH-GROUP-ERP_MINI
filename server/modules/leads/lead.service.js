// Leads module - CRM lead list, detail and follow-ups.
import prisma from "../../utils/prisma.js";
import httpError from "../../utils/httpError.js";

const LEAD_SELECT = {
  id: true,
  code: true,
  customerName: true,
  contactName: true,
  email: true,
  phone: true,
  city: true,
  state: true,
  source: true,
  stage: true,
  priority: true,
  intent: true,
  productName: true,
  quantity: true,
  expectedValue: true,
  requirement: true,
  nextFollowUpAt: true,
  lastActivityNote: true,
  createdAt: true,
  assignedTo: { select: { id: true, name: true } },
};

export async function listLeads() {
  const leads = await prisma.lead.findMany({
    select: LEAD_SELECT,
    orderBy: { createdAt: "desc" },
  });
  return leads.map((l) => ({
    ...l,
    expectedValue: l.expectedValue == null ? null : Number(l.expectedValue),
    assignedTo: l.assignedTo?.name ?? null,
  }));
}

export async function getLead(id) {
  const lead = await prisma.lead.findUnique({
    where: { id: Number(id) },
    select: {
      ...LEAD_SELECT,
      sourceReference: true,
      alternatePhone: true,
      variant: true,
      contactType: true,
      sentiment: true,
      lostReason: true,
      convertedAt: true,
      updatedAt: true,
      customer: { select: { id: true, code: true, name: true } },
    },
  });
  if (!lead) throw httpError(404, "Lead not found");
  return {
    ...lead,
    expectedValue: lead.expectedValue == null ? null : Number(lead.expectedValue),
    assignedTo: lead.assignedTo?.name ?? null,
  };
}

// Follow-ups = communications logged against this lead.
export async function getLeadFollowUps(id) {
  const lead = await prisma.lead.findUnique({ where: { id: Number(id) } });
  if (!lead) throw httpError(404, "Lead not found");

  const rows = await prisma.communication.findMany({
    where: { leadId: Number(id) },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      channel: true,
      direction: true,
      subject: true,
      body: true,
      status: true,
      sentAt: true,
      followUpAt: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
    },
  });
  return rows.map((c) => ({ ...c, by: c.user?.name ?? null, user: undefined }));
}

export default { listLeads, getLead, getLeadFollowUps };
