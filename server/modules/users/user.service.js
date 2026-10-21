// Users module - list and inspect ERP users (read-only).
import prisma from "../../utils/prisma.js";
import httpError from "../../utils/httpError.js";

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

export async function listUsers() {
  return prisma.user.findMany({
    select: PUBLIC_FIELDS,
    orderBy: { name: "asc" },
  });
}

export async function getUser(id) {
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

export default { listUsers, getUser };
