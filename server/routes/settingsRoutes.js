const express = require("express");
const fs = require("fs");
const path = require("path");
const requireAuth = require("../middleware/authMiddleware");

const router = express.Router();
const SETTINGS_FILE = path.join(__dirname, "../data/settings.json");

const DEFAULT_SETTINGS = {
  isOpen: true,
  acceptingOrders: true,
};

const readSettings = () => {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(
        SETTINGS_FILE,
        JSON.stringify(DEFAULT_SETTINGS, null, 2),
        "utf8",
      );
      return { ...DEFAULT_SETTINGS };
    }

    const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));

    return {
      ...DEFAULT_SETTINGS,
      ...(data && typeof data === "object" ? data : {}),
    };
  } catch (error) {
    console.error("Error reading shop settings:", error);
    return { ...DEFAULT_SETTINGS };
  }
};

const writeSettings = (settings) => {
  fs.writeFileSync(
    SETTINGS_FILE,
    JSON.stringify(settings, null, 2),
    "utf8",
  );
};

// GET /api/settings - public
router.get("/", (req, res) => {
  res.status(200).json(readSettings());
});

// PUT /api/settings - shopkeeper only
router.put("/", requireAuth, (req, res) => {
  try {
    const current = readSettings();

    const updated = {
      isOpen:
        typeof req.body?.isOpen === "boolean"
          ? req.body.isOpen
          : current.isOpen,
      acceptingOrders:
        typeof req.body?.acceptingOrders === "boolean"
          ? req.body.acceptingOrders
          : current.acceptingOrders,
    };

    writeSettings(updated);

    console.log("Shop settings updated:", updated);

    return res.status(200).json({
      success: true,
      message: "Shop settings updated successfully",
      settings: updated,
      ...updated,
    });
  } catch (error) {
    console.error("Settings update error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update shop settings",
    });
  }
});

// GET /api/settings/stream - public live status
router.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const sendSettings = () => {
    try {
      res.write(`data: ${JSON.stringify(readSettings())}\n\n`);
    } catch (error) {
      console.error("SSE settings error:", error);
    }
  };

  sendSettings();

  const interval = setInterval(sendSettings, 3000);

  req.on("close", () => {
    clearInterval(interval);
  });
});

module.exports = router;
