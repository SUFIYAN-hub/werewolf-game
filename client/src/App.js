import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import HomeScreen from "./components/HomeScreen";
import LobbyScreen from "./components/LobbyScreen";
import GameScreen from "./components/GameScreen";
import PrayerNotification from "./components/PrayerNotification";
import RoleReveal from "./components/RoleReveal";

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

  useEffect(() => {
    // Listen for room created
    socket.on("room_created", (data) => {
      setRoomCode(data.roomCode);
      setScreen("lobby");
    });

    // Listen for room joined
    socket.on("room_joined", (data) => {
      setRoomCode(data.roomCode);
      setScreen("lobby");
    });

    // Listen for room updates
    socket.on("room_update", (data) => {
      setGameState(data);
    });

    // Listen for role assignment
    // socket.on('role_assigned', (data) => {
    //   setMyRole(data.role);
    //   setGameState(data.gameState);
    //   setScreen('game');
    // });

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
      setError(data.message);
      setTimeout(() => setError(""), 3000);
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
      socket.off('hunter_revenge_prompt');
    };
  }, [gameState]);

  const createRoom = (name, loc) => {
    setPlayerName(name);
    setLocation(loc);
    socket.emit("create_room", { playerName: name, location: loc });
  };

  const joinRoom = (name, loc, code) => {
    setPlayerName(name);
    setLocation(loc);
    setRoomCode(code);
    socket.emit("join_room", {
      playerName: name,
      location: loc,
      roomCode: code,
    });
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
      <PrayerNotification location={location} />

      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
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
      <PrayerNotification location={location} />

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
