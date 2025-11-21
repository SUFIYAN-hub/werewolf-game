import React from "react";
import { Users, Skull, Crown, Moon, Eye, Heart } from "lucide-react";
import { motion } from "framer-motion";

function PlayerList({ players, myPlayerId, phase }) {
  const getRoleIcon = (role) => {
    switch (role) {
      case "werewolf":
        return <Moon className="w-4 h-4 text-red-400" />;
      case "seer":
        return <Eye className="w-4 h-4 text-blue-400" />;
      case "doctor":
        return <Heart className="w-4 h-4 text-green-400" />;
      case "villager":
        return <Users className="w-4 h-4 text-purple-400" />;
      default:
        return null;
    }
  };

  const getPlayerStatus = (player) => {
    if (!player.isAlive) {
      return {
        bgColor: "bg-gray-800/50",
        borderColor: "border-gray-600",
        textColor: "text-gray-500",
        statusText: "Eliminated",
        statusColor: "text-red-400",
      };
    }
    if (player.isMe) {
      return {
        bgColor: "bg-purple-900/40",
        borderColor: "border-purple-500",
        textColor: "text-white",
        statusText: "You",
        statusColor: "text-purple-300",
      };
    }
    return {
      bgColor: "bg-white/10",
      borderColor: "border-white/20",
      textColor: "text-white",
      statusText: "Alive",
      statusColor: "text-green-400",
    };
  };

  const alivePlayers = players?.filter((p) => p.isAlive) || [];
  const deadPlayers = players?.filter((p) => !p.isAlive) || [];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Users className="mr-2" />
          Players
        </h3>
        <div className="text-sm text-purple-200">
          {alivePlayers.length} / {players?.length || 0} alive
        </div>
      </div>

      {/* Alive Players */}
      <div className="space-y-2 mb-4">
        {alivePlayers.map((player) => {
          const status = getPlayerStatus(player);

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className={`${status.bgColor} border ${status.borderColor} rounded-lg p-3 transition-all`}
            >
              <div className="flex items-center justify-between">
                {/* Player Info */}
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    {player.isHost && (
                      <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                        <Crown className="w-3 h-3 text-yellow-900" />
                      </div>
                    )}
                  </div>

                  {/* Name and Status */}
                  <div>
                    <p className={`font-semibold ${status.textColor}`}>
                      {player.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs ${status.statusColor}`}>
                        {status.statusText}
                      </span>
                      {player.isHost && (
                        <span className="text-xs text-yellow-400">• Host</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role (only shown for dead players or self) */}
                {player.role &&
                  (player.id === myPlayerId || !player.isAlive) && (
                    <div className="flex items-center space-x-1 bg-black/30 px-2 py-1 rounded-full">
                      {getRoleIcon(player.role)}
                      <span className="text-xs text-white capitalize">
                        {player.role}
                      </span>
                    </div>
                  )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Dead Players Section */}
      {deadPlayers.length > 0 && (
        <div className="border-t border-white/20 pt-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center">
            <Skull className="w-4 h-4 mr-2" />
            Eliminated ({deadPlayers.length})
          </h4>
          <div className="space-y-2">
            {deadPlayers.map((player) => {
              const status = getPlayerStatus(player);

              return (
                <div
                  key={player.id}
                  className={`${status.bgColor} border ${status.borderColor} rounded-lg p-3 opacity-60`}
                >
                  <div className="flex items-center justify-between">
                    {/* Player Info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-400 font-bold">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-400 line-through">
                          {player.name}
                        </p>
                        <span className="text-xs text-red-400">Eliminated</span>
                      </div>
                    </div>

                    {/* Revealed Role */}
                    {player.role && (
                      <div className="flex items-center space-x-1 bg-black/30 px-2 py-1 rounded-full">
                        {getRoleIcon(player.role)}
                        <span className="text-xs text-gray-400 capitalize">
                          {player.role}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Game Stats */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-green-900/30 rounded-lg p-2 border border-green-500/30">
            <p className="text-2xl font-bold text-green-400">
              {alivePlayers.length}
            </p>
            <p className="text-xs text-green-200">Alive</p>
          </div>
          <div className="bg-red-900/30 rounded-lg p-2 border border-red-500/30">
            <p className="text-2xl font-bold text-red-400">
              {deadPlayers.length}
            </p>
            <p className="text-xs text-red-200">Dead</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerList;
