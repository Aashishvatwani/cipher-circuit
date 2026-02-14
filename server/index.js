const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const { Team, Leaderboard, SessionLog, AssignmentQueue, ROUND1_LOOKUP_TABLE } = require('./models');
const { generateToken,  authMiddleware, socketAuthMiddleware } = require('./auth');

const app = express();
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  }
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Store active socket connections
const activeConnections = new Map(); // socketId -> teamId

const ASSIGNED_NUMBERS = [
  42, 198, 7, 154,
  233, 89, 16, 201,
  64, 175, 29, 247,
  110, 3, 186, 95
];

const VALID_ROLES = new Set(['encrypt', 'decrypt']);

function normalizeRole(role) {
  if (typeof role !== 'string') {
    return null;
  }

  const normalized = role.trim().toLowerCase();
  return VALID_ROLES.has(normalized) ? normalized : null;
}

// Helper function to get assignment from lookup table
function getAssignmentFromLookup(position) {
  const index = position % ROUND1_LOOKUP_TABLE.length;
  return ROUND1_LOOKUP_TABLE[index];
}

function getAssignedNumberFromQueue(position) {
  const index = position % ASSIGNED_NUMBERS.length;
  return ASSIGNED_NUMBERS[index];
}

// Helper function to get correct key from switch values using lookup table
function getCorrectKeyFromSwitches(switchValues) {
  const { S0, S1, S2, S3 } = switchValues;
  // Find matching entry in lookup table
  const entry = ROUND1_LOOKUP_TABLE.find(
    item => item.switches.S0 === S0 && 
             item.switches.S1 === S1 && 
             item.switches.S2 === S2 && 
             item.switches.S3 === S3
  );
  return entry ? entry.key : null;
}

function buildTeamState(team, member) {
  const teammate = member ? team.members.find(m => m.socketId !== member.socketId) : null;
  const baseState = {
    round: team.round,
    key4bit: team.key4bit,
    key8bit: team.key8bit,
    round1Complete: team.round1Complete,
    round2Complete: team.round2Complete,
    switchValues: team.switchValues,
    ciphertext: team.ciphertext,
    memberCount: team.members.length,
    teammateOnline: team.members.filter(m => m.online).length > 1,
    role: member ? member.role : null,
    teammateRole: teammate ? teammate.role : null,
    members: team.members.map(({ socketId, role, online }) => ({ socketId, role, online }))
  };

  if (member?.role === 'encrypt') {
    return { ...baseState, assignedNumber: team.assignedNumber };
  }

  if (member?.role === 'decrypt') {
    return { ...baseState, encryptionValue: team.encryptionValue };
  }

  return baseState;
}

// Queue assignment function
async function assignTeamFromQueue(teamId) {
  try {
    // Get all completed assignments to find next position
    const completedCount = await AssignmentQueue.countDocuments({ completed: true });
    const nextPosition = completedCount;
    
    // Get assignment from lookup table
    const assignment = getAssignmentFromLookup(nextPosition);
    const assignedNumber = getAssignedNumberFromQueue(nextPosition);
    const key8bit = assignment.key + '1000';
    const key8bitDecimal = parseInt(key8bit, 2);
    const xorValue = Number.isNaN(key8bitDecimal) ? null : (assignedNumber ^ key8bitDecimal);
    
    // Update team with switch values
    await Team.updateOne(
      { teamId },
      {
        $set: {
          switchValues: assignment.switches,
          key4bit: assignment.key,
          key8bit: key8bit,
          queuePosition: nextPosition,
          assignedNumber: assignedNumber,
          xorValue: xorValue,
          encryptionValue: xorValue
        }
      }
    );

    // Add to queue
    await AssignmentQueue.create({
      teamId,
      position: nextPosition,
      completed: true
    });

    console.log(`✓ Team ${teamId} assigned position ${nextPosition} with switches:`, assignment.switches);
    return assignment;
  } catch (error) {
    console.error('Error assigning team from queue:', error);
    throw error;
  }
}

// Socket.IO middleware for JWT authentication
io.use(socketAuthMiddleware);

// Socket.IO connection handling
io.on('connection', (socket) => {
  const { teamId, teamName } = socket.user;
  console.log(`Client connected: ${socket.id} (Team: ${teamId})`);

  // Join team room
  socket.on('join_team', async ({ teamId, teamName, role }) => {
    try {
      const desiredRole = normalizeRole(role);
      if (!desiredRole) {
        socket.emit('error', { message: 'Invalid role. Use encrypt or decrypt.' });
        return;
      }

      socket.join(teamId);

      // Get or create team in MongoDB
      let team = await Team.findOne({ teamId });
      
      if (!team) {
        team = new Team({
          teamId,
          teamName,
          members: [{ socketId: socket.id, role: desiredRole, online: true }],
          registeredAt: new Date()
        });
        await team.save();
        console.log(`✓ New team created: ${teamId}`);

        // Assign switch values from lookup table queue
        try {
          await assignTeamFromQueue(teamId);
          // Reload team to get updated values
          team = await Team.findOne({ teamId });
        } catch (err) {
          console.error('Error assigning team values:', err);
        }
      } else {
        // Add new member or update existing socket
        const memberExists = team.members.some(m => m.socketId === socket.id);
        const roleMember = team.members.find(m => m.role === desiredRole);
        if (!memberExists && team.members.length < 2) {
          if (roleMember) {
            roleMember.socketId = socket.id;
            roleMember.online = true;
            await team.save();
          } else {
            team.members.push({ socketId: socket.id, role: desiredRole, online: true });
            await team.save();
          }
        } else if (memberExists) {
          const member = team.members.find(m => m.socketId === socket.id);
          member.online = true;
          await team.save();
        } else if (roleMember) {
          roleMember.socketId = socket.id;
          roleMember.online = true;
          await team.save();
        }
      }

      const currentMember = team.members.find(m => m.socketId === socket.id);
      const onlineMembers = team.members.filter(m => m.online).length;
      let roundAdvanced = false;
      if (onlineMembers === 2 && team.round === 0) {
        team.round = 1;
        await team.save();
        roundAdvanced = true;
      }

      // Store connection info
      activeConnections.set(socket.id, teamId);
      socket.teamId = teamId;

      // Log session
      await SessionLog.create({
        teamId,
        socketId: socket.id,
        eventType: 'join',
        eventData: { role, memberCount: team.members.length }
      });

      // Send current team state
      socket.emit('team_state', buildTeamState(team, currentMember));

      // If round advanced, broadcast to all team members
      if (roundAdvanced) {
        io.to(teamId).emit('team_state', buildTeamState(team, currentMember));
      }

      // Notify other team members
      socket.to(teamId).emit('teammate_joined', {
        socketId: socket.id,
        memberCount: team.members.length
      });

      console.log(`Team ${teamId}: ${team.members.length} members online`);
    } catch (error) {
      console.error('Error in join_team:', error);
      socket.emit('error', { message: 'Failed to join team', error: error.message });
    }
  });

  // Submit Round 1 key
  socket.on('submit_round1_key', async ({ teamId, key }) => {
    try {
      const team = await Team.findOne({ teamId });
      if (!team) {
        socket.emit('error', { message: 'Team not found' });
        return;
      }

      const correctKey = getCorrectKeyFromSwitches(team.switchValues);

      if (key !== correctKey) {
        team.resubmissions += 1;
        await team.save();
        
        await SessionLog.create({
          teamId,
          socketId: socket.id,
          eventType: 'submit_round1_failed',
          eventData: { submittedKey: key, correctKey }
        });

        socket.emit('round1_result', {
          success: false,
          message: 'Incorrect key',
         
        });
        return;
      }

      // Add submission
      const existingIndex = team.round1Submissions.findIndex(s => s.socketId === socket.id);
      if (existingIndex !== -1) {
        team.round1Submissions[existingIndex].key = key;
        team.round1Submissions[existingIndex].submittedAt = new Date();
      } else {
        team.round1Submissions.push({
          socketId: socket.id,
          key,
          submittedAt: new Date()
        });
      }

      // Check if both members submitted correct keys
      if (team.round1Submissions.length === 2) {
        team.key4bit = key;
        team.key8bit = key + '1000';
        team.round1Complete = true;
        team.round = 2;

        await SessionLog.create({
          teamId,
          socketId: socket.id,
          eventType: 'round1_complete',
          eventData: { key4bit: key, key8bit: team.key8bit }
        });

        await team.save();

        io.to(teamId).emit('round1_result', {
          success: true,
          message: 'Round 1 complete! Expanding key...',
          key8bit: team.key8bit
        });

        // Notify all team members
        team.members.forEach((member) => {
          io.to(member.socketId).emit('team_state', buildTeamState(team, member));
        });
      } else {
        await team.save();
        
        socket.emit('round1_result', {
          success: true,
          message: 'Key verified. Waiting for teammate...',
          waitingForTeammate: true
        });
      }
    } catch (error) {
      console.error('Error in submit_round1_key:', error);
      socket.emit('error', { message: 'Failed to submit key', error: error.message });
    }
  });

  // Submit encryption (Teammate A)
  socket.on('submit_encryption', async ({ teamId, ciphertext, plaintext }) => {
    try {
      const team = await Team.findOne({ teamId });
      if (!team) {
        socket.emit('error', { message: 'Team not found' });
        return;
      }

      const member = team.members.find(m => m.socketId === socket.id);
      if (!member || member.role !== 'encrypt') {
        socket.emit('error', { message: 'Only the encrypt teammate can submit encryption' });
        return;
      }

      team.ciphertext = ciphertext;
      team.plaintextDecimal = plaintext;
      await team.save();

      await SessionLog.create({
        teamId,
        socketId: socket.id,
        eventType: 'submit_encryption',
        eventData: { plaintext, ciphertext }
      });

      socket.emit('encryption_result', {
        success: true,
        message: 'Ciphertext transmitted to Teammate B'
      });

      // Notify Teammate B
      socket.to(teamId).emit('ciphertext_received', { ciphertext });
    } catch (error) {
      console.error('Error in submit_encryption:', error);
      socket.emit('error', { message: 'Failed to submit encryption', error: error.message });
    }
  });

  // Submit decryption (Teammate B)
  socket.on('submit_decryption', async ({ teamId, decryptedValue }) => {
    try {
      const team = await Team.findOne({ teamId });
      if (!team) {
        socket.emit('error', { message: 'Team not found' });
        return;
      }

      const member = team.members.find(m => m.socketId === socket.id);
      if (!member || member.role !== 'decrypt') {
        socket.emit('error', { message: 'Only the decrypt teammate can submit decryption' });
        return;
      }

      if (decryptedValue === team.plaintextDecimal) {
        team.round2Complete = true;
        team.completionTime = new Date();
        const timeElapsed = team.completionTime - team.startTime;

        await SessionLog.create({
          teamId,
          socketId: socket.id,
          eventType: 'round2_complete',
          eventData: { decryptedValue, timeElapsed: timeElapsed, resubmissions: team.resubmissions }
        });

        await team.save();

        // Update leaderboard
        await Leaderboard.findOneAndUpdate(
          { teamId },
          {
            teamName: team.teamName,
            timeElapsed: timeElapsed,
            resubmissions: team.resubmissions,
            completionDate: team.completionTime
          },
          { upsert: true }
        );

        // Send confirmation to the submitting player
        socket.emit('decryption_result', {
          success: true,
          message: 'Round 2 complete!',
          timeElapsed,
          resubmissions: team.resubmissions
        });

        // Reload the team to ensure fresh data
        const updatedTeam = await Team.findOne({ teamId });
        
        // Broadcast completion event and updated state to ALL team members
        io.to(teamId).emit('competition_complete', {
          timeElapsed,
          resubmissions: team.resubmissions
        });

        // Ensure both team members get the updated state
        updatedTeam.members.forEach((member) => {
          io.to(member.socketId).emit('team_state', buildTeamState(updatedTeam, member));
        });
        
        console.log(`Team ${teamId} completed round 2. Members: ${updatedTeam.members.length}`);
      } else {
        team.resubmissions += 1;
        await team.save();

        await SessionLog.create({
          teamId,
          socketId: socket.id,
          eventType: 'submit_decryption_failed',
          eventData: { submittedValue: decryptedValue, correctValue: team.plaintextDecimal }
        });

        socket.emit('decryption_result', {
          success: false,
          message: 'Incorrect decryption'
        });
      }
    } catch (error) {
      console.error('Error in submit_decryption:', error);
      socket.emit('error', { message: 'Failed to submit decryption', error: error.message });
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);

    try {
      if (socket.teamId) {
        const team = await Team.findOne({ teamId: socket.teamId });
        if (team) {
          const member = team.members.find(m => m.socketId === socket.id);
          if (member) {
            member.online = false;
            await team.save();
          }

          await SessionLog.create({
            teamId: socket.teamId,
            socketId: socket.id,
            eventType: 'disconnect',
            eventData: { memberCount: team.members.length }
          });

          socket.to(socket.teamId).emit('teammate_left', {
            socketId: socket.id,
            memberCount: team.members.filter(m => m.online).length
          });
        }
      }
    } catch (error) {
      console.error('Error in disconnect handler:', error);
    }

    activeConnections.delete(socket.id);
  });
});

// REST API endpoints

// Login endpoint - Generate JWT token
app.post('/api/auth/login', async (req, res) => {
  try {
    const { teamId, teamName } = req.body;

    if (!teamId || !teamName) {
      return res.status(400).json({ error: 'Missing teamId or teamName' });
    }

    // Check if team exists or create new team
    let team = await Team.findOne({ teamId });
    if (!team) {
      team = new Team({
        teamId,
        teamName,
        members: []
      });
      await team.save();
      console.log(`✓ New team created: ${teamId}`);
    }

    // Generate JWT token
    const token = generateToken(teamId, teamName);

    res.json({
      success: true,
      token,
      message: 'Authentication successful',
      teamId,
      teamName
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

// Get team leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find()
      .sort({ timeElapsed: 1, resubmissions: 1 })
      .limit(100);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get team state
app.get('/api/team/:teamId', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.user;
    
    // Verify that the user is requesting their own team data
    if (req.params.teamId !== teamId) {
      return res.status(403).json({ error: 'Unauthorized: Cannot access other team data' });
    }

    let team = await Team.findOne({ teamId: req.params.teamId });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.switchValues && Object.values(team.switchValues).some((value) => value === null)) {
      await assignTeamFromQueue(team.teamId);
      team = await Team.findOne({ teamId: req.params.teamId });
    }

    const member = team.members.find((m) => m.socketId === req.user.socketId) || null;
    res.json({
      teamId: team.teamId,
      teamName: team.teamName,
      ciphertext: team.ciphertext,
      assignedNumber: team.assignedNumber,
      encryptionValue: team.encryptionValue,
      resubmissions: team.resubmissions,
      completionTime: team.completionTime,
      ...buildTeamState(team, member)
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Get all teams
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find().select('teamId teamName round round1Complete round2Complete');
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Get session logs for a team
app.get('/api/team/:teamId/logs', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.user;
    
    // Verify that the user is requesting their own team logs
    if (req.params.teamId !== teamId) {
      return res.status(403).json({ error: 'Unauthorized: Cannot access other team logs' });
    }

    const logs = await SessionLog.find({ teamId: req.params.teamId }).sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get lookup table
app.get('/api/lookup-table', (req, res) => {
  try {
    res.json(ROUND1_LOOKUP_TABLE);
  } catch (error) {
    console.error('Error fetching lookup table:', error);
    res.status(500).json({ error: 'Failed to fetch lookup table' });
  }
});

// Get assignment queue status
app.get('/api/queue/status', authMiddleware, async (req, res) => {
  try {
    const totalTeams = await Team.countDocuments();
    const assignedTeams = await AssignmentQueue.countDocuments({ completed: true });
    const pendingTeams = await AssignmentQueue.countDocuments({ completed: false });

    res.json({
      totalTeams,
      assignedTeams,
      pendingTeams,
      lookupTableSize: ROUND1_LOOKUP_TABLE.length
    });
  } catch (error) {
    console.error('Error fetching queue status:', error);
    res.status(500).json({ error: 'Failed to fetch queue status' });
  }
});

// Get all teams with their assignments
app.get('/api/queue/assignments', authMiddleware, async (req, res) => {
  try {
    const assignments = await AssignmentQueue.find()
      .populate('teamId')
      .sort({ position: 1 })
      .limit(100);

    const teamsData = await Promise.all(
      assignments.map(async (assignment) => {
        const team = await Team.findOne({ teamId: assignment.teamId });
        return {
          position: assignment.position,
          teamId: team.teamId,
          teamName: team.teamName,
          switchValues: team.switchValues,
          key4bit: team.key4bit,
          round1Complete: team.round1Complete
        };
      })
    );

    res.json(teamsData);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});


// Assign a specific team (admin endpoint)
app.post('/api/queue/assign/:teamId', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await Team.findOne({ teamId });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.switchValues.S0 !== null) {
      return res.status(400).json({ error: 'Team already assigned' });
    }

    const assignment = await assignTeamFromQueue(teamId);

    res.json({
      success: true,
      message: 'Team assigned',
      assignment
    });
  } catch (error) {
    console.error('Error assigning team:', error);
    res.status(500).json({ error: 'Failed to assign team', message: error.message });
  }
});

// Reset queue (admin endpoint)
app.post('/api/queue/reset', authMiddleware, async (req, res) => {
  try {
    await AssignmentQueue.deleteMany({});
    await Team.updateMany(
      {},
      {
        $set: {
          switchValues: { S0: null, S1: null, S2: null, S3: null },
          key4bit: '',
          key8bit: '',
          queuePosition: null,
          round: 1,
          round1Complete: false,
          assignedNumber: null,
          xorValue: null,
          encryptionValue: null
        }
      }
    );

    res.json({
      success: true,
      message: 'Queue reset successfully'
    });
  } catch (error) {
    console.error('Error resetting queue:', error);
    res.status(500).json({ error: 'Failed to reset queue' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongoConnected: mongoose.connection.readyState === 1,
    activeConnections: activeConnections.size
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   CIPHERCIRCUIT BACKEND SERVER             ║
║   MongoDB + WebSocket Server Running       ║
║   Port: ${PORT}                               ║
║   Status: Ready for connections            ║
╚════════════════════════════════════════════╝
  `);
});

module.exports = { app, httpServer };

