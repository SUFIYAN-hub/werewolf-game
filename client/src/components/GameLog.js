import React, { useEffect, useState, useRef } from "react";
import {
  ScrollText,
  Moon,
  Sun,
  Skull,
  Users,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function GameLog({ gameLog }) {
  const logEndRef = useRef(null);
  const logContainerRef = useRef(null);
  const prevLogLengthRef = useRef(0);
  const [userHasScrolled, setUserHasScrolled] = useState(false);

  // Detect if user manually scrolled up
  const handleScroll = () => {
    if (logContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setUserHasScrolled(!isAtBottom);
    }
  };

  // Auto-scroll ONLY if user is at bottom AND new message arrived
  useEffect(() => {
    if (gameLog && gameLog.length > prevLogLengthRef.current) {
      // Only auto-scroll if user hasn't manually scrolled up
      if (!userHasScrolled && logEndRef.current && logContainerRef.current) {
        // Scroll within the container only, not the whole page
        logContainerRef.current.scrollTop =
          logContainerRef.current.scrollHeight;
      }
      prevLogLengthRef.current = gameLog.length;
    }
  }, [gameLog, userHasScrolled]);

  const getLogIcon = (type) => {
    switch (type) {
      case "game_start":
        return <Moon className="w-4 h-4 text-purple-400" />;
      case "phase_change":
        return <Sun className="w-4 h-4 text-yellow-400" />;
      case "elimination":
        return <Skull className="w-4 h-4 text-red-400" />;
      case "voting_started":
        return <Users className="w-4 h-4 text-orange-400" />;
      case "vote_failed":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "chat":
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case "accusation":
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "game_over":
        return <Users className="w-4 h-4 text-green-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLogStyle = (type) => {
    switch (type) {
      case "game_start":
        return {
          bg: "bg-purple-900/30",
          border: "border-purple-500/50",
          text: "text-purple-200",
        };
      case "phase_change":
        return {
          bg: "bg-blue-900/30",
          border: "border-blue-500/50",
          text: "text-blue-200",
        };
      case "elimination":
        return {
          bg: "bg-red-900/30",
          border: "border-red-500/50",
          text: "text-red-200",
        };
      case "voting_started":
        return {
          bg: "bg-orange-900/30",
          border: "border-orange-500/50",
          text: "text-orange-200",
        };
      case "vote_failed":
        return {
          bg: "bg-yellow-900/30",
          border: "border-yellow-500/50",
          text: "text-yellow-200",
        };
      case "chat":
        return {
          bg: "bg-gray-900/30",
          border: "border-gray-500/50",
          text: "text-gray-200",
        };
      case "accusation":
        return {
          bg: "bg-red-900/30",
          border: "border-red-500/50",
          text: "text-red-200",
        };
      case "game_over":
        return {
          bg: "bg-green-900/30",
          border: "border-green-500/50",
          text: "text-green-200",
        };
      default:
        return {
          bg: "bg-white/10",
          border: "border-white/20",
          text: "text-white",
        };
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  if (!gameLog || gameLog.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <div className="flex items-center justify-center mb-4">
          <ScrollText className="mr-2 text-purple-400" />
          <h3 className="text-xl font-bold text-white">Game Log</h3>
        </div>
        <p className="text-center text-purple-200 text-sm">
          Game events will appear here...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="bg-black/30 px-6 py-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center">
            <ScrollText className="mr-2" />
            Game Log
          </h3>
          <span className="text-sm text-purple-200">
            {gameLog.length} events
          </span>
        </div>
      </div>

      {/* Log Entries */}
      <div
        ref={logContainerRef}
        onScroll={handleScroll}
        className="p-4 max-h-96 overflow-y-auto custom-scrollbar"
      >
        <div className="space-y-2">
          <AnimatePresence>
            {gameLog.map((log, index) => {
              const style = getLogStyle(log.type);

              return (
                <motion.div
                  key={log.timestamp || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className={`${style.bg} border ${style.border} rounded-lg p-3 transition-all hover:scale-101`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className="mt-1">{getLogIcon(log.type)}</div>

                    {/* Text */}
                    <div className="flex-1">
                      <p className={`text-sm ${style.text}`}>{log.message}</p>
                      <p className="text-xs text-gray-400">
                        {formatTime(log.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Auto-scroll anchor */}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* Footer tip */}
      <div className="bg-black/30 px-6 py-3 border-t border-white/20">
        <p className="text-xs text-purple-200 text-center">
          💡 All game events are logged here for reference
        </p>
      </div>
    </div>
  );
}

export default GameLog;
