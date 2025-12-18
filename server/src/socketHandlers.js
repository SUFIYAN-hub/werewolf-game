const { GameRoom, generateRoomCode } = require("./gameLogic");

// ✅ FIX 1: Store timers globally to prevent duplicates
const activeTimers = new Map();

function handleSocketConnection(socket, io) {
  // Create a new room
  socket.on("create_room", (data) => {
    const { playerName, location } = data;
    const roomCode = generateRoomCode();

    const room = new GameRoom(roomCode, playerName);
    room.addPlayer(socket.id, playerName, location);

    global.gameRooms.set(roomCode, room);
    socket.join(roomCode);

    socket.emit("room_created", {
      roomCode,
      player: room.players[0],
    });

    io.to(roomCode).emit("room_update", room.getPublicState(socket.id));
    console.log(`Room ${roomCode} created by ${playerName}`);
  });

  // Join existing room
  socket.on("join_room", (data) => {
    const { roomCode, playerName, location } = data;
    const room = global.gameRooms.get(roomCode);

    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    if (room.gameStarted) {
      socket.emit("error", { message: "Game already started" });
      return;
    }

    const player = room.addPlayer(socket.id, playerName, location);
    socket.join(roomCode);

    socket.emit("room_joined", { roomCode, player });
    
    // Send personalized state to each player
    room.players.forEach((player) => {
      io.to(player.id).emit("room_update", room.getPublicState(player.id));
    });

    console.log(`${playerName} joined room ${roomCode}`);
  });

  // Start game
  socket.on("start_game", (data) => {
    const { roomCode } = data;
    const room = global.gameRooms.get(roomCode);

    if (!room) return;

    const host = room.players.find((p) => p.isHost);
    if (host?.id !== socket.id) {
      socket.emit("error", { message: "Only host can start game" });
      return;
    }

    if (room.players.length < 5) {
      socket.emit("error", { message: "Need at least 5 players" });
      return;
    }

    try {
      room.assignRoles();
      room.gameStarted = true;
      room.startNightPhase();

      // Send role info to each player privately
      room.players.forEach((player) => {
        io.to(player.id).emit("role_assigned", {
          role: player.role,
          gameState: room.getPublicState(player.id),
        });
      });

      startTimer(roomCode, io);
      console.log(`Game started in room ${roomCode}`);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // Night actions
  socket.on('night_action', (data) => {
    const { roomCode, action, targetId } = data;
    const room = global.gameRooms.get(roomCode);
    
    if (!room || room.phase !== 'night') return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player || !player.isAlive) return;
    
    // Werewolf kill
    if (action === 'werewolf_kill' && player.role === 'werewolf') {
      room.nightActions.werewolfTarget = targetId;
      player.hasActed = true;
      
      // Notify ALL werewolves about the target selection
      room.players.forEach(p => {
        io.to(p.id).emit('game_update', room.getPublicState(p.id));
      });
      return;
    } 
    // Doctor heal
    else if (action === 'doctor_heal' && player.role === 'doctor') {
      room.nightActions.doctorTarget = targetId;
      player.hasActed = true;
    } 
    // ✅ FIX 2: Seer check - Send result immediately
    else if (action === 'seer_check' && player.role === 'seer') {
      room.nightActions.seerTarget = targetId;
      player.hasActed = true;
      
      // Send investigation result to seer immediately
      const target = room.players.find(p => p.id === targetId);
      if (target) {
        const isWerewolf = target.role === 'werewolf';
        io.to(socket.id).emit('seer_result', {
          targetName: target.name,
          targetId: target.id,
          isWerewolf: isWerewolf,
          message: isWerewolf 
            ? `${target.name} is a WEREWOLF! 🐺` 
            : `${target.name} is NOT a werewolf. ✅`
        });
      }
    }
    // Witch save (life potion)
    else if (action === 'witch_save' && player.role === 'witch') {
      if (!player.usedLifePotion) {
        room.nightActions.witchSave = targetId;
        player.usedLifePotion = true;
        player.hasActed = true;
      }
    }
    // Witch kill (death potion)
    else if (action === 'witch_kill' && player.role === 'witch') {
      if (!player.usedDeathPotion) {
        room.nightActions.witchKill = targetId;
        player.usedDeathPotion = true;
        player.hasActed = true;
      }
    }
    // Witch do nothing
    else if (action === 'witch_nothing' && player.role === 'witch') {
      player.hasActed = true;
    }
    // Detective check
    else if (action === 'detective_check' && player.role === 'detective') {
      if (!player.hasUsedAbility) {
        room.nightActions.detectiveCheck = {
          player1: data.targetId.player1,
          player2: data.targetId.player2
        };
        player.hasUsedAbility = true;
        player.hasActed = true;
      }
    }
    
    io.to(roomCode).emit('game_update', room.getPublicState(socket.id));
  });

  // Hunter revenge handler
  socket.on('hunter_revenge', (data) => {
    const { roomCode, targetId } = data;
    const room = global.gameRooms.get(roomCode);
    
    if (!room) return;
    
    const hunter = room.players.find(p => p.id === socket.id);
    if (!hunter || hunter.role !== 'hunter' || hunter.isAlive) return;
    
    // Process hunter's revenge
    room.processHunterRevenge(socket.id, targetId);
    
    // Check win condition after revenge
    const winner = room.checkWinCondition();
    
    // Update all players
    room.players.forEach(player => {
      io.to(player.id).emit('game_update', room.getPublicState(player.id));
    });
    
    // Clear hunter revenge flag
    room.nightActions.hunterRevenge = null;
  });

  // Day chat message
  socket.on("send_message", (data) => {
    const { roomCode, message } = data;
    const room = global.gameRooms.get(roomCode);

    if (!room || room.phase !== "day") return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || !player.isAlive) return;

    room.gameLog.push({
      type: "chat",
      player: player.name,
      message,
      timestamp: Date.now(),
    });

    io.to(roomCode).emit("game_update", room.getPublicState(socket.id));
  });

  // Accusation
  socket.on("accuse_player", (data) => {
    const { roomCode, targetId } = data;
    const room = global.gameRooms.get(roomCode);

    if (!room || room.phase !== "day") return;

    const accuser = room.players.find((p) => p.id === socket.id);
    const target = room.players.find((p) => p.id === targetId);

    if (!accuser || !target || !accuser.isAlive || !target.isAlive) return;

    room.dayActions.accusations.push({
      accuser: accuser.name,
      accuserId: accuser.id,
      target: target.name,
      targetId: target.id,
      timestamp: Date.now(),
    });

    room.gameLog.push({
      type: "accusation",
      message: `${accuser.name} accused ${target.name}`,
      timestamp: Date.now(),
    });

    io.to(roomCode).emit("game_update", room.getPublicState(socket.id));
  });

  // Second accusation (starts voting)
  socket.on("second_accusation", (data) => {
    const { roomCode, targetId } = data;
    const room = global.gameRooms.get(roomCode);

    if (!room || room.phase !== "day") return;

    room.startVotingPhase(targetId);
    io.to(roomCode).emit("game_update", room.getPublicState(socket.id));

    startTimer(roomCode, io);
  });

  // Vote
  socket.on("cast_vote", (data) => {
    const { roomCode, vote } = data;
    const room = global.gameRooms.get(roomCode);

    if (!room || room.phase !== "voting") return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player || !player.isAlive) return;

    room.dayActions.votes[socket.id] = vote;
    io.to(roomCode).emit("game_update", room.getPublicState(socket.id));
  });

  // Prayer pause
  socket.on("prayer_pause", (data) => {
    const { roomCode, paused } = data;
    const room = global.gameRooms.get(roomCode);

    if (!room) return;

    room.prayerPaused = paused;
    io.to(roomCode).emit("prayer_pause_update", { paused });
  });

  // ✅ FIX 3: Better disconnect handling
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    // Find and remove player from their room
    for (const [roomCode, room] of global.gameRooms.entries()) {
      const player = room.players.find((p) => p.id === socket.id);
      if (player) {
        console.log(`Player ${player.name} disconnected from room ${roomCode}`);
        
        // If game hasn't started, just remove the player
        if (!room.gameStarted) {
          room.removePlayer(socket.id);
          
          if (room.players.length === 0) {
            // Clear timer if room is empty
            clearTimer(roomCode);
            global.gameRooms.delete(roomCode);
            console.log(`Room ${roomCode} deleted (empty)`);
          } else {
            // Update remaining players
            room.players.forEach(p => {
              io.to(p.id).emit('room_update', room.getPublicState(p.id));
            });
          }
        } else {
          // Game is in progress - mark player as disconnected but don't remove
          player.isConnected = false;
          
          room.gameLog.push({
            type: "system",
            message: `${player.name} disconnected`,
            timestamp: Date.now(),
          });
          
          // Update all players
          room.players.forEach(p => {
            io.to(p.id).emit('game_update', room.getPublicState(p.id));
          });
          
          // Check if all players disconnected
          const connectedPlayers = room.players.filter(p => p.isConnected !== false);
          if (connectedPlayers.length === 0) {
            clearTimer(roomCode);
            global.gameRooms.delete(roomCode);
            console.log(`Room ${roomCode} deleted (all players disconnected)`);
          }
        }
        break;
      }
    }
  });
}

// ✅ FIX 1: Improved timer management with proper cleanup
function startTimer(roomCode, io) {
  // Clear any existing timer for this room
  clearTimer(roomCode);
  
  const room = global.gameRooms.get(roomCode);
  if (!room) return;

  const interval = setInterval(() => {
    // Check if room still exists
    const currentRoom = global.gameRooms.get(roomCode);
    if (!currentRoom) {
      clearInterval(interval);
      activeTimers.delete(roomCode);
      return;
    }

    // Pause for prayer
    if (currentRoom.prayerPaused) return;

    currentRoom.timer--;

    if (currentRoom.timer <= 0) {
      clearInterval(interval);
      activeTimers.delete(roomCode);
      handlePhaseEnd(roomCode, io);
    } else {
      // Update players every second for smooth countdown
      currentRoom.players.forEach((player) => {
        io.to(player.id).emit("game_update", currentRoom.getPublicState(player.id));
      });
    }
  }, 1000);

  // Store the interval
  activeTimers.set(roomCode, interval);
}

function clearTimer(roomCode) {
  const interval = activeTimers.get(roomCode);
  if (interval) {
    clearInterval(interval);
    activeTimers.delete(roomCode);
    console.log(`Timer cleared for room ${roomCode}`);
  }
}

function handlePhaseEnd(roomCode, io) {
  const room = global.gameRooms.get(roomCode);
  if (!room) return;

  if (room.phase === 'night') {
    const nightResult = room.processNightActions();
    
    // Check if hunter was killed during night
    if (room.nightActions.hunterRevenge) {
      const hunterId = room.nightActions.hunterRevenge;
      io.to(hunterId).emit('hunter_revenge_prompt');
      return;
    }
    
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
  } else if (room.phase === "day") {
    room.startNightPhase();
    room.players.forEach((player) => {
      io.to(player.id).emit("game_update", room.getPublicState(player.id));
    });
    startTimer(roomCode, io);
  } else if (room.phase === 'voting') {
    room.processVoting();
    
    // Check if hunter was eliminated
    if (room.nightActions.hunterRevenge) {
      const hunterId = room.nightActions.hunterRevenge;
      io.to(hunterId).emit('hunter_revenge_prompt');
      return;
    }
    
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