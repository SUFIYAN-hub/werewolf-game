import React, { useState } from 'react';
import { Users, ThumbsUp, ThumbsDown, AlertTriangle, Check, Clock } from 'lucide-react';

function VotingPhase({ gameState, isAlive, onCastVote }) {
  const [myVote, setMyVote] = useState(null);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  const votingTarget = gameState?.players?.find(
    p => p.id === gameState?.dayActions?.votingTarget
  );
  const votes = gameState?.dayActions?.votes || {};
  const totalVotes = Object.keys(votes).length;
  const alivePlayers = gameState?.players?.filter(p => p.isAlive) || [];
  const yesVotes = Object.values(votes).filter(v => v === true).length;
  const noVotes = Object.values(votes).filter(v => v === false).length;
  const myPlayer = gameState?.players?.find(p => p.isMe);
  const hasVoted = myPlayer?.id && votes.hasOwnProperty(myPlayer.id);

  const handleVote = (vote) => {
    if (!isAlive || voteSubmitted || hasVoted) return;
    setMyVote(vote);
    onCastVote(vote);
    setVoteSubmitted(true);
  };

  const votePercentage = alivePlayers.length > 0 
    ? Math.round((totalVotes / alivePlayers.length) * 100) 
    : 0;

  if (!votingTarget) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">No Vote in Progress</h3>
        <p className="text-purple-200">
          Waiting for someone to be accused...
        </p>
      </div>
    );
  }

  if (!isAlive) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-md rounded-lg p-8 border border-gray-600">
        <div className="text-center mb-6">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-30" />
          <h3 className="text-2xl font-bold text-gray-400 mb-2">You Are Dead</h3>
          <p className="text-gray-500">
            Watch the voting unfold...
          </p>
        </div>

        {/* Dead players can see voting results */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="text-center mb-4">
            <h4 className="text-white font-bold text-xl mb-2">Voting on: {votingTarget.name}</h4>
            <p className="text-gray-400 text-sm">
              {totalVotes} / {alivePlayers.length} votes cast ({votePercentage}%)
            </p>
          </div>

          {/* Vote Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-300">Guilty ({yesVotes})</span>
                <span className="text-red-400">{alivePlayers.length > 0 ? Math.round((yesVotes / alivePlayers.length) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="bg-red-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${alivePlayers.length > 0 ? (yesVotes / alivePlayers.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-300">Innocent ({noVotes})</span>
                <span className="text-green-400">{alivePlayers.length > 0 ? Math.round((noVotes / alivePlayers.length) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${alivePlayers.length > 0 ? (noVotes / alivePlayers.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-red-700 to-pink-700 rounded-lg p-8 border-2 border-red-400 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <Users className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Voting Phase</h2>
        <p className="text-red-100 text-lg">
          Cast your vote on: <span className="font-bold text-white">{votingTarget.name}</span>
        </p>
      </div>

      {/* Voting Progress */}
      <div className="bg-black/30 rounded-lg p-6 mb-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Voting Progress
          </h3>
          <span className="text-white text-sm">
            {totalVotes} / {alivePlayers.length} votes ({votePercentage}%)
          </span>
        </div>

        {/* Vote Bars */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-red-300 font-semibold">Guilty - Eliminate</span>
              <span className="text-red-200">{yesVotes} votes ({alivePlayers.length > 0 ? Math.round((yesVotes / alivePlayers.length) * 100) : 0}%)</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-6 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center"
                style={{ width: `${alivePlayers.length > 0 ? (yesVotes / alivePlayers.length) * 100 : 0}%` }}
              >
                {yesVotes > 0 && (
                  <span className="text-white text-xs font-bold">{yesVotes}</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-green-300 font-semibold">Innocent - Save</span>
              <span className="text-green-200">{noVotes} votes ({alivePlayers.length > 0 ? Math.round((noVotes / alivePlayers.length) * 100) : 0}%)</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-6 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center"
                style={{ width: `${alivePlayers.length > 0 ? (noVotes / alivePlayers.length) * 100 : 0}%` }}
              >
                {noVotes > 0 && (
                  <span className="text-white text-xs font-bold">{noVotes}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Majority indicator */}
        <div className="mt-4 text-center">
          <p className="text-white/80 text-sm">
            Need {Math.ceil(alivePlayers.length / 2) + 1} votes for majority
          </p>
        </div>
      </div>

      {/* Vote Submitted */}
      {(voteSubmitted || hasVoted) && (
        <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-6 mb-6 animate-pulse">
          <div className="flex items-center space-x-3">
            <Check className="w-8 h-8 text-green-400" />
            <div>
              <h4 className="text-white font-bold text-lg">Vote Submitted!</h4>
              <p className="text-green-200">
                You voted: {myVote ? (
                  <span className="text-red-300 font-bold">GUILTY</span>
                ) : (
                  <span className="text-green-300 font-bold">INNOCENT</span>
                )}
              </p>
              <p className="text-green-100 text-sm mt-1">
                Waiting for other players to vote...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Voting Buttons */}
      {!voteSubmitted && !hasVoted && (
        <div className="grid grid-cols-2 gap-6">
          {/* Guilty Button */}
          <button
            onClick={() => handleVote(true)}
            className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-8 px-6 rounded-xl border-4 border-red-400 transition-all transform hover:scale-105 shadow-2xl"
          >
            <ThumbsDown className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-2xl font-bold mb-2">GUILTY</h3>
            <p className="text-red-100 text-sm">
              Eliminate {votingTarget.name}
            </p>
          </button>

          {/* Innocent Button */}
          <button
            onClick={() => handleVote(false)}
            className="bg-gradient-to-br from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-bold py-8 px-6 rounded-xl border-4 border-green-400 transition-all transform hover:scale-105 shadow-2xl"
          >
            <ThumbsUp className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-2xl font-bold mb-2">INNOCENT</h3>
            <p className="text-green-100 text-sm">
              Save {votingTarget.name}
            </p>
          </button>
        </div>
      )}

      {/* Voting Instructions */}
      <div className="mt-8 bg-white/10 rounded-lg p-4 border border-white/20">
        <h4 className="text-white font-semibold mb-2 text-sm flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400" />
          How Voting Works
        </h4>
        <ul className="text-white/90 text-sm space-y-1 ml-6">
          <li>• Each alive player gets one vote</li>
          <li>• A majority is needed to eliminate (more than half)</li>
          <li>• If no majority, the accused player survives</li>
          <li>• Vote carefully - werewolves vote too!</li>
        </ul>
      </div>

      {/* Defense Time Indicator */}
      <div className="mt-6 bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
        <p className="text-yellow-200 text-sm text-center">
          ⏱️ <strong>{votingTarget.name}</strong> has had 30 seconds to defend themselves
        </p>
      </div>
    </div>
  );
}

export default VotingPhase;