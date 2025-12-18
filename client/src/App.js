import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";

import HomeScreen from "./components/HomeScreen";
import LobbyScreen from "./components/LobbyScreen";
import GameScreen from "./components/GameScreen";
import PrayerNotification from "./components/PrayerNotification";
import RoleReveal from "./components/RoleReveal";
import Toast from "./components/Toast";
import LoadingSpinner from "./components/LoadingSpinner";
import LocationPermission from "./components/LocationPermission";
import { getSavedLocation } from "./services/locationService";

// socket
const socket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:5000");

// Make socket globally available for components
window.socket = socket;

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
  const [showLocationSetup, setShowLocationSetup] = useState(true);
  const [prayerSettings, setPrayerSettings] = useState({
    method: "Karachi", // Default for Sunni
    madhab: "Hanafi", // Default for Ahle Sunnat Wal Jamaat
  });

  // ref to track previous players count (for new-player toast)
  const prevPlayersRef = useRef(0);

  // Toast helpers
  const showToast = (message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // PWA beforeinstallprompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Check saved location once
  useEffect(() => {
    const savedLocation = getSavedLocation();
    if (savedLocation) {
      setUserLocation(savedLocation);
      setLocation(savedLocation.displayName || savedLocation.city || "");
      setShowLocationSetup(false);
    } else {
      setShowLocationSetup(true);
    }
  }, []);

  // Socket listeners (attach once)
  useEffect(() => {
    // room created
    const onRoomCreated = (data) => {
      setRoomCode(data.roomCode);
      setScreen("lobby");
      setIsLoading(false);
      showToast("Room created successfully! 🎉", "success");
    };

    // room joined
    const onRoomJoined = (data) => {
      setRoomCode(data.roomCode);
      setScreen("lobby");
      setIsLoading(false);
      showToast("Joined room successfully! 👋", "success");
    };

    // room update
    const onRoomUpdate = (data) => {
      // Show toast for new player join (compare using prevPlayersRef)
      const newCount = data?.players?.length || 0;
      if (screen === "lobby" && newCount > (prevPlayersRef.current || 0)) {
        const newPlayer = data.players[data.players.length - 1];
        if (newPlayer && !newPlayer.isMe) {
          showToast(`${newPlayer.name} joined the room! 🎮`, "info", 2000);
        }
      }
      prevPlayersRef.current = data?.players?.length || 0;
      setGameState(data);
    };

    // role assigned
    const onRoleAssigned = (data) => {
      setMyRole(data.role);
      setGameState(data.gameState);
      setShowRoleReveal(true);
    };

    // generic game update
    const onGameUpdate = (data) => {
      setGameState(data);
    };

    // night result
    const onNightResult = (data) => {
      setGameState(data.gameState);
    };

    const onError = (data) => {
      setIsLoading(false);
      showToast(data?.message || "Error", "error");
    };

    const onPrayerPauseUpdate = (data) => {
      setGameState((prev) =>
        prev ? { ...prev, prayerPaused: data.paused } : prev
      );
    };

    const onHunterRevenge = () => {
      setShowHunterRevenge(true);
    };

    // Register
    socket.on("room_created", onRoomCreated);
    socket.on("room_joined", onRoomJoined);
    socket.on("room_update", onRoomUpdate);
    socket.on("role_assigned", onRoleAssigned);
    socket.on("game_update", onGameUpdate);
    socket.on("night_result", onNightResult);
    socket.on("error", onError);
   socket.on("prayer_pause_update", (data) => {
  if (gameState) {
    setGameState({
      ...gameState,
      prayerPaused: data.paused,
      prayerName: data.prayerName
    });

    if (data.paused) {
      showToast(`⏸ Game paused for ${data.prayerName}`, "warning");
    } else {
      showToast(`▶ Game resumed after ${data.prayerName}`, "success");
    }
  }
});

    socket.on("hunter_revenge_prompt", onHunterRevenge);

    // cleanup
    return () => {
      socket.off("room_created", onRoomCreated);
      socket.off("room_joined", onRoomJoined);
      socket.off("room_update", onRoomUpdate);
      socket.off("role_assigned", onRoleAssigned);
      socket.off("game_update", onGameUpdate);
      socket.off("night_result", onNightResult);
      socket.off("error", onError);
      socket.off("prayer_pause_update", onPrayerPauseUpdate);
      socket.off("hunter_revenge_prompt", onHunterRevenge);
    };
    // NOTE: intentionally empty deps so listeners attach only once
  }, [screen]); // keep `screen` so new-player toast only triggers when in lobby; this is safe

  // location setter used by LocationPermission component
  const handleLocationSet = (locationData) => {
    setUserLocation(locationData);
    setLocation(locationData.displayName || locationData.city || "");
    setShowLocationSetup(false);
    showToast(
      `Location set: ${locationData.displayName || locationData.city}`,
      "success"
    );
  };
  const handleChangeLocation = () => {
  setShowLocationSetup(true);
};

  // actions
  const createRoom = (name, loc) => {
    setPlayerName(name);
    setLocation(loc);
    setIsLoading(true);
    setLoadingMessage("Creating room...");
    socket.emit("create_room", {
      playerName: name,
      location: loc,
      prayerSettings,
    });
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
      prayerSettings,
    });
  };

  const startGame = () => socket.emit("start_game", { roomCode });
  const handleNightAction = (action, targetId) =>
    socket.emit("night_action", { roomCode, action, targetId });
  const sendMessage = (message) =>
    socket.emit("send_message", { roomCode, message });
  const accusePlayer = (targetId) =>
    socket.emit("accuse_player", { roomCode, targetId });
  const secondAccusation = (targetId) =>
    socket.emit("second_accusation", { roomCode, targetId });
  const castVote = (vote) => socket.emit("cast_vote", { roomCode, vote });
  const togglePrayerPause = (paused) =>
    socket.emit("prayer_pause", { roomCode, paused });
  const handleHunterRevenge = (targetId) =>
    socket.emit("hunter_revenge", { roomCode, targetId });

  // PWA install click handler (used in render)
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* PWA install prompt */}
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
                onClick={handleInstallClick}
                className="px-4 py-2 bg-white text-purple-600 font-semibold rounded"
              >
                Install
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Location setup modal / overlay (optional) */}
      {showLocationSetup && (
        <LocationPermission onLocationSet={handleLocationSet} />
      )}
      

      <PrayerNotification 
  location={userLocation} 
  onLocationChange={handleChangeLocation}
/>

      {/* Toasts */}
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

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-purple-900/90 rounded-lg p-8 border-2 border-purple-500 shadow-2xl">
            <LoadingSpinner size="xl" text={loadingMessage} />
          </div>
        </div>
      )}

      {/* Role reveal modal */}
      {showRoleReveal && myRole && (
        <RoleReveal
          role={myRole}
          onComplete={() => {
            setShowRoleReveal(false);
            setScreen("game");
          }}
        />
      )}

      {/* Screens */}
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
}

export default App;
