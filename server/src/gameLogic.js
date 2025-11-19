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
      seerResult: null
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

  assignRoles() {
    const numPlayers = this.players.length;
    
    if (numPlayers < 5) {
      throw new Error('Need at least 5 players');
    }

    // Calculate roles based on player count
    const numWerewolves = Math.floor(numPlayers / 4) + 1;
    
    const roles = ['seer', 'doctor'];
    for (let i = 0; i < numWerewolves; i++) {
      roles.push('werewolf');
    }
    while (roles.length < numPlayers) {
      roles.push('villager');
    }

    // Shuffle roles
    const shuffledRoles = roles.sort(() => Math.random() - 0.5);
    
    // Assign to players
    this.players.forEach((player, index) => {
      player.role = shuffledRoles[index];
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
    const { werewolfTarget, doctorTarget, seerTarget } = this.nightActions;
    
    let victim = werewolfTarget;
    let saved = false;

    // Check if doctor saved the victim
    if (victim && doctorTarget === victim) {
      saved = true;
      victim = null;
    }

    // Eliminate victim if not saved
    if (victim) {
      const player = this.players.find(p => p.id === victim);
      if (player) {
        player.isAlive = false;
        this.eliminated.push(player.name);
        this.gameLog.push({
          type: 'elimination',
          message: `${player.name} was eliminated during the night`,
          victim: player.name,
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

    return { victim, saved };
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
        this.gameLog.push({
          type: 'elimination',
          message: `${target.name} (${target.role}) was voted out by the village`,
          victim: target.name,
          role: target.role,
          timestamp: Date.now()
        });
      }
    } else {
      this.gameLog.push({
        type: 'vote_failed',
        message: 'The village could not reach a decision',
        timestamp: Date.now()
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
    
    // Show current werewolf target if any
    if (this.nightActions.werewolfTarget) {
      const target = this.players.find(p => p.id === this.nightActions.werewolfTarget);
      nightInfo.werewolfTarget = target ? target.name : null;
    }
  }

  // Seer result
  if (player.role === 'seer' && this.nightActions.seerResult) {
    nightInfo.seerResult = this.nightActions.seerResult;
  }

  return Object.keys(nightInfo).length > 0 ? nightInfo : null;
}
}

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = { GameRoom, generateRoomCode };