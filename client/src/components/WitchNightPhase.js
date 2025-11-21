import React, { useState } from 'react';
import { Heart, Skull, AlertCircle, Check } from 'lucide-react';

function WitchNightPhase({ gameState, onNightAction }) {
  const [action, setAction] = useState(null); // 'save' or 'kill'
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [actionSubmitted, setActionSubmitted] = useState(false);

  const alivePlayers = gameState?.players?.filter(p => p.isAlive) || [];
  const victim = gameState?.nightInfo?.werewolfVictim;
  const hasLifePotion = gameState?.nightInfo?.hasLifePotion;
  const hasDeathPotion = gameState?.nightInfo?.hasDeathPotion;

  const handleSubmit = () => {
    if (action === 'save' && victim) {
      onNightAction('witch_save', victim);
    } else if (action === 'kill' && selectedTarget) {
      onNightAction('witch_kill', selectedTarget);
    } else if (action === 'nothing') {
      onNightAction('witch_nothing', null);
    }
    setActionSubmitted(true);
  };

  if (actionSubmitted) {
    return (
      <div className="bg-purple-900/30 border-2 border-purple-500 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Check className="w-6 h-6 text-purple-400" />
          <div>
            <h4 className="text-white font-bold">Potions Used</h4>
            <p className="text-purple-200">Your choice has been recorded. Wait for dawn...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 border-2 border-purple-400 shadow-2xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="text-6xl">🧪</div>
          <div>
            <h3 className="text-2xl font-bold text-white">Witch's Choice</h3>
            <p className="text-purple-200 text-sm">Use your potions wisely</p>
          </div>
        </div>
      </div>

      {/* Show Victim */}
      {victim && (
        <div className="mb-6 bg-red-900/30 border-2 border-red-500 rounded-lg p-4">
          <h4 className="text-white font-bold mb-2">☠️ Tonight's Victim:</h4>
          <p className="text-red-200 text-lg font-semibold">{victim}</p>
        </div>
      )}

      {/* Potion Inventory */}
      <div className="mb-6 bg-purple-900/30 rounded-lg p-4 border border-purple-500/50">
        <h4 className="text-white font-semibold mb-3">Your Potions:</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-lg border-2 ${hasLifePotion ? 'bg-green-900/30 border-green-500' : 'bg-gray-700/30 border-gray-600'}`}>
            <div className="flex items-center space-x-2 mb-1">
              <Heart className={`w-5 h-5 ${hasLifePotion ? 'text-green-400' : 'text-gray-500'}`} />
              <span className={`font-semibold ${hasLifePotion ? 'text-green-200' : 'text-gray-400'}`}>
                Life Potion
              </span>
            </div>
            <p className={`text-xs ${hasLifePotion ? 'text-green-300' : 'text-gray-500'}`}>
              {hasLifePotion ? 'Available ✅' : 'Used ❌'}
            </p>
          </div>
          
          <div className={`p-3 rounded-lg border-2 ${hasDeathPotion ? 'bg-red-900/30 border-red-500' : 'bg-gray-700/30 border-gray-600'}`}>
            <div className="flex items-center space-x-2 mb-1">
              <Skull className={`w-5 h-5 ${hasDeathPotion ? 'text-red-400' : 'text-gray-500'}`} />
              <span className={`font-semibold ${hasDeathPotion ? 'text-red-200' : 'text-gray-400'}`}>
                Death Potion
              </span>
            </div>
            <p className={`text-xs ${hasDeathPotion ? 'text-red-300' : 'text-gray-500'}`}>
              {hasDeathPotion ? 'Available ✅' : 'Used ❌'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Selection */}
      {!action && (
        <div className="space-y-3">
          <h4 className="text-white font-semibold mb-3">Choose Your Action:</h4>
          
          {/* Save Victim */}
          {hasLifePotion && victim && (
            <button
              onClick={() => setAction('save')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg border-2 border-green-400 transition-all transform hover:scale-105"
            >
              <Heart className="w-6 h-6 inline mr-2" />
              Save {victim} with Life Potion
            </button>
          )}
          
          {/* Kill Someone */}
          {hasDeathPotion && (
            <button
              onClick={() => setAction('kill')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg border-2 border-red-400 transition-all transform hover:scale-105"
            >
              <Skull className="w-6 h-6 inline mr-2" />
              Use Death Potion on Someone
            </button>
          )}
          
          {/* Do Nothing */}
          <button
            onClick={() => setAction('nothing')}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 px-6 rounded-lg border border-purple-400"
          >
            <AlertCircle className="w-5 h-5 inline mr-2" />
            Do Nothing This Night
          </button>
        </div>
      )}

      {/* Kill Target Selection */}
      {action === 'kill' && !selectedTarget && (
        <div className="space-y-3">
          <h4 className="text-white font-semibold mb-3">☠️ Choose Who to Poison:</h4>
          {alivePlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => setSelectedTarget(player.id)}
              className="w-full p-4 rounded-lg bg-red-900/30 border-2 border-red-500/50 hover:border-red-400 hover:bg-red-900/50 transition-all text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-semibold">{player.name}</span>
              </div>
            </button>
          ))}
          <button
            onClick={() => setAction(null)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
          >
            Back
          </button>
        </div>
      )}

      {/* Confirm Action */}
      {((action === 'save' && victim) || (action === 'kill' && selectedTarget) || action === 'nothing') && (
        <div className="mt-4">
          <button
            onClick={handleSubmit}
            className="w-full bg-white hover:bg-gray-100 text-purple-900 font-bold py-4 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            Confirm Choice
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-purple-950/50 rounded-lg p-4 border border-purple-600/50">
        <h4 className="text-purple-200 font-semibold text-sm mb-2">💡 Strategy:</h4>
        <ul className="text-purple-300 text-xs space-y-1 ml-4">
          <li>• Each potion can only be used ONCE per game</li>
          <li>• You can save yourself with the life potion</li>
          <li>• Death potion can eliminate anyone, even during the night</li>
          <li>• Saving potions for critical moments is often wise</li>
        </ul>
      </div>
    </div>
  );
}

export default WitchNightPhase;