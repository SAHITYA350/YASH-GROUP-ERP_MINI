import "dotenv/config";
import { createApp } from "./src/app.js";

const port = Number(process.env.PORT || 5000);
const { app, prisma } = createApp();
const server = app.listen(port, () =>
  console.info(`Yash ERP API listening on :${port}`),
);

async function shutdown() {
  server.close();
  await prisma.$disconnect();
}
process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
