const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../soulsync.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initializeDatabase() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      location TEXT,
      bio TEXT,
      profile_photo TEXT,
      phone TEXT,
      social_links TEXT,
      personality_type TEXT,
      lifestyle TEXT,
      "values" TEXT,
      interests TEXT,
      intentions TEXT,
      relationship_status TEXT,
      education TEXT,
      occupation TEXT,
      trust_score REAL DEFAULT 50.0,
      is_verified INTEGER DEFAULT 0,
      profile_completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL REFERENCES users(id),
      receiver_id INTEGER NOT NULL REFERENCES users(id),
      status TEXT DEFAULT 'pending',
      sender_trust_agreed INTEGER DEFAULT 0,
      receiver_trust_agreed INTEGER DEFAULT 0,
      trust_agreement_at TEXT,
      sender_contact_reveal INTEGER DEFAULT 0,
      receiver_contact_reveal INTEGER DEFAULT 0,
      contact_revealed_at TEXT,
      message TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS polls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      ends_at TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS poll_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poll_id INTEGER NOT NULL REFERENCES polls(id),
      option_text TEXT NOT NULL,
      vote_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS poll_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poll_id INTEGER NOT NULL REFERENCES polls(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      option_id INTEGER NOT NULL REFERENCES poll_options(id),
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  seedPolls(database);
}

function seedPolls(database) {
  const existingPolls = database.prepare('SELECT COUNT(*) as count FROM polls').get();
  if (existingPolls.count > 0) return;

  const insertPoll = database.prepare(
    'INSERT INTO polls (title, description) VALUES (?, ?)'
  );
  const insertOption = database.prepare(
    'INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)'
  );

  const seedData = [
    {
      title: 'What feature should we build next?',
      description: 'Help us prioritize our product roadmap by voting for the feature you want most.',
      options: [
        'Advanced Personality Quiz',
        'Video Introduction Feature',
        'Verified Professional Profiles',
        'Language Translation Support',
        'Group Interest Communities',
      ],
    },
    {
      title: 'How should Trust Scores be improved?',
      description: 'We want to make Trust Scores more meaningful. What do you think?',
      options: [
        'Add video verification',
        'Peer endorsements',
        'Activity-based scoring',
        'Community moderation badges',
      ],
    },
    {
      title: 'Preferred communication style after trust agreement?',
      description: 'Once trust is established, how would you prefer to communicate?',
      options: [
        'In-app messaging only',
        'Optional video calls',
        'Voice messages',
        'All of the above',
      ],
    },
  ];

  const seedTransaction = database.transaction(() => {
    for (const poll of seedData) {
      const result = insertPoll.run(poll.title, poll.description);
      for (const option of poll.options) {
        insertOption.run(result.lastInsertRowid, option);
      }
    }
  });

  seedTransaction();
}

/**
 * Calculate and update a user's trust score based on their profile data.
 * Score starts at 50 and increases with profile completeness, verification,
 * accepted connections, and trust agreements.
 */
function recalculateTrustScore(userId) {
  const database = getDb();
  const user = database.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return;

  let score = 50.0;

  if (user.profile_completed) score += 20;
  if (user.is_verified) score += 15;

  const acceptedConnections = database
    .prepare(
      `SELECT COUNT(*) as count FROM connections
       WHERE (sender_id = ? OR receiver_id = ?) AND status = 'accepted'`
    )
    .get(userId, userId);
  score += Math.min(acceptedConnections.count * 2, 10);

  const trustAgreements = database
    .prepare(
      `SELECT COUNT(*) as count FROM connections
       WHERE (sender_id = ? AND sender_trust_agreed = 1)
          OR (receiver_id = ? AND receiver_trust_agreed = 1)`
    )
    .get(userId, userId);
  score += Math.min(trustAgreements.count * 1, 5);

  database.prepare('UPDATE users SET trust_score = ?, updated_at = datetime(\'now\') WHERE id = ?').run(score, userId);
  return score;
}

/**
 * Check whether a user's profile is sufficiently complete.
 * Requires the core identity and preference fields to be filled in.
 */
function isProfileComplete(user) {
  const requiredFields = [
    'name', 'age', 'gender', 'location', 'bio',
    'personality_type', 'lifestyle', 'values', 'interests', 'intentions',
    'education', 'occupation',
  ];
  return requiredFields.every((field) => user[field] !== null && user[field] !== undefined && user[field] !== '');
}

module.exports = { getDb, initializeDatabase, recalculateTrustScore, isProfileComplete };
