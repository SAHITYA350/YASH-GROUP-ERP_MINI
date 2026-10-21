import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import { createAuthenticate } from "./middleware/authenticate.js";
import { createModularApiRoutes } from "./modules/index.js";
import csrf from "./middleware/csrf.js";
import errorHandler from "./middleware/errorHandler.js";

export function createApp({ db } = {}) {
  const prisma = db || new PrismaClient();
  const app = express();
  const production = process.env.NODE_ENV === "production";
  const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

  app.disable("x-powered-by");
  app.use(helmet({ contentSecurityPolicy: production ? undefined : false }));
  app.use(cors({ origin, credentials: true }));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  app.use(
    "/api/v1",
    createModularApiRoutes({
      prisma,
      authenticate: createAuthenticate(prisma),
      csrf,
      production,
    }),
  );
  app.use(errorHandler);

  return { app, prisma };
}
