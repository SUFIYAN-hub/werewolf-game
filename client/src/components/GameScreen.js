import React from 'react';
import { Moon, Sun, Users, MessageSquare, Pause, Play } from 'lucide-react';
import RoleCard from './RoleCard';
import PlayerList from './PlayerList';
import GameLog from './GameLog';
import NightPhase from './NightPhase';
import DayPhase from './DayPhase';
import VotingPhase from './VotingPhase';
import HunterRevenge from './HunterRevenge';

function GameScreen({ 
  roomCode, 
  gameState, 
  myRole, 
  playerName,
  onNightAction, 
  onSendMessage, 
  onAccusePlayer,
  onSecondAccusation,
  onCastVote,
  onTogglePrayerPause,
  onHunterRevenge 
}) {
  const [showHunterRevenge, setShowHunterRevenge] = useState(false);
  
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  const { phase, roundNumber, timer, prayerPaused, players } = gameState;
  const myPlayer = players?.find(p => p.isMe);
  const isAlive = myPlayer?.isAlive;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'night': return 'from-indigo-900 to-purple-900';
      case 'day': return 'from-yellow-700 to-orange-700';
      case 'voting': return 'from-red-700 to-pink-700';
      case 'gameOver': return 'from-gray-800 to-gray-900';
      default: return 'from-purple-900 to-pink-900';
    }
  };

  const getPhaseIcon = () => {
    switch (phase) {
      case 'night': return <Moon className="w-8 h-8" />;
      case 'day': return <Sun className="w-8 h-8" />;
      case 'voting': return <Users className="w-8 h-8" />;
      default: return <MessageSquare className="w-8 h-8" />;
    }
  };

return (
  <div className={`min-h-screen bg-gradient-to-br ${getPhaseColor()} transition-all duration-1000`}>
    
     {/* ✅ ADD HUNTER REVENGE OVERLAY */}
    {showHunterRevenge && myPlayer?.role === 'hunter' && !myPlayer?.isAlive && (
      <HunterRevenge
        gameState={gameState}
        onHunterRevenge={(targetId) => {
          onHunterRevenge(targetId);
          setShowHunterRevenge(false);
        }}
      />
    )}

    {/* Header */}
    <div className="bg-black/30 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          {/* Phase Info */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-white">
              {getPhaseIcon()}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white capitalize">
                {phase === 'gameOver' ? 'Game Over' : `${phase} Phase`}
              </h2>
              <p className="text-purple-200 text-xs sm:text-sm">Round {roundNumber}</p>
            </div>
          </div>

          {/* Timer and Controls - Responsive */}
          {phase !== 'gameOver' && (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              {prayerPaused && (
                <div className="bg-green-900/50 px-3 py-1 sm:px-4 sm:py-2 rounded-lg border border-green-500/50">
                  <p className="text-green-200 text-xs sm:text-sm">🕌 Prayer Paused</p>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {formatTime(timer)}
                </div>
                <p className="text-purple-200 text-xs">Time Left</p>
              </div>

              {/* Prayer Pause Button */}
              <button
                onClick={() => onTogglePrayerPause(!prayerPaused)}
                className={`p-2 sm:p-3 rounded-lg ${
                  prayerPaused 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                title={prayerPaused ? 'Resume Game' : 'Pause for Prayer'}
              >
                {prayerPaused ? <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white" />}
              </button>
            </div>
          )}

          {/* Room Code - Hidden on very small screens, shown on larger */}
          <div className="hidden sm:block text-right">
            <p className="text-purple-200 text-xs">Room Code</p>
            <p className="text-white font-bold text-base sm:text-lg">{roomCode}</p>
          </div>
          
          {/* Room Code - Visible only on small screens */}
          <div className="sm:hidden text-center w-full">
            <p className="text-purple-200 text-xs">Room: <span className="text-white font-bold">{roomCode}</span></p>
          </div>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        {/* Left Column - Role & Players */}
        <div className="space-y-3 sm:space-y-6">
          {/* Your Role Card */}
          <RoleCard role={myRole} isAlive={isAlive} />

          {/* Players List */}
          <PlayerList 
            players={players} 
            myPlayerId={myPlayer?.id}
            phase={phase}
          />
        </div>

        {/* Middle Column - Game Phase */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-6">
          {/* Dead Player Notice */}
          {!isAlive && (
            <div className="bg-gray-900/50 border-2 border-red-500 rounded-lg p-4 sm:p-6 text-center">
              <h3 className="text-red-400 text-xl sm:text-2xl font-bold mb-2">
                You Have Been Eliminated
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                You can still watch the game, but cannot participate
              </p>
            </div>
          )}

          {/* Phase Content */}
          {phase === 'night' && (
            <NightPhase
              gameState={gameState}
              myRole={myRole}
              isAlive={isAlive}
              onNightAction={onNightAction}
            />
          )}

          {phase === 'day' && (
            <DayPhase
              gameState={gameState}
              playerName={playerName}
              isAlive={isAlive}
              onSendMessage={onSendMessage}
              onAccusePlayer={onAccusePlayer}
              onSecondAccusation={onSecondAccusation}
            />
          )}

          {phase === 'voting' && (
            <VotingPhase
              gameState={gameState}
              isAlive={isAlive}
              onCastVote={onCastVote}
            />
          )}

          {phase === 'gameOver' && (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 sm:p-8 border border-white/20 text-center">
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
                {gameState.gameLog[gameState.gameLog.length - 1]?.message}
              </h2>
              <p className="text-purple-200 mb-4 sm:mb-6 text-sm sm:text-base">
                Thanks for playing! May Allah bless you all.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg text-sm sm:text-base"
              >
                Play Again
              </button>
            </div>
          )}

          {/* Game Log */}
          <GameLog gameLog={gameState.gameLog} />
        </div>
      </div>
    </div>
  </div>
);
}

export default GameScreen;