const express = require("express");
const app = express();
app.use(express.json());

app.post("/", (req, res) => {
  res.json({
    name: req.body.name?.toUpperCase(),
    email: req.body.email,
    ssn: "123-45-6789",
  });
});

app.listen(5001, () => console.log("Sync Vendor running on 5001"));
