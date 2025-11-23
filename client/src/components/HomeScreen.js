import React, { useState } from "react";
import { Moon, Users } from "lucide-react";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";
import { motion } from "framer-motion";
import PrayerSettings from "./PrayerSettings";

function HomeScreen({ onCreateRoom, onJoinRoom }) {
  const [mode, setMode] = useState(null); // null, 'create', 'join'
  const [playerName, setPlayerName] = useState("");
  const [location, setLocation] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [prayerSettings, setPrayerSettings] = useState({
  fajr: true,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
});


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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            className="flex justify-center mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Moon className="w-16 h-16 text-yellow-400" />
          </motion.div>

          <h1 className="text-5xl font-bold text-white mb-2">Werewolf</h1>
          <p className="text-purple-200">A Halal Multiplayer Game</p>
          <p className="text-sm text-purple-300 mt-2">
            ✨ With automatic prayer time reminders
          </p>
        </motion.div>

        {/* Islamic Reminder */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6"
        >
          <p className="text-green-200 text-sm text-center">
            "وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ"
            <br />
            <span className="text-xs">
              Remember your prayers and maintain balance in entertainment
            </span>
          </p>
        </motion.div>

        {/* Show buttons when no mode selected */}
        {!mode && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="space-y-4"
          >
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
          </motion.div>
        )}

        {/* Form Section */}
        {mode && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20"
          >
            {/* Your form remains same */}
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
                  className="w-full px-4 py-3 sm:py-2 rounded-lg bg-white/20 text-white placeholder-purple-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base touch-target"
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
                  className="w-full px-4 py-3 sm:py-2 rounded-lg bg-white/20 text-white placeholder-purple-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 touch-target"
                  placeholder="e.g., Yavatmal, India"
                />
                <PrayerSettings
                  settings={prayerSettings}
                  onUpdate={setPrayerSettings}
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
                    className="w-full px-4 py-3 sm:py-2 rounded-lg bg-white/20 text-white placeholder-purple-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase touch-target"
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
          </motion.div>
        )}

        {/* Game Rules */}
        <div className="mt-8 text-center">
          <button className="text-purple-300 hover:text-purple-100 text-sm underline">
            How to Play?
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default HomeScreen;
