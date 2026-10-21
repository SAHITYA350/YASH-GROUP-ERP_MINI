import "dotenv/config";
import express from "express";
import cors from "cors";
import errorHandler from "./common/errorHandler.js";
import modulesRouter from "./modules/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "YASH ERP backend is running",
    module: "Project, Installation & Service",
    timestamp: new Date().toISOString()
  });
});

app.use("/api", modulesRouter);
app.use(errorHandler);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found"
  });
});

app.listen(PORT, () => {
  console.log(`YASH ERP backend running at http://localhost:${PORT}`);
});
