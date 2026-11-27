const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================
// SHOPKEEPER LOGIN
// ==========================================

// Username is stored in backend
const SHOPKEEPER_USERNAME = "shopkeeper";
// bcrypt hash of the password
const SHOPKEEPER_PASSWORD_HASH =
  "$2a$12$r0wnxy0rJIH8qcmCCHbBjuKfVIU0Jy0Kao8UO8ORCk37T6Rafidum";

const JWT_SECRET = "DailyNeedStore_SuperSecret_Key_2026_ChangeThis";

const JWT_EXPIRES_IN = "1d";

// ==========================================
// LOGIN
// ==========================================

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    // Check username
    if (username !== SHOPKEEPER_USERNAME) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      SHOPKEEPER_PASSWORD_HASH,
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        username: SHOPKEEPER_USERNAME,
        role: "shopkeeper",
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        username: SHOPKEEPER_USERNAME,
        role: "shopkeeper",
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

module.exports = {
  login,
};
