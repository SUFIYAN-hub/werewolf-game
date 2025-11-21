import React, { useState } from "react";
import { Eye, Users, Check, AlertCircle } from "lucide-react";
import Button from "./Button";

function DetectiveNightPhase({ gameState, onNightAction }) {
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [actionSubmitted, setActionSubmitted] = useState(false);

  const alivePlayers =
    gameState?.players?.filter((p) => p.isAlive && !p.isMe) || [];
  const myPlayer = gameState?.players?.find((p) => p.isMe);
  const hasUsedAbility = myPlayer?.hasUsedAbility;
  const detectiveResult = gameState?.nightInfo?.detectiveResult;

  const handleSubmit = () => {
    if (player1 && player2) {
      onNightAction("detective_check", { player1, player2 });
      setActionSubmitted(true);
    }
  };

  if (hasUsedAbility && !detectiveResult) {
    return (
      <div className="bg-indigo-900/30 border-2 border-indigo-500 rounded-lg p-6 text-center">
        <Eye className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-30" />
        <h3 className="text-2xl font-bold text-indigo-400 mb-2">
          Ability Already Used
        </h3>
        <p className="text-indigo-200">
          You've already used your one-time investigation. Wait for dawn...
        </p>
      </div>
    );
  }

  if (detectiveResult) {
    return (
      <div className="bg-indigo-900/30 border-2 border-indigo-500 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Eye className="w-8 h-8 text-indigo-400" />
          <h4 className="text-white font-bold text-xl">Investigation Result</h4>
        </div>
        <div className="bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-4">
          <p className="text-yellow-200 text-lg mb-3">
            <strong>{detectiveResult.player1Name}</strong> and{" "}
            <strong>{detectiveResult.player2Name}</strong>
          </p>
          <p className="text-white text-xl font-bold">
            {detectiveResult.sameTeam ? (
              <span className="text-green-400">✅ Are on the SAME team</span>
            ) : (
              <span className="text-red-400">❌ Are on DIFFERENT teams</span>
            )}
          </p>
          <div className="mt-4 bg-indigo-950/50 rounded p-3">
            <p className="text-indigo-200 text-sm">
              💡{" "}
              {detectiveResult.sameTeam
                ? "They are both werewolves OR both innocent villagers"
                : "One is a werewolf and one is innocent!"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (actionSubmitted) {
    return (
      <div className="bg-indigo-900/30 border-2 border-indigo-500 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Check className="w-6 h-6 text-indigo-400" />
          <div>
            <h4 className="text-white font-bold">Investigation Started</h4>
            <p className="text-indigo-200">
              Analyzing the connection... Wait for results.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-lg p-6 border-2 border-indigo-400 shadow-2xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="text-6xl">🔍</div>
          <div>
            <h3 className="text-2xl font-bold text-white">
              Detective Investigation
            </h3>
            <p className="text-indigo-200 text-sm">
              One-time use - Choose wisely!
            </p>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="mb-6 bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-4">
        <AlertCircle className="w-6 h-6 text-yellow-400 inline mr-2" />
        <span className="text-yellow-200 font-semibold">
          You can only use this ability ONCE per game!
        </span>
      </div>

      {/* Instructions */}
      <div className="mb-6">
        <p className="text-white text-sm">
          Select two players to investigate. You'll learn if they're on the same
          team or different teams.
        </p>
      </div>

      {/* Player 1 Selection */}
      <div className="mb-4">
        <h4 className="text-white font-semibold mb-3">
          First Player {player1 && "✅"}
        </h4>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
          {alivePlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => setPlayer1(player.id)}
              disabled={player.id === player2}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                player1 === player.id
                  ? "bg-indigo-500 border-white scale-105"
                  : player.id === player2
                  ? "bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed"
                  : "bg-white/10 border-indigo-500/50 hover:bg-white/20"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-semibold">{player.name}</span>
                {player1 === player.id && (
                  <Check className="w-5 h-5 text-white ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Player 2 Selection */}
      {player1 && (
        <div className="mb-4">
          <h4 className="text-white font-semibold mb-3">
            Second Player {player2 && "✅"}
          </h4>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
            {alivePlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => setPlayer2(player.id)}
                disabled={player.id === player1}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  player2 === player.id
                    ? "bg-indigo-500 border-white scale-105"
                    : player.id === player1
                    ? "bg-gray-700 border-gray-600 opacity-50 cursor-not-allowed"
                    : "bg-white/10 border-indigo-500/50 hover:bg-white/20"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white font-semibold">
                    {player.name}
                  </span>
                  {player2 === player.id && (
                    <Check className="w-5 h-5 text-white ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {player1 && player2 && (
        <Button
          onClick={handleSubmit}
          disabled={!player1 || !player2}
          variant="primary"
          size="lg"
          fullWidth
          icon={Eye}
        >
          Investigate These Players
        </Button>
      )}

      {/* Strategy Tips */}
      <div className="mt-6 bg-indigo-950/50 rounded-lg p-4 border border-indigo-600/50">
        <h4 className="text-indigo-200 font-semibold text-sm mb-2">
          💡 Strategy:
        </h4>
        <ul className="text-indigo-300 text-xs space-y-1 ml-4">
          <li>• Check suspicious pairs who vote together</li>
          <li>• If "Different teams" → One is definitely a werewolf!</li>
          <li>• If "Same team" → Both innocent OR both werewolves</li>
          <li>• Use voting patterns to deduce who's who</li>
        </ul>
      </div>
    </div>
  );
}

export default DetectiveNightPhase;
