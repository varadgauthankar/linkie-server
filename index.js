const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 8000;

const scraper = require("./scraper");

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// routes
app.post("/api/get-url-data", async (req, res) => {
  const { url } = req.body;

  try {
    const data = await scraper(url);
    res.json({ status: 200, data });
  } catch (error) {
    res.status(500).json({ status: 500, error: error.message });
  }
});

// start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
