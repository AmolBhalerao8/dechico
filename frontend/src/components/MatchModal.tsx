/**
 * MatchModal Component
 * Displays "It's a Match!" celebration
 */

import type { DatingProfile } from '../services/datingService';

interface MatchModalProps {
  show: boolean;
  matchedProfile: DatingProfile | null;
  onClose: () => void;
  onSendMessage?: () => void;
}

export const MatchModal = ({ show, matchedProfile, onClose, onSendMessage }: MatchModalProps) => {
  if (!show || !matchedProfile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md mx-4">
        {/* Celebration */}
        <div className="text-center mb-8 animate-bounceIn">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary mb-2">
            It's a Match!
          </h1>
          <p className="text-white/90 text-lg">
            You and {matchedProfile.name || matchedProfile.alias} liked each other
          </p>
        </div>

        {/* Profile cards */}
        <div className="relative h-64 mb-8">
          {/* Matched user's card */}
          <div className="absolute left-0 top-0 w-48 h-64 rounded-2xl overflow-hidden shadow-2xl transform -rotate-6 animate-slideInLeft">
            {matchedProfile.photos[0] ? (
              <img
                src={matchedProfile.photos[0]}
                alt={matchedProfile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-dchico-panel flex items-center justify-center text-dchico-muted">
                No photo
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white font-semibold text-sm truncate">
                {matchedProfile.name || matchedProfile.alias}
              </p>
            </div>
          </div>

          {/* Current user's placeholder card */}
          <div className="absolute right-0 top-0 w-48 h-64 rounded-2xl overflow-hidden shadow-2xl transform rotate-6 animate-slideInRight bg-gradient-to-br from-dchico-accent to-dchico-accent-secondary">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-6xl">💛</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white font-semibold text-sm">You</p>
            </div>
          </div>

          {/* Heart animation */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-6xl animate-ping">💕</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {onSendMessage && (
            <button
              onClick={onSendMessage}
              className="w-full rounded-full bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary py-4 text-white font-semibold shadow-lg shadow-dchico-accent/30 hover:brightness-110 transition"
            >
              Send Message
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full rounded-full bg-white/10 backdrop-blur py-4 text-white font-semibold hover:bg-white/20 transition"
          >
            Keep Swiping
          </button>
        </div>
      </div>

      {/* Confetti effect (optional) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100px) rotate(-6deg); opacity: 0; }
          to { transform: translateX(0) rotate(-6deg); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100px) rotate(6deg); opacity: 0; }
          to { transform: translateX(0) rotate(6deg); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};
