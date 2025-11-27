/**
 * SwipeCard Component
 * Displays a profile card with swipe functionality
 */

import { useState } from 'react';
import type { DatingProfile } from '../services/datingService';

interface SwipeCardProps {
  profile: DatingProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  isLoading?: boolean;
}

export const SwipeCard = ({ profile, onSwipe, isLoading = false }: SwipeCardProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const nextPhoto = () => {
    if (currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isLoading) return;
    onSwipe(direction);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-dchico-border">
        {/* Photo */}
        <div className="relative aspect-[3/4] bg-dchico-panel">
          {profile.photos.length > 0 ? (
            <>
              <img
                src={profile.photos[currentPhotoIndex]}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
              
              {/* Photo navigation */}
              {profile.photos.length > 1 && (
                <>
                  {/* Left half - previous photo */}
                  <button
                    onClick={prevPhoto}
                    className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
                    disabled={currentPhotoIndex === 0}
                  />
                  
                  {/* Right half - next photo */}
                  <button
                    onClick={nextPhoto}
                    className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
                    disabled={currentPhotoIndex === profile.photos.length - 1}
                  />
                  
                  {/* Photo indicators */}
                  <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-4">
                    {profile.photos.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          index === currentPhotoIndex
                            ? 'bg-white'
                            : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-dchico-muted">
              No photo
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Basic info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-2xl font-bold mb-1">
              {profile.name || profile.alias}, {profile.age}
            </h2>
            {profile.bio && (
              <p className="text-sm text-white/90 line-clamp-2">{profile.bio}</p>
            )}
          </div>

          {/* Info button */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        {/* Extended info panel */}
        {showInfo && (
          <div className="p-6 space-y-4 max-h-64 overflow-y-auto">
            {profile.bio && (
              <div>
                <h3 className="text-sm font-semibold text-dchico-accent mb-1">About</h3>
                <p className="text-sm text-dchico-text">{profile.bio}</p>
              </div>
            )}
            
            {profile.interests && (
              <div>
                <h3 className="text-sm font-semibold text-dchico-accent mb-1">Interests</h3>
                <p className="text-sm text-dchico-text">{profile.interests}</p>
              </div>
            )}

            {profile.ethnicity && (
              <div>
                <h3 className="text-sm font-semibold text-dchico-accent mb-1">Ethnicity</h3>
                <p className="text-sm text-dchico-text">{profile.ethnicity}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-6 mt-6">
        {/* Pass button */}
        <button
          onClick={() => handleSwipe('left')}
          disabled={isLoading}
          className="w-16 h-16 rounded-full bg-white border-2 border-red-500 flex items-center justify-center shadow-lg hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Pass"
        >
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Like button */}
        <button
          onClick={() => handleSwipe('right')}
          disabled={isLoading}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-dchico-accent to-dchico-accent-secondary flex items-center justify-center shadow-lg shadow-dchico-accent/30 hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Like"
        >
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-3xl flex items-center justify-center">
          <div className="text-dchico-accent font-semibold">Processing...</div>
        </div>
      )}
    </div>
  );
};
