import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import HomeScreen from "./components/HomeScreen";
import LobbyScreen from "./components/LobbyScreen";
import GameScreen from "./components/GameScreen";
import PrayerNotification from "./components/PrayerNotification";
import RoleReveal from "./components/RoleReveal";
import Toast from "./components/Toast";
import LoadingSpinner from "./components/LoadingSpinner";
import { motion } from "framer-motion";
import LocationPermission from "./components/LocationPermission";
import { getSavedLocation } from "./services/locationService";

// const socket = io('http://localhost:5000');
const socket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:5000");

function App() {
  const [screen, setScreen] = useState("home"); // home, lobby, game
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const [location, setLocation] = useState("");
  const [gameState, setGameState] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [error, setError] = useState("");
  const [showHunterRevenge, setShowHunterRevenge] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationSetup, setShowLocationSetup] = useState(false);

  // Toast notification system
  const showToast = (message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Handle PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

useEffect(() => {
  // Check if location is already saved
  const savedLocation = getSavedLocation();
  if (savedLocation) {
    setUserLocation(savedLocation);
    setLocation(savedLocation.displayName || savedLocation.city);
  } else {
    // Show location setup if not saved
    setShowLocationSetup(true);
  }
}, []);

  useEffect(() => {
    // Listen for room created
    socket.on("room_created", (data) => {
      setRoomCode(data.roomCode);
      setScreen("lobby");
      setIsLoading(false);
      showToast("Room created successfully! 🎉", "success");
    });

    // Listen for room joined
    socket.on("room_joined", (data) => {
      setRoomCode(data.roomCode);
      setScreen("lobby");
      setIsLoading(false);
      showToast("Joined room successfully! 👋", "success");
    });

    // Listen for room updates
    socket.on("room_update", (data) => {
      setGameState(data);
      // Show toast when new player joins (only if you're already in the room)
      if (
        screen === "lobby" &&
        data.players.length > (gameState?.players?.length || 0)
      ) {
        const newPlayer = data.players[data.players.length - 1];
        if (!newPlayer.isMe) {
          showToast(`${newPlayer.name} joined the room! 🎮`, "info", 2000);
        }
      }
    });

    // Listen for role assignment
    socket.on("role_assigned", (data) => {
      setMyRole(data.role);
      setGameState(data.gameState);
      setShowRoleReveal(true); // Show epic reveal first
      // Don't switch to game screen yet
    });

    // Listen for game updates
    socket.on("game_update", (data) => {
      setGameState(data);
    });

    // Listen for night results
    socket.on("night_result", (data) => {
      setGameState(data.gameState);
    });

    // Listen for errors
    socket.on("error", (data) => {
      setIsLoading(false);
      showToast(data.message, "error");
    });

    // Listen for prayer pause updates
    socket.on("prayer_pause_update", (data) => {
      if (gameState) {
        setGameState({ ...gameState, prayerPaused: data.paused });
      }
    });

    // Listen for hunter revenge prompt
    socket.on("hunter_revenge_prompt", () => {
      setShowHunterRevenge(true);
    });

    return () => {
      socket.off("room_created");
      socket.off("room_joined");
      socket.off("room_update");
      socket.off("role_assigned");
      socket.off("game_update");
      socket.off("night_result");
      socket.off("error");
      socket.off("prayer_pause_update");
      socket.off("hunter_revenge_prompt");
    };
  }, [gameState]);

  // const createRoom = (name, loc) => {
  //   setPlayerName(name);
  //   setLocation(loc);
  //   socket.emit("create_room", { playerName: name, location: loc });
  // };
  const createRoom = (name, loc) => {
    setPlayerName(name);
    setLocation(loc);
    setIsLoading(true);
    setLoadingMessage("Creating room...");

    socket.emit("create_room", { playerName: name, location: loc });
  };

  const joinRoom = (name, loc, code) => {
    setPlayerName(name);
    setLocation(loc);
    setRoomCode(code);
    setIsLoading(true);
    setLoadingMessage("Joining room...");

    socket.emit("join_room", {
      playerName: name,
      location: loc,
      roomCode: code,
    });
  };

const handleLocationSet = (locationData) => {
  setUserLocation(locationData);
  setLocation(locationData.displayName || locationData.city);
  setShowLocationSetup(false);
  showToast(`Location set: ${locationData.displayName}`, 'success');
};

  const startGame = () => {
    socket.emit("start_game", { roomCode });
  };

  const handleNightAction = (action, targetId) => {
    socket.emit("night_action", { roomCode, action, targetId });
  };

  const sendMessage = (message) => {
    socket.emit("send_message", { roomCode, message });
  };

  const accusePlayer = (targetId) => {
    socket.emit("accuse_player", { roomCode, targetId });
  };

  const secondAccusation = (targetId) => {
    socket.emit("second_accusation", { roomCode, targetId });
  };

  const castVote = (vote) => {
    socket.emit("cast_vote", { roomCode, vote });
  };

  const togglePrayerPause = (paused) => {
    socket.emit("prayer_pause", { roomCode, paused });
  };

  const handleHunterRevenge = (targetId) => {
    socket.emit("hunter_revenge", { roomCode, targetId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {showInstallPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 left-4 right-4 bg-purple-600 text-white p-4 rounded-lg shadow-2xl z-50 safe-area-bottom"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold">Install Werewolf App</p>
              <p className="text-sm text-purple-100">
                Play offline & get faster access!
              </p>
            </div>

            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="px-3 py-2 bg-white/20 rounded"
              >
                Later
              </button>

              <button
                onClick={async () => {
                  if (!deferredPrompt) return;
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === "accepted") setShowInstallPrompt(false);
                  setDeferredPrompt(null);
                }}
                className="px-4 py-2 bg-white text-purple-600 font-semibold rounded"
              >
                Install
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <PrayerNotification location={userLocation} />

      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-purple-900/90 rounded-lg p-8 border-2 border-purple-500 shadow-2xl">
            <LoadingSpinner size="xl" text={loadingMessage} />
          </div>
        </div>
      )}

      {/* ✅ ADD ROLE REVEAL HERE */}
      {showRoleReveal && myRole && (
        <RoleReveal
          role={myRole}
          onComplete={() => {
            setShowRoleReveal(false);
            setScreen("game");
          }}
        />
      )}

      {screen === "home" && (
        <HomeScreen onCreateRoom={createRoom} onJoinRoom={joinRoom} />
      )}

      {screen === "lobby" && (
        <LobbyScreen
          roomCode={roomCode}
          gameState={gameState}
          onStartGame={startGame}
        />
      )}

      {screen === "game" && !showRoleReveal && (
        <GameScreen
          roomCode={roomCode}
          gameState={gameState}
          myRole={myRole}
          playerName={playerName}
          onNightAction={handleNightAction}
          onSendMessage={sendMessage}
          onAccusePlayer={accusePlayer}
          onSecondAccusation={secondAccusation}
          onCastVote={castVote}
          onTogglePrayerPause={togglePrayerPause}
          onHunterRevenge={handleHunterRevenge}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {showLocationSetup && (
      <LocationPermission onLocationSet={handleLocationSet} />
    )}
      <PrayerNotification location={userLocation} />

      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      {screen === "home" && (
        <HomeScreen onCreateRoom={createRoom} onJoinRoom={joinRoom} />
      )}

      {screen === "lobby" && (
        <LobbyScreen
          roomCode={roomCode}
          gameState={gameState}
          onStartGame={startGame}
        />
      )}

      {screen === "game" && (
        <GameScreen
          roomCode={roomCode}
          gameState={gameState}
          myRole={myRole}
          playerName={playerName}
          onNightAction={handleNightAction}
          onSendMessage={sendMessage}
          onAccusePlayer={accusePlayer}
          onSecondAccusation={secondAccusation}
          onCastVote={castVote}
          onTogglePrayerPause={togglePrayerPause}
        />
      )}
    </div>
  );
}

export default App;
