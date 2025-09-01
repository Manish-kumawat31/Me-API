// backend/routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");

// Basic auth middleware (optional)
function basicAuth(req, res, next) {
  const user = process.env.BASIC_USER;
  const pass = process.env.BASIC_PASS;
  if (!user) return next(); // not enabled
  const auth = req.headers.authorization || "";
  const [scheme, encoded] = auth.split(" ");
  if (scheme !== "Basic" || !encoded) {
    res.setHeader("WWW-Authenticate", "Basic");
    return res.status(401).json({ message: "Authorization required" });
  }
  const buff = Buffer.from(encoded, "base64").toString();
  const [u, p] = buff.split(":");
  if (u === user && p === pass) return next();
  return res.status(403).json({ message: "Forbidden" });
}

// CREATE profile (if none exists)
router.post("/profile", basicAuth, async (req, res) => {
  try {
    const existing = await Profile.findOne();
    if (existing) return res.status(400).json({ message: "Profile exists. Use PUT /profile to update." });
    const profile = await Profile.create(req.body);
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ profile
router.get("/profile", async (_req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: "No profile seeded" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE profile (replace/merge)
router.put("/profile", basicAuth, async (req, res) => {
  try {
    const updated = await Profile.findOneAndUpdate({}, req.body, { upsert: true, new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /projects?skill=python
router.get("/projects", async (req, res) => {
  try {
    const { skill } = req.query;
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: "No profile" });
    let projects = profile.projects || [];
    if (skill) {
      const s = String(skill).toLowerCase();
      projects = projects.filter(p => (p.skills || []).some(sk => sk.toLowerCase() === s));
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /skills/top
router.get("/skills/top", async (_req, res) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: "No profile" });
    const counts = {};
    (profile.skills || []).forEach(s => { const k = s.toLowerCase(); counts[k] = (counts[k]||0)+1; });
    (profile.projects || []).forEach(p => (p.skills||[]).forEach(s => { const k=s.toLowerCase(); counts[k]=(counts[k]||0)+1; }));
    (profile.work || []).forEach(w => (w.skills||[]).forEach(s => { const k=s.toLowerCase(); counts[k]=(counts[k]||0)+1; }));
    const top = Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([skill, occurrences])=>({ skill, occurrences }));
    res.json(top);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /search?q=...
router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").toLowerCase().trim();
    const profile = await Profile.findOne();
    if (!profile) return res.status(404).json({ message: "No profile" });
    if (!q) return res.json({ projects: [], skills: [], work: [] });

    const contains = (text) => (text || "").toLowerCase().includes(q);

    const projects = (profile.projects || []).filter(p =>
      contains(p.title) || contains(p.description) || (p.skills||[]).some(s=>s.toLowerCase().includes(q))
    );
    const skills = (profile.skills || []).filter(s=>s.toLowerCase().includes(q));
    const work = (profile.work || []).filter(w =>
      contains(w.company) || contains(w.role) || contains(w.description) || (w.skills||[]).some(s=>s.toLowerCase().includes(q))
    );

    res.json({ projects, skills, work });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
