import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface TeamState {
  round: number;
  key4bit: string;
  key8bit: string;
  round1Complete: boolean;
  round2Complete: boolean;
  switchValues: { S0: number; S1: number; S2: number; S3: number };
  ciphertext: string;
  memberCount: number;
  teammateOnline: boolean;
  role?: 'encrypt' | 'decrypt' | null;
  teammateRole?: 'encrypt' | 'decrypt' | null;
  assignedNumber?: number | null;
  encryptionValue?: number | null;
}

interface Round1Result {
  success: boolean;
  message: string;
  waitingForTeammate?: boolean;
  key8bit?: string;
  correctKey?: string;
}

export const useSocket = (teamId: string | null, role?: 'encrypt' | 'decrypt' | null) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [teamState, setTeamState] = useState<TeamState | null>(null);
  const [round1Result, setRound1Result] = useState<Round1Result | null>(null);

  useEffect(() => {
    if (!teamId) return;

    // Get JWT token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    // Connect to WebSocket server with JWT token
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(apiUrl, {
      auth: {
        token: token
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setConnected(true);

      // Join team room
      const teamName = localStorage.getItem('teamName');
      socket.emit('join_team', { teamId, teamName, role: role || null });
    });

    socket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error.message);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setConnected(false);
    });

    socket.on('team_state', (state: TeamState) => {
      console.log('Team state updated:', state);
      setTeamState(state);
      localStorage.setItem('teamState', JSON.stringify(state));
    });

    socket.on('teammate_joined', ({ memberCount }) => {
      console.log('Teammate joined. Total members:', memberCount);
      setTeamState((prev) =>
        prev ? { ...prev, memberCount, teammateOnline: memberCount > 1 } : prev
      );
    });

    socket.on('teammate_left', ({ memberCount }) => {
      console.log('Teammate left. Total members:', memberCount);
      setTeamState((prev) =>
        prev ? { ...prev, memberCount, teammateOnline: memberCount > 1 } : prev
      );
    });

    socket.on('ciphertext_received', ({ ciphertext }) => {
      console.log('Ciphertext received:', ciphertext);
      localStorage.setItem('ciphertext', ciphertext);
    });

    socket.on('competition_complete', ({ timeElapsed, resubmissions }) => {
      console.log('Competition complete!', { timeElapsed, resubmissions });
      if (typeof window !== 'undefined') {
        window.location.href = '/round2/result';
      }
    });

    socket.on('round1_result', (result: Round1Result) => {
      setRound1Result(result);
      console.log('Round 1 result:', round1Result);
    });

    return () => {
      socket.disconnect();
    };
  }, [teamId, role]);

  // Re-emit role update when role changes after initial connection
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && role && teamId) {
      const teamName = localStorage.getItem('teamName');
      socketRef.current.emit('join_team', { teamId, teamName, role });
      console.log('Role updated:', role);
    }
  }, [role, teamId]);

  const submitRound1Key = (key: string) => {
    if (socketRef.current && teamId) {
      socketRef.current.emit('submit_round1_key', { teamId, key });
    }
  };

  const submitEncryption = (ciphertext: string, plaintext: string) => {
    if (socketRef.current && teamId) {
      socketRef.current.emit('submit_encryption', { teamId, ciphertext, plaintext });
    }
  };

  const submitDecryption = (decryptedValue: string) => {
    if (socketRef.current && teamId) {
      socketRef.current.emit('submit_decryption', { teamId, decryptedValue });
    }
  };

  return {
    connected,
    teamState,
    round1Result,
    submitRound1Key,
    submitEncryption,
    submitDecryption,
    socket: socketRef.current
  };
};
