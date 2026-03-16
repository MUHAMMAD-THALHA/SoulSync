const express = require('express');
const { getDb, recalculateTrustScore } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// POST /api/connections - Send a connection request
router.post('/', (req, res) => {
  const senderId = req.user.id;
  const { receiverId, message } = req.body;

  if (!receiverId) {
    return res.status(400).json({ error: 'receiverId is required' });
  }

  if (senderId === parseInt(receiverId)) {
    return res.status(400).json({ error: 'Cannot connect with yourself' });
  }

  const db = getDb();

  const receiver = db.prepare('SELECT id FROM users WHERE id = ?').get(receiverId);
  if (!receiver) return res.status(404).json({ error: 'Receiver not found' });

  const existing = db
    .prepare(
      `SELECT id FROM connections
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`
    )
    .get(senderId, receiverId, receiverId, senderId);

  if (existing) {
    return res.status(409).json({ error: 'Connection already exists' });
  }

  const result = db
    .prepare(
      `INSERT INTO connections (sender_id, receiver_id, message)
       VALUES (?, ?, ?)`
    )
    .run(senderId, receiverId, message || null);

  const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ connection });
});

// GET /api/connections - Get all connections for current user
router.get('/', (req, res) => {
  const userId = req.user.id;
  const db = getDb();

  const connections = db
    .prepare(
      `SELECT c.*,
         sender.id as sender_id, sender.name as sender_name,
         sender.age as sender_age, sender.gender as sender_gender,
         sender.profile_photo as sender_photo, sender.trust_score as sender_trust_score,
         receiver.id as receiver_id, receiver.name as receiver_name,
         receiver.age as receiver_age, receiver.gender as receiver_gender,
         receiver.profile_photo as receiver_photo, receiver.trust_score as receiver_trust_score
       FROM connections c
       JOIN users sender ON c.sender_id = sender.id
       JOIN users receiver ON c.receiver_id = receiver.id
       WHERE c.sender_id = ? OR c.receiver_id = ?
       ORDER BY c.updated_at DESC`
    )
    .all(userId, userId);

  res.json({ connections });
});

// PUT /api/connections/:id/respond - Accept or reject a connection
router.put('/:id/respond', (req, res) => {
  const { action } = req.body;
  const connectionId = req.params.id;
  const userId = req.user.id;

  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'action must be "accept" or "reject"' });
  }

  const db = getDb();
  const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId);

  if (!connection) return res.status(404).json({ error: 'Connection not found' });
  if (connection.receiver_id !== userId) {
    return res.status(403).json({ error: 'Only the receiver can respond to a connection request' });
  }
  if (connection.status !== 'pending') {
    return res.status(409).json({ error: 'Connection has already been responded to' });
  }

  const newStatus = action === 'accept' ? 'accepted' : 'rejected';
  db.prepare(
    `UPDATE connections SET status = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(newStatus, connectionId);

  if (newStatus === 'accepted') {
    recalculateTrustScore(connection.sender_id);
    recalculateTrustScore(connection.receiver_id);
  }

  const updated = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId);
  res.json({ connection: updated });
});

// POST /api/connections/:id/trust-agreement - Agree to trust agreement
router.post('/:id/trust-agreement', (req, res) => {
  const connectionId = req.params.id;
  const userId = req.user.id;
  const db = getDb();

  const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId);
  if (!connection) return res.status(404).json({ error: 'Connection not found' });

  if (connection.sender_id !== userId && connection.receiver_id !== userId) {
    return res.status(403).json({ error: 'You are not part of this connection' });
  }
  if (connection.status !== 'accepted') {
    return res.status(400).json({ error: 'Connection must be accepted before trust agreement' });
  }

  const isSender = connection.sender_id === userId;

  if (isSender && connection.sender_trust_agreed) {
    return res.status(409).json({ error: 'You have already agreed to the trust agreement' });
  }
  if (!isSender && connection.receiver_trust_agreed) {
    return res.status(409).json({ error: 'You have already agreed to the trust agreement' });
  }

  const field = isSender ? 'sender_trust_agreed' : 'receiver_trust_agreed';
  db.prepare(
    `UPDATE connections SET ${field} = 1, updated_at = datetime('now') WHERE id = ?`
  ).run(connectionId);

  const fresh = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId);

  // Both have agreed — record timestamp and boost trust scores
  if (fresh.sender_trust_agreed && fresh.receiver_trust_agreed) {
    db.prepare(
      `UPDATE connections SET trust_agreement_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
    ).run(connectionId);
    recalculateTrustScore(connection.sender_id);
    recalculateTrustScore(connection.receiver_id);
  }

  const result = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId);
  res.json({
    connection: result,
    bothAgreed: result.sender_trust_agreed === 1 && result.receiver_trust_agreed === 1,
  });
});

// POST /api/connections/:id/contact-reveal - Request or confirm contact reveal
router.post('/:id/contact-reveal', (req, res) => {
  const connectionId = req.params.id;
  const userId = req.user.id;
  const db = getDb();

  const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId);
  if (!connection) return res.status(404).json({ error: 'Connection not found' });

  if (connection.sender_id !== userId && connection.receiver_id !== userId) {
    return res.status(403).json({ error: 'You are not part of this connection' });
  }
  if (!connection.sender_trust_agreed || !connection.receiver_trust_agreed) {
    return res.status(400).json({ error: 'Both users must agree to trust agreement before revealing contact' });
  }

  const isSender = connection.sender_id === userId;
  const field = isSender ? 'sender_contact_reveal' : 'receiver_contact_reveal';

  if ((isSender && connection.sender_contact_reveal) || (!isSender && connection.receiver_contact_reveal)) {
    return res.status(409).json({ error: 'You have already requested contact reveal' });
  }

  db.prepare(
    `UPDATE connections SET ${field} = 1, updated_at = datetime('now') WHERE id = ?`
  ).run(connectionId);

  const fresh = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId);

  if (fresh.sender_contact_reveal && fresh.receiver_contact_reveal) {
    db.prepare(
      `UPDATE connections SET contact_revealed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
    ).run(connectionId);

    const otherUserId = isSender ? connection.receiver_id : connection.sender_id;
    const otherUser = db.prepare('SELECT name, email, phone, social_links FROM users WHERE id = ?').get(otherUserId);

    return res.json({
      connection: db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId),
      contactRevealed: true,
      contact: otherUser,
    });
  }

  res.json({
    connection: fresh,
    contactRevealed: false,
    message: 'Waiting for the other user to request contact reveal',
  });
});

// GET /api/connections/:id/contact - Get revealed contact info
router.get('/:id/contact', (req, res) => {
  const connectionId = req.params.id;
  const userId = req.user.id;
  const db = getDb();

  const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId);
  if (!connection) return res.status(404).json({ error: 'Connection not found' });

  if (connection.sender_id !== userId && connection.receiver_id !== userId) {
    return res.status(403).json({ error: 'You are not part of this connection' });
  }

  if (!connection.contact_revealed_at) {
    return res.status(403).json({ error: 'Contact has not been mutually revealed yet' });
  }

  const otherUserId = connection.sender_id === userId ? connection.receiver_id : connection.sender_id;
  const otherUser = db.prepare('SELECT name, email, phone, social_links FROM users WHERE id = ?').get(otherUserId);

  res.json({ contact: otherUser });
});

module.exports = router;
