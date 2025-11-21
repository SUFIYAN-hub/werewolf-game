import React, { useState } from 'react';
import { Skull, AlertTriangle, Target } from 'lucide-react';

function HunterRevenge({ gameState, onHunterRevenge }) {
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const alivePlayers = gameState?.players?.filter(p => p.isAlive && !p.isMe) || [];

  const handleSubmit = () => {
    if (selectedTarget) {
      onHunterRevenge(selectedTarget);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
        <div className="bg-orange-900/50 border-2 border-orange-500 rounded-lg p-8 max-w-md text-center">
          <Skull className="w-16 h-16 text-orange-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-2xl font-bold text-white mb-2">Shot Fired!</h3>
          <p className="text-orange-200">
            Your dying shot has been recorded. They will fall with you...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <div className="bg-gradient-to-br from-orange-600 to-red-800 rounded-lg p-8 max-w-2xl w-full mx-4 border-4 border-orange-400 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4 animate-bounce">🏹</div>
          <h2 className="text-4xl font-bold text-white mb-2">HUNTER'S REVENGE!</h2>
          <p className="text-orange-200 text-lg">
            You have been eliminated, but you will not die alone!
          </p>
        </div>

        {/* Warning */}
        <div className="mb-6 bg-red-900/50 border-2 border-red-400 rounded-lg p-4">
          <AlertTriangle className="w-6 h-6 text-red-300 inline mr-2" />
          <span className="text-red-100 font-semibold">
            Choose ONE player to take with you as your dying shot!
          </span>
        </div>

        {/* Instructions */}
        <div className="mb-6 bg-orange-900/30 rounded-lg p-4 border border-orange-500/50">
          <h4 className="text-white font-semibold mb-2">⚡ Your Final Act:</h4>
          <p className="text-orange-100 text-sm">
            This is your moment! Choose carefully - take a werewolf if you can, 
            or eliminate someone suspicious. This could change the entire game!
          </p>
        </div>

        {/* Player Selection */}
        <div className="mb-6">
          <h4 className="text-white font-bold mb-4 text-lg flex items-center">
            <Target className="w-6 h-6 mr-2" />
            Select Your Target:
          </h4>
          
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
            {alivePlayers.length === 0 ? (
              <div className="text-center py-8 text-orange-200">
                <p>No players available to target</p>
              </div>
            ) : (
              alivePlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedTarget(player.id)}
                  className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                    selectedTarget === player.id
                      ? 'bg-red-600 border-white scale-105 shadow-lg'
                      : 'bg-orange-900/30 border-orange-500/50 hover:border-orange-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-700 flex items-center justify-center text-white font-bold text-lg">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold text-lg">{player.name}</p>
                        {player.isHost && (
                          <span className="text-yellow-400 text-xs">👑 Host</span>
                        )}
                      </div>
                    </div>
                    {selectedTarget === player.id && (
                      <div className="text-white text-3xl">🎯</div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedTarget}
          className={`w-full py-6 rounded-lg font-bold text-white text-xl transition-all transform ${
            selectedTarget
              ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 hover:scale-105 shadow-2xl'
              : 'bg-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          {selectedTarget ? (
            <>
              <Skull className="w-6 h-6 inline mr-2" />
              FIRE YOUR DYING SHOT!
            </>
          ) : (
            'Select a Target First'
          )}
        </button>

        {/* Countdown Timer (Optional) */}
        <div className="mt-4 text-center">
          <p className="text-orange-200 text-sm">
            ⏱️ Make your choice quickly - the game is waiting!
          </p>
        </div>
      </div>
    </div>
  );
}

export default HunterRevenge;