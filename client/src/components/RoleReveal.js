// import React, { useState, useEffect } from "react";
// import { Moon, Eye, Heart, Users } from "lucide-react";
// import { playTypingSound, playRevealSound } from "../utils/sounds";

// function RoleReveal({ role, onComplete }) {
//   const [displayedText, setDisplayedText] = useState("");
//   const [showRole, setShowRole] = useState(false);
//   const [fadeOut, setFadeOut] = useState(false);

//   const getRoleInfo = () => {
//     switch (role) {
//       case "werewolf":
//         return {
//           title: "WEREWOLF",
//           color: "from-red-600 to-red-900",
//           icon: <Moon className="w-32 h-32" />,
//           sound: "🐺",
//           description: "Hunt in the shadows...",
//         };
//       case "seer":
//         return {
//           title: "SEER",
//           color: "from-blue-600 to-blue-900",
//           icon: <Eye className="w-32 h-32" />,
//           sound: "👁️",
//           description: "See the truth...",
//         };
//       case "doctor":
//         return {
//           title: "DOCTOR",
//           color: "from-green-600 to-green-900",
//           icon: <Heart className="w-32 h-32" />,
//           sound: "💚",
//           description: "Save the innocent...",
//         };
//       case "villager":
//         return {
//           title: "VILLAGER",
//           color: "from-purple-600 to-purple-900",
//           icon: <Users className="w-32 h-32" />,
//           sound: "👥",
//           description: "Find the werewolves...",
//         };
//       default:
//         return {
//           title: "UNKNOWN",
//           color: "from-gray-600 to-gray-900",
//           icon: <Users className="w-32 h-32" />,
//           sound: "❓",
//           description: "Your role...",
//         };
//     }
//   };

//   const roleInfo = getRoleInfo();
//   const fullText = `YOU ARE THE ${roleInfo.title}`;

//   // Keyboard typing sounds (using Web Audio API)
//   const playKeyboardSound = () => {
//     const audioContext = new (window.AudioContext ||
//       window.webkitAudioContext)();
//     const oscillator = audioContext.createOscillator();
//     const gainNode = audioContext.createGain();

//     oscillator.connect(gainNode);
//     gainNode.connect(audioContext.destination);

//     // Keyboard click sound (short beep)
//     oscillator.frequency.value = 800 + Math.random() * 200; // Vary pitch slightly
//     oscillator.type = "square";

//     gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
//     gainNode.gain.exponentialRampToValueAtTime(
//       0.01,
//       audioContext.currentTime + 0.05
//     );

//     oscillator.start(audioContext.currentTime);
//     oscillator.stop(audioContext.currentTime + 0.05);
//   };

//   // Typewriter effect
//   useEffect(() => {
//     if (displayedText.length < fullText.length) {
//       const timeout = setTimeout(() => {
//         setDisplayedText(fullText.slice(0, displayedText.length + 1));
//         playTypingSound();
//       }, 100); // 100ms per character

//       return () => clearTimeout(timeout);
//     } else {
//       // Text complete, show role icon after 500ms
//       const timeout = setTimeout(() => {
//         setShowRole(true);
//       }, 500);

//       // Start fade out after 3 seconds
//       const fadeTimeout = setTimeout(() => {
//         setFadeOut(true);
//       }, 3000);

//       // Complete the reveal after fade out
//       const completeTimeout = setTimeout(() => {
//         onComplete();
//       }, 4000);

//       // When role appears, add:
//       useEffect(() => {
//         if (showRole) {
//           playRevealSound();
//         }
//       }, [showRole]);

//       return () => {
//         clearTimeout(timeout);
//         clearTimeout(fadeTimeout);
//         clearTimeout(completeTimeout);
//       };
//     }
//   }, [displayedText, fullText, onComplete]);

//   return (
//     <div
//       className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-1000 ${
//         fadeOut ? "opacity-0" : "opacity-100"
//       }`}
//     >
//       {/* Blurred Background */}
//       <div className="absolute inset-0 backdrop-blur-3xl bg-black/80" />

//       {/* Content */}
//       <div className="relative z-10 text-center px-4">
//         {/* Typewriter Text */}
//         <div className="mb-12">
//           <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-4 font-mono tracking-wider">
//             {displayedText}
//             <span className="animate-pulse">|</span>
//           </h1>
//         </div>

//         {/* Role Icon and Details (appears after typing) */}
//         {showRole && (
//           <div
//             className={`bg-gradient-to-br ${roleInfo.color} rounded-3xl p-12 border-4 border-white/30 shadow-2xl animate-fadeIn`}
//           >
//             <div className="text-white mb-6 flex justify-center animate-bounce">
//               {roleInfo.icon}
//             </div>
//             <div className="text-8xl mb-6 animate-pulse">{roleInfo.sound}</div>
//             <p className="text-3xl text-white font-bold mb-4">
//               {roleInfo.title}
//             </p>
//             <p className="text-xl text-white/80 italic">
//               {roleInfo.description}
//             </p>
//           </div>
//         )}

//         {/* Skip button */}
//         <button
//           onClick={() => {
//             setFadeOut(true);
//             setTimeout(onComplete, 500);
//           }}
//           className="absolute bottom-10 right-10 text-white/50 hover:text-white text-sm transition-colors"
//         >
//           Press any key to continue...
//         </button>
//       </div>
//     </div>
//   );
// }

// export default RoleReveal;

import React, { useState, useEffect } from "react";
import { Moon, Eye, Heart, Users } from "lucide-react";
import { playTypingSound, playRevealSound } from "../utils/sounds";

function RoleReveal({ role, onComplete }) {
  const [displayedText, setDisplayedText] = useState("");
  const [showRole, setShowRole] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const getRoleInfo = () => {
    switch (role) {
      case "werewolf":
        return {
          title: "WEREWOLF",
          color: "from-red-600 to-red-900",
          icon: <Moon className="w-32 h-32" />,
          sound: "🐺",
          description: "Hunt in the shadows...",
        };
      case "seer":
        return {
          title: "SEER",
          color: "from-blue-600 to-blue-900",
          icon: <Eye className="w-32 h-32" />,
          sound: "👁️",
          description: "See the truth...",
        };
      case "doctor":
        return {
          title: "DOCTOR",
          color: "from-green-600 to-green-900",
          icon: <Heart className="w-32 h-32" />,
          sound: "💚",
          description: "Save the innocent...",
        };
      case "villager":
        return {
          title: "VILLAGER",
          color: "from-purple-600 to-purple-900",
          icon: <Users className="w-32 h-32" />,
          sound: "👥",
          description: "Find the werewolves...",
        };
        case 'witch':
      return {
        title: 'WITCH',
        color: 'from-purple-600 to-purple-900',
        icon: <Heart className="w-32 h-32" />,
        sound: '🧪',
        description: 'Master of potions...'
      };
      
    case 'hunter':
      return {
        title: 'HUNTER',
        color: 'from-orange-600 to-orange-900',
        icon: <Moon className="w-32 h-32" />,
        sound: '🏹',
        description: 'Never die alone...'
      };
    case 'detective':
      return {
        title: 'DETECTIVE',
        color: 'from-indigo-600 to-indigo-900',
        icon: <Eye className="w-32 h-32" />,
        sound: '🔍',
        description: 'Uncover the truth...'
      };
      default:
        return {
          title: "UNKNOWN",
          color: "from-gray-600 to-gray-900",
          icon: <Users className="w-32 h-32" />,
          sound: "❓",
          description: "Your role...",
        };
    }
  };

  const roleInfo = getRoleInfo();
  const fullText = `YOU ARE THE ${roleInfo.title}`;

  // ---------------------------------------
  // 1️⃣ Skip Reveal with ANY KEY PRESS
  // ---------------------------------------
  useEffect(() => {
    const handleKeyPress = () => {
      setFadeOut(true);
      setTimeout(onComplete, 500);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onComplete]);

  // ---------------------------------------
  // 2️⃣ Typewriter Effect
  // ---------------------------------------
  useEffect(() => {
    if (displayedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
        playTypingSound();
      }, 100);

      return () => clearTimeout(timeout);
    } else {
      const showTimeout = setTimeout(() => setShowRole(true), 500);
      const fadeTimeout = setTimeout(() => setFadeOut(true), 3000);
      const completeTimeout = setTimeout(() => onComplete(), 4000);

      return () => {
        clearTimeout(showTimeout);
        clearTimeout(fadeTimeout);
        clearTimeout(completeTimeout);
      };
    }
  }, [displayedText, fullText, onComplete]);

  // ---------------------------------------
  // 3️⃣ Play reveal sound when role shows
  // ---------------------------------------
  useEffect(() => {
    if (showRole) playRevealSound();
  }, [showRole]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 backdrop-blur-3xl bg-black/80" />

      <div className="relative z-10 text-center px-4">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-4 font-mono tracking-wider">
            {displayedText}
            <span className="animate-pulse">|</span>
          </h1>
        </div>

        {showRole && (
          <div
            className={`bg-gradient-to-br ${roleInfo.color} rounded-3xl p-12 border-4 border-white/30 shadow-2xl animate-fadeIn`}
          >
            <div className="text-white mb-6 flex justify-center animate-bounce">
              {roleInfo.icon}
            </div>
            <div className="text-8xl mb-6 animate-pulse">{roleInfo.sound}</div>
            <p className="text-3xl text-white font-bold mb-4">
              {roleInfo.title}
            </p>
            <p className="text-xl text-white/80 italic">
              {roleInfo.description}
            </p>
          </div>
        )}

        <button
          onClick={() => {
            setFadeOut(true);
            setTimeout(onComplete, 500);
          }}
          className="absolute bottom-10 right-10 text-white/50 hover:text-white text-sm transition-colors"
        >
          Press any key to continue...
        </button>
      </div>
    </div>
  );
}

export default RoleReveal;
