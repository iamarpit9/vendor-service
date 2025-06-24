const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    requestId: String,
    payload: Object,
    status: {
      type: String,
      enum: ["pending", "processing", "complete", "failed"],
    },
    cleanedResult: Object,
    vendor: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
