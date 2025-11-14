import React, { useEffect, useRef } from 'react';
import { ScrollText, Moon, Sun, Skull, Users, MessageSquare, AlertTriangle } from 'lucide-react';

function GameLog({ gameLog }) {
  const logEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameLog]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'game_start':
        return <Moon className="w-4 h-4 text-purple-400" />;
      case 'phase_change':
        return <Sun className="w-4 h-4 text-yellow-400" />;
      case 'elimination':
        return <Skull className="w-4 h-4 text-red-400" />;
      case 'voting_started':
        return <Users className="w-4 h-4 text-orange-400" />;
      case 'vote_failed':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'accusation':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'game_over':
        return <Users className="w-4 h-4 text-green-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLogStyle = (type) => {
    switch (type) {
      case 'game_start':
        return {
          bg: 'bg-purple-900/30',
          border: 'border-purple-500/50',
          text: 'text-purple-200'
        };
      case 'phase_change':
        return {
          bg: 'bg-blue-900/30',
          border: 'border-blue-500/50',
          text: 'text-blue-200'
        };
      case 'elimination':
        return {
          bg: 'bg-red-900/30',
          border: 'border-red-500/50',
          text: 'text-red-200'
        };
      case 'voting_started':
        return {
          bg: 'bg-orange-900/30',
          border: 'border-orange-500/50',
          text: 'text-orange-200'
        };
      case 'vote_failed':
        return {
          bg: 'bg-yellow-900/30',
          border: 'border-yellow-500/50',
          text: 'text-yellow-200'
        };
      case 'chat':
        return {
          bg: 'bg-gray-900/30',
          border: 'border-gray-500/50',
          text: 'text-gray-200'
        };
      case 'accusation':
        return {
          bg: 'bg-red-900/30',
          border: 'border-red-500/50',
          text: 'text-red-200'
        };
      case 'game_over':
        return {
          bg: 'bg-green-900/30',
          border: 'border-green-500/50',
          text: 'text-green-200'
        };
      default:
        return {
          bg: 'bg-white/10',
          border: 'border-white/20',
          text: 'text-white'
        };
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
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
      <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
          {gameLog.map((log, index) => {
            const style = getLogStyle(log.type);
            
            return (
              <div
                key={index}
                className={`${style.bg} border ${style.border} rounded-lg p-3 transition-all hover:scale-101`}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="mt-1">
                    {getLogIcon(log.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Chat message format */}
                    {log.type === 'chat' && (
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {log.player}
                        </p>
                        <p className={`${style.text} text-sm mt-1`}>
                          {log.message}
                        </p>
                      </div>
                    )}

                    {/* System message format */}
                    {log.type !== 'chat' && (
                      <p className={`${style.text} text-sm font-medium`}>
                        {log.message}
                      </p>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(log.timestamp)}
                    </p>
                  </div>

                  {/* Special indicators */}
                  {log.type === 'elimination' && (
                    <div className="flex-shrink-0">
                      <Skull className="w-5 h-5 text-red-400" />
                    </div>
                  )}

                  {log.type === 'game_over' && (
                    <div className="flex-shrink-0">
                      <span className="text-2xl">🏆</span>
                    </div>
                  )}
                </div>

                {/* Additional info for eliminations */}
                {log.type === 'elimination' && log.role && (
                  <div className="mt-2 ml-7 bg-black/30 rounded px-2 py-1 inline-block">
                    <span className="text-xs text-gray-300">
                      Role: <span className="text-white capitalize font-semibold">{log.role}</span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          
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