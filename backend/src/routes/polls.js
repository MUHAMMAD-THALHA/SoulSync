const express = require('express');
const { getDb } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// GET /api/polls - Get all active polls with vote counts and user's votes
router.get('/', (req, res) => {
  const userId = req.user.id;
  const db = getDb();

  const polls = db.prepare('SELECT * FROM polls WHERE is_active = 1 ORDER BY created_at DESC').all();

  const result = polls.map((poll) => {
    const options = db
      .prepare('SELECT * FROM poll_options WHERE poll_id = ? ORDER BY id ASC')
      .all(poll.id);

    const userVote = db
      .prepare('SELECT option_id FROM poll_votes WHERE poll_id = ? AND user_id = ?')
      .get(poll.id, userId);

    const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);

    return {
      ...poll,
      options: options.map((o) => ({
        ...o,
        percentage: totalVotes > 0 ? Math.round((o.vote_count / totalVotes) * 100) : 0,
      })),
      total_votes: totalVotes,
      user_vote: userVote ? userVote.option_id : null,
    };
  });

  res.json({ polls: result });
});

// POST /api/polls/:pollId/vote - Vote on a poll
router.post('/:pollId/vote', (req, res) => {
  const pollId = req.params.pollId;
  const userId = req.user.id;
  const { optionId } = req.body;

  if (!optionId) {
    return res.status(400).json({ error: 'optionId is required' });
  }

  const db = getDb();

  const poll = db.prepare('SELECT * FROM polls WHERE id = ? AND is_active = 1').get(pollId);
  if (!poll) return res.status(404).json({ error: 'Poll not found or no longer active' });

  const option = db.prepare('SELECT * FROM poll_options WHERE id = ? AND poll_id = ?').get(optionId, pollId);
  if (!option) return res.status(404).json({ error: 'Option not found for this poll' });

  const existingVote = db
    .prepare('SELECT id FROM poll_votes WHERE poll_id = ? AND user_id = ?')
    .get(pollId, userId);

  if (existingVote) {
    return res.status(409).json({ error: 'You have already voted on this poll' });
  }

  const castVote = db.transaction(() => {
    db.prepare(
      'INSERT INTO poll_votes (poll_id, user_id, option_id) VALUES (?, ?, ?)'
    ).run(pollId, userId, optionId);

    db.prepare(
      'UPDATE poll_options SET vote_count = vote_count + 1 WHERE id = ?'
    ).run(optionId);
  });

  castVote();

  const options = db.prepare('SELECT * FROM poll_options WHERE poll_id = ? ORDER BY id ASC').all(pollId);
  const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);

  res.json({
    poll: {
      ...poll,
      options: options.map((o) => ({
        ...o,
        percentage: totalVotes > 0 ? Math.round((o.vote_count / totalVotes) * 100) : 0,
      })),
      total_votes: totalVotes,
      user_vote: parseInt(optionId),
    },
  });
});

module.exports = router;
