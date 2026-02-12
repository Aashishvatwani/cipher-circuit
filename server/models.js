const mongoose = require('mongoose');

// Round 1 Key Lookup Table - 16 combinations for S3 S2 S1 S0
const ROUND1_LOOKUP_TABLE = [
  { switches: { S3: 0, S2: 0, S1: 0, S0: 0 }, key: '0000' },
  { switches: { S3: 0, S2: 0, S1: 0, S0: 1 }, key: '1001' },
  { switches: { S3: 0, S2: 0, S1: 1, S0: 0 }, key: '0011' },
  { switches: { S3: 0, S2: 0, S1: 1, S0: 1 }, key: '1010' },
  { switches: { S3: 0, S2: 1, S1: 0, S0: 0 }, key: '0110' },
  { switches: { S3: 0, S2: 1, S1: 0, S0: 1 }, key: '1111' },
  { switches: { S3: 0, S2: 1, S1: 1, S0: 0 }, key: '0101' },
  { switches: { S3: 0, S2: 1, S1: 1, S0: 1 }, key: '1100' },
  { switches: { S3: 1, S2: 0, S1: 0, S0: 0 }, key: '1100' },
  { switches: { S3: 1, S2: 0, S1: 0, S0: 1 }, key: '0111' },
  { switches: { S3: 1, S2: 0, S1: 1, S0: 0 }, key: '1111' },
  { switches: { S3: 1, S2: 0, S1: 1, S0: 1 }, key: '0110' },
  { switches: { S3: 1, S2: 1, S1: 0, S0: 0 }, key: '1010' },
  { switches: { S3: 1, S2: 1, S1: 0, S0: 1 }, key: '0011' },
  { switches: { S3: 1, S2: 1, S1: 1, S0: 0 }, key: '1001' },
  { switches: { S3: 1, S2: 1, S1: 1, S0: 1 }, key: '0000' }
];

// Team Schema
const teamSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    teamName: {
      type: String,
      required: true
    },
    members: [
      {
        socketId: String,
        role: String,
        online: { type: Boolean, default: true }
      }
    ],
    registeredAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    queuePosition: {
      type: Number,
      default: null
    },
    round: {
      type: Number,
      default: 1,
      enum: [1, 2]
    },
    key4bit: {
      type: String,
      default: ''
    },
    key8bit: {
      type: String,
      default: ''
    },
    switchValues: {
      S0: { type: Number, default: null },
      S1: { type: Number, default: null },
      S2: { type: Number, default: null },
      S3: { type: Number, default: null }
    },
    round1Complete: {
      type: Boolean,
      default: false
    },
    round1Submissions: [
      {
        socketId: String,
        key: String,
        submittedAt: { type: Date, default: Date.now }
      }
    ],
    round2Complete: {
      type: Boolean,
      default: false
    },
    ciphertext: {
      type: String,
      default: ''
    },
    plaintextDecimal: {
      type: String,
      default: ''
    },
    assignedNumber: {
      type: Number,
      default: null
    },
    xorValue: {
      type: Number,
      default: null
    },
    encryptionValue: {
      type: Number,
      default: null
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    completionTime: {
      type: Date,
      default: null
    },
    resubmissions: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Leaderboard Schema (denormalized for faster queries)
const leaderboardSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    teamName: String,
    timeElapsed: Number,
    resubmissions: Number,
    completionDate: Date,
    rank: Number
  },
  { timestamps: true }
);

// Session logs for detailed tracking
const sessionLogSchema = new mongoose.Schema(
  {
    teamId: String,
    socketId: String,
    eventType: String, // 'join', 'submit_round1', 'submit_encryption', 'submit_decryption', 'disconnect'
    eventData: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
  }
);

// Assignment Queue Schema for managing team assignments
const assignmentQueueSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      required: true,
      index: true
    },
    position: {
      type: Number,
      required: true,
      index: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Team = mongoose.model('Team', teamSchema);
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
const SessionLog = mongoose.model('SessionLog', sessionLogSchema);
const AssignmentQueue = mongoose.model('AssignmentQueue', assignmentQueueSchema);

module.exports = {
  Team,
  Leaderboard,
  SessionLog,
  AssignmentQueue,
  ROUND1_LOOKUP_TABLE
};
