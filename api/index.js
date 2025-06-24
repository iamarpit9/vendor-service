const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const { createJob } = require("../queue/redis");
const Job = require("../db/job");

dotenv.config();
const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Mongo connected"));

app.post("/jobs", async (req, res) => {
  const requestId = uuidv4();
  await Job.create({
    requestId,
    payload: req.body,
    status: "pending",
    vendor: req.body.vendor || "sync",
  });
  await createJob({ requestId, payload: req.body });
  res.json({ request_id: requestId });
});

app.get("/jobs/:id", async (req, res) => {
  const job = await Job.findOne({ requestId: req.params.id });
  if (!job) return res.status(404).send("Not found");
  res.json({
    status: job.status,
    result: job.cleanedResult || null,
  });
});

app.post("/vendor-webhook/:vendor", async (req, res) => {
  const { request_id } = req.body;
  const job = await Job.findOne({ requestId: request_id });
  if (!job) return res.status(404).send("Job not found");

  job.cleanedResult = { ...req.body.result };
  job.status = "complete";
  await job.save();

  res.json({ status: "ok" });
});

app.listen(8080, () => console.log("API server running on port 8080"));
