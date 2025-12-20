import express from "express";
import cors from "cors";
import {} from "@y-sweet/sdk";

const app = express();
app.use(cors());
app.use(express.json());

// === Initialize Y-Sweet SDK ===
// Replace with your local Y-Sweet server URL and admin secret
const ysdk = new YSweetSDK({
  adminUrl: "http://localhost:1234", // admin API endpoint
  adminSecret: "mysecret",
});

// === Token issuing endpoint ===
app.post("/api/ysweet-token", async (req, res) => {
  try {
    const { docId, userId } = req.body;
    if (!docId || !userId) {
      return res.status(400).json({ error: "docId and userId are required" });
    }

    // Issue a token for the client
    const token = await ysdk.createToken({
      docId,
      userId,
      permissions: ["read", "write"],
      ttlSeconds: 300, // 5 minutes
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create token" });
  }
});

// === Start server ===
const PORT = 3000;
app.listen(PORT, () => console.log(`YSweet API server listening on http://localhost:${PORT}`));
