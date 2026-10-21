import { Prisma } from "@prisma/client";

export default function errorHandler(err, req, res, next) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "A record with that unique value already exists" });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ success: false, message: "A related customer, order, product, user or project does not exist" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
  }
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
}
