require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const cors = require("cors");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
app.use(cors({
  origin: ["https://time-bros.vercel.app", "http://localhost:5173"],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Sign up route
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, hashedPassword]
    );
    res.json({ message: "User created!", user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: "An account with this email already exists." });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: "No account found with this email." });
    const valid = await bcrypt.compare(password, result.rows[0].password);
    if (!valid) return res.status(400).json({ error: "Incorrect password." });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Modules route
app.get("/modules", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM modules ORDER BY code");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lessons route
app.get("/modules/:code/lessons", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM lessons WHERE module_code = $1",
      [req.params.code]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 1: Request OTP
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Invalid email." });

    // Check if OTP sent in the last 1 min
    const recentOtp = await pool.query(
      "SELECT * FROM password_reset_otps WHERE email = $1 AND created_at > NOW() - INTERVAL '1 minute' ORDER BY id DESC LIMIT 1",
      [email]
    );
    if (recentOtp.rows.length > 0)
      return res.status(429).json({ error: "Please wait 1 minute before requesting another code." });

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "INSERT INTO password_reset_otps (email, otp, expires_at) VALUES ($1, $2, $3)",
      [email, otp, expiresAt]
    );

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your Timebros password reset code",
      html: `<p>Your OTP is: <strong>${otp}</strong></p><p>Valid for 10 minutes.</p>`,
    });

    res.json({ message: "OTP sent." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 2: Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM password_reset_otps WHERE email = $1 AND otp = $2 AND used = FALSE AND expires_at > NOW() ORDER BY id DESC LIMIT 1",
      [email, otp]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Invalid or expired OTP." });

    res.json({ message: "OTP verified." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 3: Reset Password
app.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM password_reset_otps WHERE email = $1 AND otp = $2 AND used = FALSE AND expires_at > NOW() ORDER BY id DESC LIMIT 1",
      [email, otp]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Invalid or expired OTP." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashed, email]);
    await pool.query("UPDATE password_reset_otps SET used = TRUE WHERE id = $1", [result.rows[0].id]);

    res.json({ message: "Password reset successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save timetable
app.post("/schedules", async (req, res) => {
  const { email, selectionMap, selectedMods, dayBlocks, enabledDays, selectedResult, mode } = req.body;
  try {
    await pool.query(
      `INSERT INTO saved_schedules (email, selection_map, selected_mods, day_blocks, enabled_days, selected_result, mode, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (email) DO UPDATE SET
         selection_map = $2,
         selected_mods = $3,
         day_blocks = $4,
         enabled_days = $5,
         selected_result = $6,
         mode = $7,
         updated_at = NOW()`,
      [
        email,
        typeof selectionMap === 'string' ? selectionMap : JSON.stringify(selectionMap),
        typeof selectedMods === 'string' ? selectedMods : JSON.stringify(selectedMods),
        typeof dayBlocks === 'string' ? dayBlocks : JSON.stringify(dayBlocks),
        typeof enabledDays === 'string' ? enabledDays : JSON.stringify(enabledDays),
        selectedResult ?? 0,
        mode ?? 'manual'
      ]
    );
    res.json({ message: "Schedule saved." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a user's saved schedule (for friend matching)
app.get("/schedules/:email", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM saved_schedules WHERE email = $1",
      [req.params.email]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "No saved schedule found for this user." });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("Server running on port 3001"));