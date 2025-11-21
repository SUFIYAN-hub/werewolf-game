import React, { useState } from "react";
import { Moon, Users } from "lucide-react";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";

function HomeScreen({ onCreateRoom, onJoinRoom }) {
  const [mode, setMode] = useState(null); // null, 'create', 'join'
  const [playerName, setPlayerName] = useState("");
  const [location, setLocation] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim() || !location.trim()) {
      alert("Please enter your name and location");
      return;
    }

    if (mode === "create") {
      onCreateRoom(playerName, location);
    } else if (mode === "join") {
      if (!roomCode.trim()) {
        alert("Please enter room code");
        return;
      }
      onJoinRoom(playerName, location, roomCode.toUpperCase());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Moon className="w-16 h-16 text-yellow-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">Werewolf</h1>
          <p className="text-purple-200">A Halal Multiplayer Game</p>
          <p className="text-sm text-purple-300 mt-2">
            ✨ With automatic prayer time reminders
          </p>
        </div>

        {/* Islamic Reminder */}
        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6">
          <p className="text-green-200 text-sm text-center">
            "وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ"
            <br />
            <span className="text-xs">
              Remember your prayers and maintain balance in entertainment
            </span>
          </p>
        </div>

        {!mode && (
          <div className="space-y-4">
            <Button
              onClick={() => setMode("create")}
              variant="primary"
              size="lg"
              fullWidth
              icon={Users}
            >
              Create New Room
            </Button>

            <Button
              onClick={() => setMode("join")}
              variant="secondary"
              size="lg"
              fullWidth
            >
              Join Existing Room
            </Button>
          </div>
        )}

        {mode && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              {mode === "create" ? "Create Room" : "Join Room"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-purple-200 mb-2">Your Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-purple-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your name"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-purple-200 mb-2">
                  Your Location (for prayer times)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-purple-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Yavatmal, India"
                />
              </div>

              {mode === "join" && (
                <div>
                  <label className="block text-purple-200 mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-purple-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={() => setMode(null)}
                  variant="ghost"
                  size="md"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  size="md"
                  className="flex-1"
                >
                  {mode === "create" ? "Create" : "Join"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Game Rules */}
        <div className="mt-8 text-center">
          <button className="text-purple-300 hover:text-purple-100 text-sm underline">
            How to Play?
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
