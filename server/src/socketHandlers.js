const { GameRoom, generateRoomCode } = require('./gameLogic');

function handleSocketConnection(socket, io) {
  
  // Create a new room
  socket.on('create_room', (data) => {
    const { playerName, location } = data;
    const roomCode = generateRoomCode();
    
    const room = new GameRoom(roomCode, playerName);
    room.addPlayer(socket.id, playerName, location);
    
    global.gameRooms.set(roomCode, room);
    socket.join(roomCode);
    
    socket.emit('room_created', {
      roomCode,
      player: room.players[0]
    });
    
    io.to(roomCode).emit('room_update', room.getPublicState(socket.id));
    console.log(`Room ${roomCode} created by ${playerName}`);
  });

  // Join existing room
  socket.on('join_room', (data) => {
    const { roomCode, playerName, location } = data;
    const room = global.gameRooms.get(roomCode);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    if (room.gameStarted) {
      socket.emit('error', { message: 'Game already started' });
      return;
    }
    
    const player = room.addPlayer(socket.id, playerName, location);
    socket.join(roomCode);
    
    socket.emit('room_joined', { roomCode, player });
    io.to(roomCode).emit('room_update', room.getPublicState(socket.id));
    
    console.log(`${playerName} joined room ${roomCode}`);
  });

  // Start game
  socket.on('start_game', (data) => {
    const { roomCode } = data;
    const room = global.gameRooms.get(roomCode);
    
    if (!room) return;
    
    const host = room.players.find(p => p.isHost);
    if (host?.id !== socket.id) {
      socket.emit('error', { message: 'Only host can start game' });
      return;
    }
    
    if (room.players.length < 5) {
      socket.emit('error', { message: 'Need at least 5 players' });
      return;
    }
    
    try {
      room.assignRoles();
      room.gameStarted = true;
      room.startNightPhase();
      
      // Send role info to each player privately
      room.players.forEach(player => {
        io.to(player.id).emit('role_assigned', {
          role: player.role,
          gameState: room.getPublicState(player.id)
        });
      });
      
      startTimer(roomCode, io);
      console.log(`Game started in room ${roomCode}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Night actions
  socket.on('night_action', (data) => {
    const { roomCode, action, targetId } = data;
    const room = global.gameRooms.get(roomCode);
    
    if (!room || room.phase !== 'night') return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player || !player.isAlive) return;
    
    if (action === 'werewolf_kill' && player.role === 'werewolf') {
      room.nightActions.werewolfTarget = targetId;
      player.hasActed = true;
    } else if (action === 'doctor_heal' && player.role === 'doctor') {
      room.nightActions.doctorTarget = targetId;
      player.hasActed = true;
    } else if (action === 'seer_check' && player.role === 'seer') {
      room.nightActions.seerTarget = targetId;
      player.hasActed = true;
    }
    
    io.to(roomCode).emit('game_update', room.getPublicState(socket.id));
  });

  // Day chat message
  socket.on('send_message', (data) => {
    const { roomCode, message } = data;
    const room = global.gameRooms.get(roomCode);
    
    if (!room || room.phase !== 'day') return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player || !player.isAlive) return;
    
    room.gameLog.push({
      type: 'chat',
      player: player.name,
      message,
      timestamp: Date.now()
    });
    
    io.to(roomCode).emit('game_update', room.getPublicState(socket.id));
  });

  // Accusation
  socket.on('accuse_player', (data) => {
    const { roomCode, targetId } = data;
    const room = global.gameRooms.get(roomCode);
    
    if (!room || room.phase !== 'day') return;
    
    const accuser = room.players.find(p => p.id === socket.id);
    const target = room.players.find(p => p.id === targetId);
    
    if (!accuser || !target || !accuser.isAlive || !target.isAlive) return;
    
    room.dayActions.accusations.push({
      accuser: accuser.name,
      accuserId: accuser.id,
      target: target.name,
      targetId: target.id,
      timestamp: Date.now()
    });
    
    room.gameLog.push({
      type: 'accusation',
      message: `${accuser.name} accused ${target.name}`,
      timestamp: Date.now()
    });
    
    io.to(roomCode).emit('game_update', room.getPublicState(socket.id));
  });

  // Second accusation (starts voting)
  socket.on('second_accusation', (data) => {
    const { roomCode, targetId } = data;
    const room = global.gameRooms.get(roomCode);
    
    if (!room || room.phase !== 'day') return;
    
    room.startVotingPhase(targetId);
    io.to(roomCode).emit('game_update', room.getPublicState(socket.id));
    
    startTimer(roomCode, io);
  });

  // Vote
  socket.on('cast_vote', (data) => {
    const { roomCode, vote } = data; // vote: true (guilty) or false (innocent)
    const room = global.gameRooms.get(roomCode);
    
    if (!room || room.phase !== 'voting') return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player || !player.isAlive) return;
    
    room.dayActions.votes[socket.id] = vote;
    io.to(roomCode).emit('game_update', room.getPublicState(socket.id));
  });

  // Prayer pause
  socket.on('prayer_pause', (data) => {
    const { roomCode, paused } = data;
    const room = global.gameRooms.get(roomCode);
    
    if (!room) return;
    
    room.prayerPaused = paused;
    io.to(roomCode).emit('prayer_pause_update', { paused });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Find and remove player from their room
    for (const [roomCode, room] of global.gameRooms.entries()) {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        room.removePlayer(socket.id);
        
        if (room.players.length === 0) {
          global.gameRooms.delete(roomCode);
          console.log(`Room ${roomCode} deleted`);
        } else {
          io.to(roomCode).emit('room_update', room.getPublicState(room.players[0].id));
        }
        break;
      }
    }
  });
}

// Timer management
function startTimer(roomCode, io) {
  const room = global.gameRooms.get(roomCode);
  if (!room) return;
  
  const interval = setInterval(() => {
    if (room.prayerPaused) return;
    
    room.timer--;
    
    if (room.timer <= 0) {
      clearInterval(interval);
      handlePhaseEnd(roomCode, io);
    } else if (room.timer % 5 === 0) {
      // Update every 5 seconds
      room.players.forEach(player => {
        io.to(player.id).emit('game_update', room.getPublicState(player.id));
      });
    }
  }, 1000);
}

function handlePhaseEnd(roomCode, io) {
  const room = global.gameRooms.get(roomCode);
  if (!room) return;
  
  if (room.phase === 'night') {
    const nightResult = room.processNightActions();
    room.startDayPhase();
    
    room.players.forEach(player => {
      io.to(player.id).emit('night_result', {
        ...nightResult,
        gameState: room.getPublicState(player.id)
      });
    });
    
    const winner = room.checkWinCondition();
    if (!winner) {
      startTimer(roomCode, io);
    }
  } else if (room.phase === 'day') {
    // Day ends, skip to night if no voting started
    room.startNightPhase();
    room.players.forEach(player => {
      io.to(player.id).emit('game_update', room.getPublicState(player.id));
    });
    startTimer(roomCode, io);
  } else if (room.phase === 'voting') {
    room.processVoting();
    
    const winner = room.checkWinCondition();
    
    room.players.forEach(player => {
      io.to(player.id).emit('game_update', room.getPublicState(player.id));
    });
    
    if (!winner) {
      room.startNightPhase();
      startTimer(roomCode, io);
    }
  }
}

module.exports = { handleSocketConnection };