// Users module - list and inspect ERP users (read-only).
const prisma = require("../../utils/prisma");
const httpError = require("../../utils/httpError");

const PUBLIC_FIELDS = {
  id: true,
  name: true,
  email: true,
  phone: true,
  department: true,
  designation: true,
  employeeCode: true,
  role: true,
  isActive: true,
  isLoggedIn: true,
  joiningDate: true,
  createdAt: true,
};

async function listUsers() {
  return prisma.user.findMany({
    select: PUBLIC_FIELDS,
    orderBy: { name: "asc" },
  });
}

async function getUser(id) {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      ...PUBLIC_FIELDS,
      avatarUrl: true,
      address: true,
      emergencyContact: true,
      shift: true,
      _count: {
        select: { assignedLeads: true, assignedServiceTickets: true },
      },
    },
  });
  if (!user) throw httpError(404, "User not found");
  return user;
}

module.exports = { listUsers, getUser };
