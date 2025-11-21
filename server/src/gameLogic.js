class GameRoom {
  constructor(roomCode, hostName) {
    this.roomCode = roomCode;
    this.players = [];
    this.gameStarted = false;
    this.phase = 'waiting'; // waiting, night, day, voting, gameOver
    this.roundNumber = 1;
    this.timer = 0;
    this.eliminated = [];
    this.nightActions = {
  werewolfTarget: null,
  doctorTarget: null,
  seerTarget: null,
  seerResult: null,
  witchSave: null,        // NEW: Witch life potion
  witchKill: null,        // NEW: Witch death potion
  hunterRevenge: null,    // NEW: Hunter's dying shot
  detectiveCheck: null,   // NEW: Detective's team check
  detectiveResult: null   // NEW: Detective's result
};
    this.dayActions = {
      accusations: [],
      votes: {},
      votingTarget: null
    };
    this.gameLog = [];
    this.prayerPaused = false;
  }

  addPlayer(socketId, playerName, location) {
    const player = {
      id: socketId,
      name: playerName,
      location: location,
      role: null,
      isAlive: true,
      isHost: this.players.length === 0,
      hasActed: false
    };
    this.players.push(player);
    return player;
  }

  removePlayer(socketId) {
    this.players = this.players.filter(p => p.id !== socketId);
    if (this.players.length > 0 && !this.players.some(p => p.isHost)) {
      this.players[0].isHost = true;
    }
  }

  // assignRoles() {
  //   const numPlayers = this.players.length;
    
  //   if (numPlayers < 5) {
  //     throw new Error('Need at least 5 players');
  //   }

  //   // Calculate roles based on player count
  //   const numWerewolves = Math.floor(numPlayers / 4) + 1;
    
  //   const roles = ['seer', 'doctor'];
  //   for (let i = 0; i < numWerewolves; i++) {
  //     roles.push('werewolf');
  //   }
  //   while (roles.length < numPlayers) {
  //     roles.push('villager');
  //   }

  //   // Shuffle roles
  //   const shuffledRoles = roles.sort(() => Math.random() - 0.5);
    
  //   // Assign to players
  //   this.players.forEach((player, index) => {
  //     player.role = shuffledRoles[index];
  //   });

  //   this.gameLog.push({
  //     type: 'game_start',
  //     message: 'Game has started! Night falls...',
  //     timestamp: Date.now()
  //   });
  // }
  assignRoles() {
  const numPlayers = this.players.length;
  
  if (numPlayers < 5) {
    throw new Error('Need at least 5 players');
  }

  // Calculate number of werewolves based on player count
  const numWerewolves = Math.floor(numPlayers / 4) + 1;
  
  // Base roles that always exist
  const roles = ['seer', 'doctor'];
  
  // Add werewolves
  for (let i = 0; i < numWerewolves; i++) {
    roles.push('werewolf');
  }
  
  // Add new special roles based on player count
if (numPlayers >= 6) {
  roles.push('witch');  // ✅ Witch at 6 players
}
if (numPlayers >= 7) {
  roles.push('hunter');  // ✅ Hunter at 7 players
}
if (numPlayers >= 8) {
  roles.push('detective');  // ✅ Detective at 8 players
}
  
  // Fill remaining with villagers
  while (roles.length < numPlayers) {
    roles.push('villager');
  }

  // Shuffle roles
  const shuffledRoles = roles.sort(() => Math.random() - 0.5);
  
  // Assign to players
  this.players.forEach((player, index) => {
    player.role = shuffledRoles[index];
    player.hasUsedAbility = false; // Track if special ability used (for Detective, Witch)
  });

  this.gameLog.push({
    type: 'game_start',
    message: 'Game has started! Night falls...',
    timestamp: Date.now()
  });
}

  startNightPhase() {
    this.phase = 'night';
    this.timer = 60; // 60 seconds for night
    this.nightActions = {
      werewolfTarget: null,
      doctorTarget: null,
      seerTarget: null,
      seerResult: null
    };
    
    // Reset hasActed for all players
    this.players.forEach(p => p.hasActed = false);

    this.gameLog.push({
      type: 'phase_change',
      message: `Night ${this.roundNumber} begins...`,
      timestamp: Date.now()
    });
  }

  processNightActions() {
  const { werewolfTarget, doctorTarget, seerTarget, witchSave, witchKill } = this.nightActions;
  
  let victim = werewolfTarget;
  let saved = false;
  let witchSaved = false;
  let witchKilled = null;

  // Check if witch saved the victim
  if (victim && witchSave === victim) {
    witchSaved = true;
    saved = true;
    victim = null;
  }
  
  // Check if doctor saved the victim (only if witch didn't)
  if (victim && doctorTarget === victim && !witchSaved) {
    saved = true;
    victim = null;
  }

  // Process werewolf kill (if not saved)
  if (victim) {
    const player = this.players.find(p => p.id === victim);
    if (player) {
      player.isAlive = false;
      this.eliminated.push(player.name);
      
      // Check if killed player is Hunter
      if (player.role === 'hunter') {
        this.nightActions.hunterRevenge = victim; // Mark hunter for revenge
      }
      
      this.gameLog.push({
        type: 'elimination',
        message: `${player.name} was eliminated during the night`,
        victim: player.name,
        timestamp: Date.now()
      });
    }
  }

  // Process witch's death potion
  if (witchKill) {
    const poisonedPlayer = this.players.find(p => p.id === witchKill);
    if (poisonedPlayer && poisonedPlayer.isAlive) {
      poisonedPlayer.isAlive = false;
      this.eliminated.push(poisonedPlayer.name);
      
      // Check if poisoned player is Hunter
      if (poisonedPlayer.role === 'hunter') {
        this.nightActions.hunterRevenge = witchKill;
      }
      
      this.gameLog.push({
        type: 'elimination',
        message: `${poisonedPlayer.name} was poisoned by the Witch`,
        victim: poisonedPlayer.name,
        timestamp: Date.now()
      });
    }
  }

  // Process seer's vision
  if (seerTarget) {
    const target = this.players.find(p => p.id === seerTarget);
    if (target) {
      this.nightActions.seerResult = {
        target: target.name,
        isWerewolf: target.role === 'werewolf'
      };
    }
  }

  // Process detective's check
  if (this.nightActions.detectiveCheck) {
    const { player1, player2 } = this.nightActions.detectiveCheck;
    const p1 = this.players.find(p => p.id === player1);
    const p2 = this.players.find(p => p.id === player2);
    
    if (p1 && p2) {
      const p1IsWerewolf = p1.role === 'werewolf';
      const p2IsWerewolf = p2.role === 'werewolf';
      const sameTeam = p1IsWerewolf === p2IsWerewolf;
      
      this.nightActions.detectiveResult = {
        player1Name: p1.name,
        player2Name: p2.name,
        sameTeam: sameTeam
      };
    }
  }

  return { victim, saved, witchSaved };
}

processHunterRevenge(hunterId, targetId) {
  const target = this.players.find(p => p.id === targetId);
  const hunter = this.players.find(p => p.id === hunterId);
  
  if (target && target.isAlive) {
    target.isAlive = false;
    this.eliminated.push(target.name);
    
    this.gameLog.push({
      type: 'elimination',
      message: `${target.name} was shot by ${hunter.name} the Hunter's dying shot`,
      victim: target.name,
      hunter: hunter.name,
      timestamp: Date.now()
    });
    
    return target;
  }
  
  return null;
}

  startDayPhase() {
    this.phase = 'day';
    this.timer = 300; // 5 minutes for discussion
    this.dayActions = {
      accusations: [],
      votes: {},
      votingTarget: null
    };

    this.gameLog.push({
      type: 'phase_change',
      message: `Day ${this.roundNumber} begins...`,
      timestamp: Date.now()
    });
  }

  startVotingPhase(targetId) {
    this.phase = 'voting';
    this.timer = 60; // 60 seconds to vote
    this.dayActions.votingTarget = targetId;
    this.dayActions.votes = {};

    const target = this.players.find(p => p.id === targetId);
    this.gameLog.push({
      type: 'voting_started',
      message: `Voting to eliminate ${target?.name}...`,
      timestamp: Date.now()
    });
  }

  processVoting() {
  const { votes, votingTarget } = this.dayActions;
  const totalVotes = Object.keys(votes).length;
  const yesVotes = Object.values(votes).filter(v => v === true).length;
  const alivePlayers = this.players.filter(p => p.isAlive).length;

  // Need majority to eliminate
  if (yesVotes > alivePlayers / 2) {
    const target = this.players.find(p => p.id === votingTarget);

    if (target) {
      target.isAlive = false;
      this.eliminated.push(target.name);

      // ⭐ NEW: Hunter special ability trigger
      if (target.role === "hunter") {
        this.nightActions.hunterRevenge = votingTarget; 
        // (The hunter will kill someone at night)
      }

      this.gameLog.push({
        type: "elimination",
        message: `${target.name} (${target.role}) was voted out by the village`,
        victim: target.name,
        role: target.role,
        timestamp: Date.now(),
      });
    }
  } else {
    this.gameLog.push({
      type: "vote_failed",
      message: "The village could not reach a decision",
      timestamp: Date.now(),
    });
  }

  this.roundNumber++;
}

  checkWinCondition() {
    const alivePlayers = this.players.filter(p => p.isAlive);
    const aliveWerewolves = alivePlayers.filter(p => p.role === 'werewolf');
    const aliveVillagers = alivePlayers.filter(p => p.role !== 'werewolf');

    if (aliveWerewolves.length === 0) {
      this.phase = 'gameOver';
      this.gameLog.push({
        type: 'game_over',
        winner: 'villagers',
        message: 'Villagers win! All werewolves have been eliminated!',
        timestamp: Date.now()
      });
      return 'villagers';
    }

    if (aliveWerewolves.length >= aliveVillagers.length) {
      this.phase = 'gameOver';
      this.gameLog.push({
        type: 'game_over',
        winner: 'werewolves',
        message: 'Werewolves win! They now control the village!',
        timestamp: Date.now()
      });
      return 'werewolves';
    }

    return null;
  }

  getPublicState(playerId) {
  const player = this.players.find(p => p.id === playerId);
  
  return {
    roomCode: this.roomCode,
    gameStarted: this.gameStarted,
    phase: this.phase,
    roundNumber: this.roundNumber,
    timer: this.timer,
    players: this.players.map(p => ({
      id: p.id,
      name: p.name,
      isAlive: p.isAlive,
      isHost: p.isHost,
      isMe: p.id === playerId, // FIX: Compare with current player's socket ID
      role: (p.id === playerId || !p.isAlive) ? p.role : null
    })),
    myRole: player?.role,
    eliminated: this.eliminated,
    gameLog: this.gameLog,
    prayerPaused: this.prayerPaused,
    nightInfo: this.getNightInfo(playerId),
    dayActions: this.phase === 'voting' ? this.dayActions : { accusations: this.dayActions.accusations }
  };
}

  // getNightInfo(playerId) {
  //   const player = this.players.find(p => p.id === playerId);
  //   if (!player || this.phase !== 'night') return null;

  //   if (player.role === 'seer' && this.nightActions.seerResult) {
  //     return { seerResult: this.nightActions.seerResult };
  //   }

  //   return null;
  // }
  getNightInfo(playerId) {
  const player = this.players.find(p => p.id === playerId);
  if (!player || this.phase !== 'night') return null;

  let nightInfo = {};

  // Werewolves can see other werewolves
  if (player.role === 'werewolf') {
    const otherWerewolves = this.players
      .filter(p => p.role === 'werewolf' && p.id !== playerId && p.isAlive)
      .map(p => ({ id: p.id, name: p.name }));
    
    nightInfo.werewolfTeam = otherWerewolves;
    
    if (this.nightActions.werewolfTarget) {
      const target = this.players.find(p => p.id === this.nightActions.werewolfTarget);
      nightInfo.werewolfTarget = target ? target.name : null;
    }
  }

  // Seer result
  if (player.role === 'seer' && this.nightActions.seerResult) {
    nightInfo.seerResult = this.nightActions.seerResult;
  }

  // NEW: Witch can see who was killed
  if (player.role === 'witch') {
    if (this.nightActions.werewolfTarget) {
      const victim = this.players.find(p => p.id === this.nightActions.werewolfTarget);
      nightInfo.werewolfVictim = victim ? victim.name : null;
    }
    nightInfo.hasLifePotion = !player.usedLifePotion;
    nightInfo.hasDeathPotion = !player.usedDeathPotion;
  }

  // NEW: Detective result
  if (player.role === 'detective' && this.nightActions.detectiveResult) {
    nightInfo.detectiveResult = this.nightActions.detectiveResult;
  }

  return Object.keys(nightInfo).length > 0 ? nightInfo : null;
}
}

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = { GameRoom, generateRoomCode };