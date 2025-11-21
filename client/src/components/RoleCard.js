import React from "react";
import {
  Moon,
  Eye,
  Heart,
  Users,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

function RoleCard({ role, isAlive }) {
  const getRoleInfo = () => {
    switch (role) {
      case "werewolf":
        return {
          name: "Werewolf",
          icon: <Moon className="w-8 h-8" />,
          color: "from-red-600 to-red-800",
          borderColor: "border-red-500",
          description:
            "You are a Werewolf! Work with other werewolves to eliminate villagers during the night.",
          ability: "Each night, choose one player to eliminate.",
          goal: "Eliminate villagers until werewolves equal or outnumber them.",
          bgPattern: "bg-red-900/20",
        };
      case "seer":
        return {
          name: "Seer",
          icon: <Eye className="w-8 h-8" />,
          color: "from-blue-600 to-blue-800",
          borderColor: "border-blue-500",
          description:
            "You are the Seer! You can see the true identity of players.",
          ability:
            "Each night, choose one player to learn if they are a werewolf or not.",
          goal: "Help the village identify and eliminate all werewolves.",
          bgPattern: "bg-blue-900/20",
        };
      case "doctor":
        return {
          name: "Doctor",
          icon: <Heart className="w-8 h-8" />,
          color: "from-green-600 to-green-800",
          borderColor: "border-green-500",
          description:
            "You are the Doctor! You can save one person each night.",
          ability:
            "Each night, choose one player to protect from werewolf attacks. You can save yourself.",
          goal: "Protect the village and help eliminate all werewolves.",
          bgPattern: "bg-green-900/20",
        };
      case "villager":
        return {
          name: "Villager",
          icon: <Users className="w-8 h-8" />,
          color: "from-purple-600 to-purple-800",
          borderColor: "border-purple-500",
          description:
            "You are a Villager! Use your wit and logic to find the werewolves.",
          ability:
            "During the day, discuss with others and vote to eliminate suspected werewolves.",
          goal: "Work with other villagers to identify and eliminate all werewolves.",
          bgPattern: "bg-purple-900/20",
        };
      case "witch":
        return {
          name: "Witch",
          icon: <Heart className="w-8 h-8" />, // We'll change this to a potion icon
          color: "from-purple-600 to-purple-800",
          borderColor: "border-purple-500",
          description:
            "You are the Witch! You have two powerful potions to use wisely.",
          ability:
            "Life Potion: Save the werewolves' victim (once). Death Potion: Poison any player (once).",
          goal: "Use your potions strategically to help the village eliminate all werewolves.",
          bgPattern: "bg-purple-900/20",
        };

      case "hunter":
        return {
          name: "Hunter",
          icon: <AlertTriangle className="w-8 h-8" />,
          color: "from-orange-600 to-orange-800",
          borderColor: "border-orange-500",
          description:
            "You are the Hunter! When you die, you take someone with you.",
          ability:
            "When eliminated (by werewolves or voting), immediately choose one player to eliminate with your dying shot.",
          goal: "Stay alive and help find werewolves. If killed, take a werewolf with you!",
          bgPattern: "bg-orange-900/20",
        };

      case "detective":
        return {
          name: "Detective",
          icon: <Eye className="w-8 h-8" />,
          color: "from-indigo-600 to-indigo-800",
          borderColor: "border-indigo-500",
          description:
            "You are the Detective! You can investigate if two players are on the same team.",
          ability:
            "Once per game, select two players and learn if they are on the same team (both werewolves/both villagers) or different teams.",
          goal: "Use your investigation wisely to find werewolf pairs or confirm innocent alliances.",
          bgPattern: "bg-indigo-900/20",
        };

      default:
        return {
          name: "Unknown",
          icon: <AlertCircle className="w-8 h-8" />,
          color: "from-gray-600 to-gray-800",
          borderColor: "border-gray-500",
          description: "Waiting for role assignment...",
          ability: "",
          goal: "",
          bgPattern: "bg-gray-900/20",
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div
      className={`bg-gradient-to-br ${roleInfo.color} rounded-lg p-6 border-2 ${
        roleInfo.borderColor
      } shadow-2xl animate-glowPulse ${!isAlive ? "opacity-50 grayscale" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-white">{roleInfo.icon}</div>
          <div>
            <h3 className="text-2xl font-bold text-white">{roleInfo.name}</h3>
            <p className="text-white/80 text-sm">Your Role</p>
          </div>
        </div>

        {!isAlive && (
          <div className="bg-red-500/30 px-3 py-1 rounded-full border border-red-400">
            <span className="text-red-200 text-xs font-semibold">
              ELIMINATED
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <div
        className={`${roleInfo.bgPattern} rounded-lg p-4 mb-4 border border-white/20`}
      >
        <p className="text-white text-sm leading-relaxed">
          {roleInfo.description}
        </p>
      </div>

      {/* Ability */}
      {roleInfo.ability && (
        <div className="mb-3">
          <h4 className="text-white font-semibold text-sm mb-2 flex items-center">
            <span className="mr-2">⚡</span> Special Ability
          </h4>
          <p className="text-white/90 text-sm pl-6">{roleInfo.ability}</p>
        </div>
      )}

      {/* Goal */}
      {roleInfo.goal && (
        <div>
          <h4 className="text-white font-semibold text-sm mb-2 flex items-center">
            <span className="mr-2">🎯</span> Goal
          </h4>
          <p className="text-white/90 text-sm pl-6">{roleInfo.goal}</p>
        </div>
      )}

      {/* Strategy Tips */}
      {isAlive && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <h4 className="text-white font-semibold text-xs mb-2 flex items-center">
            <span className="mr-2">💡</span> Strategy Tip
          </h4>
          <p className="text-white/80 text-xs pl-6">
            {role === "werewolf" &&
              "Coordinate with other werewolves silently at night. During the day, blend in and cast suspicion on others."}
            {role === "seer" &&
              "Be careful when revealing information. If werewolves know you're the Seer, you'll be their prime target."}
            {role === "doctor" &&
              "Try to predict who the werewolves will target. Consider protecting the Seer if revealed."}
            {role === "villager" &&
              "Pay attention to behavior patterns and voting. Logic and deduction are your best weapons."}
            {role === "witch" &&
              "Save your potions for critical moments. Don't waste them early! Can you save yourself? Yes, but use wisely."}
            {role === "hunter" &&
              "Werewolves will fear killing you. Use this to your advantage. If eliminated, choose your target carefully!"}
            {role === "detective" &&
              "Use your one-time check on suspicious pairs. If they're on different teams, one is definitely a werewolf!"}
          </p>
        </div>
      )}
    </div>
  );
}

export default RoleCard;
