const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

const STREAM_KEY = "vendor_jobs";

async function createJob(job) {
  await redis.xadd(STREAM_KEY, "*", "job", JSON.stringify(job));
}

async function readJobs(lastId = "$") {
  const res = await redis.xread("BLOCK", 0, "STREAMS", STREAM_KEY, lastId);
  if (!res) return [];
  return res[0][1].map(([id, [, jobStr]]) => ({ id, job: JSON.parse(jobStr) }));
}

module.exports = { createJob, readJobs };
