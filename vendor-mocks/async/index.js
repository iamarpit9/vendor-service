const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

app.post("/", (req, res) => {
  const { request_id, payload } = req.body;
  setTimeout(async () => {
    await axios.post("http://localhost:8080/vendor-webhook/async", {
      request_id,
      result: {
        name: payload.name?.toUpperCase(),
        email: payload.email,
        ssn: "123-45-6789",
      },
    });
  }, 3000);
  res.sendStatus(202);
});

app.listen(5002, () => console.log("Async Vendor running on 5002"));
