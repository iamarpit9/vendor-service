const mongoose = require("mongoose");
const axios = require("axios");
const dotenv = require("dotenv");
const { readJobs } = require("../queue/redis");
const Job = require("../db/Job");
const Redis = require("ioredis");

dotenv.config();

const redis = new Redis(); // default to localhost:6379

// Utility: delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simple per-vendor rate limiter: 1 request/second
async function canMakeRequest(vendor, limit = 1, interval = 1000) {
  const key = `rate_limit:${vendor}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.pexpire(key, interval);
    return true;
  }
  return count <= limit;
}

async function processJob(job) {
  const dbJob = await Job.findOne({ requestId: job.requestId });
  if (!dbJob) return;

  const vendor = dbJob.vendor;

  // Rate limit check
  const allowed = await canMakeRequest(vendor);
  if (!allowed) {
    console.log(`[Rate Limit] ${vendor} - delaying job ${job.requestId}`);
    await sleep(500); // Wait a bit and return (it will be retried)
    return;
  }

  dbJob.status = "processing";
  await dbJob.save();

  try {
    if (vendor === "sync") {
        const url = process.env.SYNC_VENDOR_URL || "http://localhost:5001/"; 
      const res = await axios.post(url, job.payload);
      dbJob.cleanedResult = clean(res.data);
      dbJob.status = "complete";
      await dbJob.save();
    } else if (vendor === "async") {
        const url = process.env.ASYNC_VENDOR_URL || "http://localhost:5002/"; 

      await axios.post(url, {
        request_id: job.requestId,
        payload: job.payload,
      });
    }
  } catch (err) {
    console.error(`[Error] Job ${job.requestId} failed:`, err);
    dbJob.status = "failed";
    await dbJob.save();
  }
}

function clean(data) {
  const clone = { ...data };
  if (clone.ssn) delete clone.ssn;
  Object.keys(clone).forEach((key) => {
    if (typeof clone[key] === "string") clone[key] = clone[key].trim();
  });
  return clone;
}

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("Worker connected to Mongo");
  listen();
});

async function listen(lastId = "$") {
  while (true) {
    const jobs = await readJobs(lastId);
    for (const { id, job } of jobs) {
      await processJob(job);
      lastId = id;
    }
  }
}
