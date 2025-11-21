import React, { useState } from "react";
import {
  Sun,
  MessageSquare,
  Send,
  AlertTriangle,
  ThumbsUp,
  Users,
} from "lucide-react";
import Button from "./Button";

function DayPhase({
  gameState,
  playerName,
  isAlive,
  onSendMessage,
  onAccusePlayer,
  onSecondAccusation,
}) {
  const [message, setMessage] = useState("");
  const [selectedAccusation, setSelectedAccusation] = useState(null);

  const alivePlayers =
    gameState?.players?.filter((p) => p.isAlive && !p.isMe) || [];
  const myPlayer = gameState?.players?.find((p) => p.isMe);
  const accusations = gameState?.dayActions?.accusations || [];
  const chatMessages =
    gameState?.gameLog?.filter((log) => log.type === "chat") || [];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !isAlive) return;

    onSendMessage(message);
    setMessage("");
  };

  const handleAccuse = (playerId) => {
    if (!isAlive) return;
    onAccusePlayer(playerId);
  };

  const handleSecond = (targetId) => {
    if (!isAlive) return;
    onSecondAccusation(targetId);
  };

  const getLastAccusation = () => {
    if (accusations.length === 0) return null;
    return accusations[accusations.length - 1];
  };

  const lastAccusation = getLastAccusation();

  if (!isAlive) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-md rounded-lg p-8 border border-gray-600 text-center">
        <Sun className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-30" />
        <h3 className="text-2xl font-bold text-gray-400 mb-2">You Are Dead</h3>
        <p className="text-gray-500">
          Watch the village discussion in silence...
        </p>

        {/* Dead players can still see chat */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4 max-h-64 overflow-y-auto">
          <h4 className="text-gray-400 font-semibold mb-3 text-sm">
            Village Discussion
          </h4>
          {chatMessages.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No messages yet...
            </p>
          ) : (
            <div className="space-y-2">
              {chatMessages.slice(-10).map((log, index) => (
                <div key={index} className="bg-gray-700/50 rounded p-2">
                  <p className="text-gray-300 font-semibold text-xs">
                    {log.player}
                  </p>
                  <p className="text-gray-400 text-sm">{log.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Day Phase Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 border-2 border-yellow-400 shadow-2xl">
        <div className="flex items-center space-x-3 mb-2">
          <Sun className="w-8 h-8 text-white" />
          <h3 className="text-2xl font-bold text-white">Day Discussion</h3>
        </div>
        <p className="text-yellow-100">
          Discuss with other villagers to find the werewolves. Accuse suspicious
          players and vote them out!
        </p>
      </div>

      {/* Accusation Status */}
      {lastAccusation && (
        <div className="bg-orange-900/30 backdrop-blur-md rounded-lg p-4 border-2 border-orange-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              <div>
                <h4 className="text-white font-bold">Active Accusation</h4>
                <p className="text-orange-200">
                  <span className="font-semibold">
                    {lastAccusation.accuser}
                  </span>{" "}
                  accused{" "}
                  <span className="font-semibold text-red-300">
                    {lastAccusation.target}
                  </span>
                </p>
              </div>
            </div>

            {/* Second Button */}
            {lastAccusation.accuserId !== myPlayer?.id && (
              <Button
                onClick={() => handleSecond(lastAccusation.targetId)}
                variant="danger"
                size="md"
                icon={ThumbsUp}
              >
                Second & Vote
              </Button>
            )}

            {lastAccusation.accuserId === myPlayer?.id && (
              <div className="bg-yellow-600/30 px-4 py-2 rounded-lg">
                <span className="text-yellow-200 text-sm">
                  Waiting for someone to second your accusation...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
          <div className="bg-black/30 px-4 py-3 border-b border-white/20">
            <h4 className="text-white font-bold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Village Chat
            </h4>
          </div>

          {/* Messages */}
          <div className="p-4 h-64 overflow-y-auto custom-scrollbar">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8 text-purple-200">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Start the discussion!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chatMessages.slice(-20).map((log, index) => {
                  const isMe = log.player === playerName;
                  return (
                    <div
                      key={index}
                      className={`${
                        isMe ? "bg-purple-600/30 ml-8" : "bg-white/10 mr-8"
                      } rounded-lg p-3`}
                    >
                      <p
                        className={`font-semibold text-xs ${
                          isMe ? "text-purple-200" : "text-blue-200"
                        }`}
                      >
                        {log.player} {isMe && "(You)"}
                      </p>
                      <p className="text-white text-sm mt-1">{log.message}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-white/20">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts..."
                className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-purple-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                maxLength={200}
              />
              <Button
                type="submit"
                disabled={!message.trim()}
                variant="primary"
                size="sm"
                icon={Send}
              ></Button>
            </form>
          </div>
        </div>

        {/* Accusation Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
          <div className="bg-black/30 px-4 py-3 border-b border-white/20">
            <h4 className="text-white font-bold flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Accuse a Player
            </h4>
          </div>

          <div className="p-4">
            <p className="text-purple-200 text-sm mb-4">
              Select a player you suspect is a werewolf. If another player
              seconds your accusation, a vote will begin.
            </p>

            {/* Player List */}
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {alivePlayers.length === 0 ? (
                <div className="text-center py-8 text-purple-200">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No other players to accuse</p>
                </div>
              ) : (
                alivePlayers.map((player) => {
                  const hasBeenAccused = accusations.some(
                    (acc) => acc.targetId === player.id
                  );
                  const lastAccusedByMe = accusations
                    .slice()
                    .reverse()
                    .find((acc) => acc.accuserId === myPlayer?.id);
                  const iAccusedThisPlayer =
                    lastAccusedByMe?.targetId === player.id;

                  return (
                    <div
                      key={player.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        hasBeenAccused
                          ? "bg-red-900/30 border-red-500"
                          : "bg-white/10 border-white/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold">
                              {player.name}
                            </p>
                            {player.isHost && (
                              <span className="text-yellow-400 text-xs">
                                👑 Host
                              </span>
                            )}
                            {hasBeenAccused && (
                              <span className="text-red-400 text-xs block">
                                ⚠️ Accused
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={() => handleAccuse(player.id)}
                          disabled={iAccusedThisPlayer}
                          variant={iAccusedThisPlayer ? "ghost" : "danger"}
                          size="sm"
                        >
                          {iAccusedThisPlayer ? "Accused" : "Accuse"}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="px-4 pb-4">
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
              <h5 className="text-blue-200 font-semibold text-xs mb-1">
                💡 How Accusations Work:
              </h5>
              <ul className="text-blue-100 text-xs space-y-1 ml-4">
                <li>• Accuse a player you suspect</li>
                <li>• If someone seconds, voting begins</li>
                <li>• Majority vote eliminates the player</li>
                <li>• Be strategic - werewolves can mislead!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Tips */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-md rounded-lg p-4 border border-purple-500/50">
        <h4 className="text-white font-semibold mb-2 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
          Discussion Tips
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-white/10 rounded p-3">
            <p className="text-purple-200">
              <strong className="text-white">🔍 Observe:</strong> Watch who
              stays quiet and who's too aggressive
            </p>
          </div>
          <div className="bg-white/10 rounded p-3">
            <p className="text-purple-200">
              <strong className="text-white">🤔 Question:</strong> Ask players
              about their suspicions and reasoning
            </p>
          </div>
          <div className="bg-white/10 rounded p-3">
            <p className="text-purple-200">
              <strong className="text-white">🎭 Deduce:</strong> Use logic to
              find inconsistencies in stories
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DayPhase;
