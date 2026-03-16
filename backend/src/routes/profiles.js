const express = require('express');
const { getDb, recalculateTrustScore, isProfileComplete } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

/**
 * Strip sensitive contact fields from a profile object.
 * phone and social_links are only visible after mutual contact reveal.
 */
function stripSensitiveFields(user) {
  const { phone, social_links, password, ...safe } = user;
  return safe;
}

/**
 * Compute a 0–100 compatibility score between the current user and a candidate.
 * Higher scores indicate more shared traits, intentions, and preferences.
 */
function computeCompatibility(currentUser, candidate) {
  let score = 0;

  // Intentions match (+30)
  if (
    currentUser.intentions &&
    candidate.intentions &&
    currentUser.intentions === candidate.intentions
  ) {
    score += 30;
  }

  // Shared values (+5 each, max 25)
  try {
    const myValues = JSON.parse(currentUser.values || '[]');
    const theirValues = JSON.parse(candidate.values || '[]');
    const sharedValues = myValues.filter((v) => theirValues.includes(v));
    score += Math.min(sharedValues.length * 5, 25);
  } catch (_) {
    // ignore parse errors
  }

  // Shared interests (+3 each, max 15)
  try {
    const myInterests = JSON.parse(currentUser.interests || '[]');
    const theirInterests = JSON.parse(candidate.interests || '[]');
    const sharedInterests = myInterests.filter((i) => theirInterests.includes(i));
    score += Math.min(sharedInterests.length * 3, 15);
  } catch (_) {
    // ignore parse errors
  }

  // Compatible personality types
  const introvertExtrovert =
    (currentUser.personality_type === 'Introvert' && candidate.personality_type === 'Extrovert') ||
    (currentUser.personality_type === 'Extrovert' && candidate.personality_type === 'Introvert');
  if (introvertExtrovert) {
    score += 10;
  } else if (
    currentUser.personality_type &&
    candidate.personality_type &&
    currentUser.personality_type === candidate.personality_type
  ) {
    score += 5;
  }

  // Similar lifestyle (+10)
  if (
    currentUser.lifestyle &&
    candidate.lifestyle &&
    currentUser.lifestyle === candidate.lifestyle
  ) {
    score += 10;
  }

  // Age proximity
  if (currentUser.age && candidate.age) {
    const diff = Math.abs(currentUser.age - candidate.age);
    if (diff < 5) score += 10;
    else if (diff < 10) score += 5;
  }

  return Math.min(score, 100);
}

// GET /api/profiles - Discovery feed (excludes self and already-connected users)
router.get('/', (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const offset = (page - 1) * limit;
  const currentUserId = req.user.id;

  const db = getDb();
  const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId);
  if (!currentUser) return res.status(404).json({ error: 'User not found' });

  // Exclude already-connected users
  const connectedIds = db
    .prepare(
      `SELECT sender_id, receiver_id FROM connections
       WHERE sender_id = ? OR receiver_id = ?`
    )
    .all(currentUserId, currentUserId)
    .flatMap((c) => [c.sender_id, c.receiver_id])
    .filter((id) => id !== currentUserId);

  const excludeIds = [...new Set([currentUserId, ...connectedIds])];
  const placeholders = excludeIds.map(() => '?').join(',');

  const profiles = db
    .prepare(
      `SELECT * FROM users WHERE id NOT IN (${placeholders})
       ORDER BY trust_score DESC
       LIMIT ? OFFSET ?`
    )
    .all(...excludeIds, limit, offset);

  const total = db
    .prepare(`SELECT COUNT(*) as count FROM users WHERE id NOT IN (${placeholders})`)
    .get(...excludeIds).count;

  const result = profiles.map((profile) => ({
    ...stripSensitiveFields(profile),
    compatibility_score: computeCompatibility(currentUser, profile),
  }));

  res.json({
    profiles: result,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// GET /api/profiles/me/matches - Top compatibility matches
router.get('/me/matches', (req, res) => {
  const currentUserId = req.user.id;
  const db = getDb();
  const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId);
  if (!currentUser) return res.status(404).json({ error: 'User not found' });

  const connectedIds = db
    .prepare(
      `SELECT sender_id, receiver_id FROM connections
       WHERE sender_id = ? OR receiver_id = ?`
    )
    .all(currentUserId, currentUserId)
    .flatMap((c) => [c.sender_id, c.receiver_id])
    .filter((id) => id !== currentUserId);

  const excludeIds = [...new Set([currentUserId, ...connectedIds])];
  const placeholders = excludeIds.map(() => '?').join(',');

  const candidates = db
    .prepare(`SELECT * FROM users WHERE id NOT IN (${placeholders})`)
    .all(...excludeIds);

  const scored = candidates
    .map((profile) => ({
      ...stripSensitiveFields(profile),
      compatibility_score: computeCompatibility(currentUser, profile),
    }))
    .sort((a, b) => b.compatibility_score - a.compatibility_score)
    .slice(0, 20);

  res.json({ matches: scored });
});

// GET /api/profiles/:id - Get a specific profile
router.get('/:id', (req, res) => {
  const db = getDb();
  const profile = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  // Check if contact has been mutually revealed
  const connection = db
    .prepare(
      `SELECT * FROM connections
       WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
         AND contact_revealed_at IS NOT NULL`
    )
    .get(req.user.id, profile.id, profile.id, req.user.id);

  const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

  if (connection) {
    const { password, ...safe } = profile;
    return res.json({
      ...safe,
      compatibility_score: computeCompatibility(currentUser, profile),
    });
  }

  res.json({
    ...stripSensitiveFields(profile),
    compatibility_score: computeCompatibility(currentUser, profile),
  });
});

// PUT /api/profiles/me - Update current user's profile
router.put('/me', (req, res) => {
  const currentUserId = req.user.id;
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const allowedFields = [
    'name', 'age', 'gender', 'location', 'bio', 'profile_photo',
    'phone', 'social_links', 'personality_type', 'lifestyle',
    'values', 'interests', 'intentions', 'relationship_status',
    'education', 'occupation',
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const merged = { ...user, ...updates };
  const completed = isProfileComplete(merged) ? 1 : 0;
  updates.profile_completed = completed;

  const safeAllowedFields = new Set([...allowedFields, 'profile_completed']);
  const setClauses = Object.keys(updates)
    .filter((k) => safeAllowedFields.has(k))
    .map((k) => `"${k}" = ?`)
    .concat(`updated_at = datetime('now')`)
    .join(', ');

  const values = Object.entries(updates)
    .filter(([k]) => safeAllowedFields.has(k))
    .map(([, v]) => v);

  db.prepare(`UPDATE users SET ${setClauses} WHERE id = ?`).run(...values, currentUserId);

  const trustScore = recalculateTrustScore(currentUserId);
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUserId);
  const { password, ...safe } = updated;

  res.json({ ...safe, trust_score: trustScore });
});

module.exports = router;
