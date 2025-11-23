import React from "react";
import Button from "./Button";
import { Users, Copy, Play, Clock } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

function LobbyScreen({ roomCode, gameState, onStartGame }) {
  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // function LobbyScreen({ roomCode, gameState, onStartGame }) {
  //   const copyRoomCode = () => {
  //     navigator.clipboard.writeText(roomCode);
  //     alert('Room code copied!');
  //   };

  const isHost = gameState?.players?.find((p) => p.isMe)?.isHost;
  const playerCount = gameState?.players?.length || 0;
  const canStart = playerCount >= 5;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
          {/* Room Code */}
          <div className="text-center mb-8">
            <h2 className="text-white text-lg mb-2">Room Code</h2>
            <div className="flex items-center justify-center space-x-3">
              <div className="bg-white/20 px-8 py-4 rounded-lg animate-glowPulse">
                <span className="text-4xl font-bold text-white tracking-wider">
                  {roomCode}
                </span>
              </div>
              <Button
                onClick={copyRoomCode}
                variant={copied ? "success" : "ghost"}
                size="sm"
                icon={copied ? null : Copy}
                success={copied}
              >
                {copied ? "Copied!" : ""}
              </Button>
            </div>
            <p className="text-purple-200 text-sm mt-2">
              Share this code with your friends
            </p>
          </div>

          {/* Player List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Users className="mr-2" />
                Players ({playerCount})
              </h3>
              <span className="text-purple-300 text-sm">
                {canStart ? "Ready to start!" : `Need ${5 - playerCount} more`}
              </span>
            </div>

            <div className="space-y-2">
              {gameState?.players?.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className={`p-4 sm:p-3 rounded-lg flex items-center justify-between touch-target ${
                    player.isMe
                      ? "bg-purple-600/40 border-2 border-purple-400"
                      : "bg-white/10"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-3">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {player.name}
                        {player.isMe && (
                          <span className="text-purple-300 ml-2">(You)</span>
                        )}
                      </p>

                      {player.isHost && (
                        <span className="text-yellow-400 text-xs">👑 Host</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Game Info */}
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
            <h4 className="text-blue-200 font-semibold mb-2">Game Setup</h4>
            <ul className="text-blue-100 text-sm space-y-1">
              <li>• Minimum 5 players required</li>
              <li>• Roles: Werewolves, Seer, Doctor, Villagers</li>
              <li>• Prayer times will pause the game automatically</li>
              <li>• Stay respectful and have fun!</li>
            </ul>

            <p className="text-white text-sm opacity-60">
              Prayer Calc: {gameState.prayerSettings?.method} | Madhab:{" "}
              {gameState.prayerSettings?.madhab}
            </p>
          </div>

          {/* Start Button */}
          {isHost && (
            <Button
              onClick={onStartGame}
              disabled={!canStart}
              variant="success"
              size="lg"
              fullWidth
              icon={Play}
            >
              Start Game
            </Button>
          )}

          {!isHost && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-purple-900/30 px-6 py-3 rounded-lg border border-purple-500/50">
                <Clock className="w-5 h-5 text-purple-300 animate-pulse" />
                <span className="text-purple-200">
                  Waiting for host to start...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LobbyScreen;
