import React, { useState } from "react";
import {
  Moon,
  Skull,
  Eye,
  Heart,
  Users,
  Check,
  AlertCircle,
} from "lucide-react";
import WitchNightPhase from "./WitchNightPhase";
import DetectiveNightPhase from "./DetectiveNightPhase";
import Button from "./Button";

function NightPhase({ gameState, myRole, isAlive, onNightAction }) {
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [actionSubmitted, setActionSubmitted] = useState(false);

  const alivePlayers =
    gameState?.players?.filter((p) => p.isAlive && !p.isMe) || [];
  const myPlayer = gameState?.players?.find((p) => p.isMe);

  const handleSelectTarget = (playerId) => {
    if (!isAlive || actionSubmitted) return;
    setSelectedTarget(playerId);
  };

  const handleSubmitAction = () => {
    if (!selectedTarget || !isAlive) return;

    let action = "";
    if (myRole === "werewolf") action = "werewolf_kill";
    else if (myRole === "doctor") action = "doctor_heal";
    else if (myRole === "seer") action = "seer_check";

    if (action) {
      onNightAction(action, selectedTarget);
      setActionSubmitted(true);
    }
  };

  const getRoleAction = () => {
    switch (myRole) {
      case "werewolf":
        return {
          title: "Choose Your Victim",
          description:
            "Select a player to eliminate tonight. Coordinate silently with other werewolves.",
          icon: <Skull className="w-6 h-6" />,
          color: "from-red-600 to-red-800",
          buttonText: "Eliminate Player",
          buttonColor: "bg-red-600 hover:bg-red-700",
        };
      case "seer":
        return {
          title: "Use Your Vision",
          description:
            "Select a player to learn their true identity. Are they a werewolf or innocent?",
          icon: <Eye className="w-6 h-6" />,
          color: "from-blue-600 to-blue-800",
          buttonText: "Check Player",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
        };
      case "doctor":
        return {
          title: "Protect Someone",
          description:
            "Select a player to protect from werewolf attacks tonight. You can protect yourself.",
          icon: <Heart className="w-6 h-6" />,
          color: "from-green-600 to-green-800",
          buttonText: "Heal Player",
          buttonColor: "bg-green-600 hover:bg-green-700",
        };
      case "villager":
        return {
          title: "Rest and Wait",
          description:
            "Villagers have no night action. Wait for dawn to discuss and vote.",
          icon: <Moon className="w-6 h-6" />,
          color: "from-purple-600 to-purple-800",
          buttonText: null,
          buttonColor: null,
        };
      default:
        return null;
    }
  };

  const roleAction = getRoleAction();

  // Seer result display
  const seerResult = gameState?.nightInfo?.seerResult;

  if (!isAlive) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-md rounded-lg p-8 border border-gray-600 text-center">
        <Skull className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-400 mb-2">You Are Dead</h3>
        <p className="text-gray-500">Watch the night unfold in silence...</p>
      </div>
    );
  }

  // ✅ NEW: Witch gets special component
  if (myRole === "witch") {
    return (
      <WitchNightPhase gameState={gameState} onNightAction={onNightAction} />
    );
  }

  // ✅ NEW: Detective gets special component
  if (myRole === "detective") {
    return (
      <DetectiveNightPhase
        gameState={gameState}
        onNightAction={onNightAction}
      />
    );
  }

  // ✅ NEW: Hunter has no night action
  if (myRole === "hunter") {
    return (
      <div className="bg-orange-900/30 backdrop-blur-md rounded-lg p-8 border border-orange-500/50 text-center">
        <div className="text-6xl mb-4">🏹</div>
        <h3 className="text-2xl font-bold text-white mb-2">The Hunter Rests</h3>
        <p className="text-orange-200 mb-4">
          As the Hunter, you have no night action. Rest well and prepare for the
          day ahead.
        </p>
        <div className="bg-orange-800/30 rounded-lg p-4 border border-orange-600/50">
          <p className="text-orange-300 text-sm">
            🎯 <strong>Your Power:</strong> When you are eliminated (by
            werewolves or voting), you will immediately choose one player to
            take with you as your dying shot.
          </p>
        </div>
      </div>
    );
  }

  // Villager has no night action
  if (myRole === "villager") {
    return (
      <div className="bg-purple-900/30 backdrop-blur-md rounded-lg p-8 border border-purple-500/50 text-center">
        <Moon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">
          The Village Sleeps
        </h3>
        <p className="text-purple-200 mb-4">
          As a villager, you have no night action. Rest well and prepare for the
          day ahead.
        </p>
        <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600/50">
          <p className="text-purple-300 text-sm">
            💤 The special roles are working during the night. Stay patient and
            get ready to discuss when dawn breaks.
          </p>
        </div>
      </div>
    );
  }

  // For Werewolf, Seer, Doctor - keep existing code
  return (
    <div
      className={`bg-gradient-to-br ${roleAction.color} rounded-lg p-6 border-2 border-white/30 shadow-2xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-white">{roleAction.icon}</div>
          <div>
            <h3 className="text-2xl font-bold text-white">
              {roleAction.title}
            </h3>
            <p className="text-white/80 text-sm">{roleAction.description}</p>
          </div>
        </div>
      </div>

      {/* Werewolf Team Info - Show other werewolves */}
      {myRole === "werewolf" && gameState?.nightInfo?.werewolfTeam && (
        <div className="mb-6 bg-red-900/30 border-2 border-red-500 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Moon className="w-6 h-6 text-red-400" />
            <h4 className="text-white font-bold text-lg">
              Your Werewolf Pack 🐺
            </h4>
          </div>

          {gameState.nightInfo.werewolfTeam.length > 0 ? (
            <div className="space-y-2">
              {gameState.nightInfo.werewolfTeam.map((werewolf) => (
                <div
                  key={werewolf.id}
                  className="flex items-center space-x-3 bg-red-800/30 rounded-lg p-3"
                >
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                    {werewolf.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{werewolf.name}</p>
                    <p className="text-red-300 text-xs">Fellow Werewolf</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-red-200 text-sm">
              You are the only werewolf. Hunt alone!
            </p>
          )}

          {gameState.nightInfo.werewolfTarget && (
            <div className="mt-3 bg-red-950/50 rounded-lg p-3 border border-red-600/50">
              <p className="text-red-200 text-sm">
                🎯 <strong>Pack Target:</strong>{" "}
                {gameState.nightInfo.werewolfTarget}
              </p>
              <p className="text-red-300 text-xs mt-1">
                {actionSubmitted
                  ? "You've confirmed this target"
                  : "Other werewolves have chosen this target"}
              </p>
            </div>
          )}

          <div className="mt-3 bg-red-950/50 rounded-lg p-3 border border-red-600/50">
            <p className="text-red-200 text-xs">
              💡 <strong>Coordinate silently:</strong> All werewolves see the
              same information. Choose your target wisely!
            </p>
          </div>
        </div>
      )}

      {/* Seer Result (if available) */}
      {seerResult && myRole === "seer" && (
        <div className="mb-6 bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-yellow-400" />
            <div>
              <h4 className="text-white font-bold">Vision Result</h4>
              <p className="text-yellow-200">
                <span className="font-semibold">{seerResult.target}</span> is{" "}
                {seerResult.isWerewolf ? (
                  <span className="text-red-400 font-bold">a WEREWOLF! 🐺</span>
                ) : (
                  <span className="text-green-400 font-bold">INNOCENT ✅</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Submitted Confirmation */}
      {actionSubmitted && (
        <div className="mb-6 bg-green-900/30 border-2 border-green-500 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Check className="w-6 h-6 text-green-400" />
            <div>
              <h4 className="text-white font-bold">Action Submitted</h4>
              <p className="text-green-200">
                Your choice has been recorded. Wait for dawn...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Player Selection */}
      {!actionSubmitted && (
        <>
          <div className="mb-4">
            <h4 className="text-white font-semibold mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Select a Player
            </h4>

            <div className="grid grid-cols-1 gap-2">
              {/* Option to heal yourself (Doctor only) */}
              {myRole === "doctor" && (
                <button
                  onClick={() => handleSelectTarget(myPlayer.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTarget === myPlayer.id
                      ? "bg-white/30 border-white scale-105"
                      : "bg-white/10 border-white/30 hover:bg-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {myPlayer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="text-white font-semibold">
                          {myPlayer.name} (Yourself)
                        </p>
                        <p className="text-white/70 text-xs">
                          Protect yourself
                        </p>
                      </div>
                    </div>
                    {selectedTarget === myPlayer.id && (
                      <Check className="w-6 h-6 text-white" />
                    )}
                  </div>
                </button>
              )}

              {/* Other players */}
              {alivePlayers.length === 0 ? (
                <div className="text-center py-8 text-white/70">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No other players available</p>
                </div>
              ) : (
                alivePlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleSelectTarget(player.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTarget === player.id
                        ? "bg-white/30 border-white scale-105"
                        : "bg-white/10 border-white/30 hover:bg-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="text-white font-semibold">
                            {player.name}
                          </p>
                          {player.isHost && (
                            <span className="text-yellow-400 text-xs">
                              👑 Host
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedTarget === player.id && (
                        <Check className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitAction}
            disabled={!selectedTarget}
            variant={
              roleAction.buttonColor === "bg-red-600 hover:bg-red-700"
                ? "danger"
                : "primary"
            }
            size="lg"
            fullWidth
          >
            {roleAction.buttonText}
          </Button>

          {/* Warning for Werewolves */}
          {myRole === "werewolf" && (
            <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-xs">
                ⚠️ <strong>Reminder:</strong> Other werewolves can see your
                choice. Try to coordinate with them silently.
              </p>
            </div>
          )}
        </>
      )}

      {/* Instructions */}
      <div className="mt-6 pt-6 border-t border-white/20">
        <h4 className="text-white font-semibold text-sm mb-2">
          💡 How it works:
        </h4>
        <ul className="text-white/80 text-sm space-y-1 ml-4">
          {myRole === "werewolf" && (
            <>
              <li>• You can see your fellow werewolves above 🐺</li>
              <li>• All werewolves choose the same target together</li>
              <li>• When one werewolf selects, others can see the choice</li>
              <li>• The chosen player will be eliminated at dawn</li>
              <li>• Unless the Doctor or Witch saves them!</li>
            </>
          )}
          {myRole === "seer" && (
            <>
              <li>• You'll learn if the player is a werewolf or innocent</li>
              <li>• Use this info carefully during the day</li>
              <li>• Don't reveal yourself too early or you'll be targeted!</li>
            </>
          )}
          {myRole === "doctor" && (
            <>
              <li>• If you protect the werewolves' target, they survive</li>
              <li>• You can protect yourself once per game</li>
              <li>• Choose wisely who needs protection most</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default NightPhase;
