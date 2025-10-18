import React from 'react';
import { Award, Flame, TrendingUp, Eye } from 'lucide-react';

const Progress = ({ progress, activeChallenge, badges, streak, onViewBadges }) => {
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'text-green-400';
    if (progress >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressWidth = (progress) => {
    return Math.min(Math.max(progress, 0), 100);
  };

  const getProgressMessage = (progress) => {
    if (!activeChallenge) {
      return "Start a challenge to begin tracking your progress!";
    }
    
    if (progress >= 100) {
      return "🎉 Amazing! You've completed your challenge!";
    } else if (progress >= 80) {
      return "You're doing great! Almost there!";
    } else if (progress >= 50) {
      return "Good progress! Keep going!";
    } else if (progress >= 25) {
      return "You're on your way! Every expense logged helps.";
    } else {
      return "Start logging expenses to build your progress!";
    }
  };

  const earnedBadges = badges.filter(badge => badge.badgeId);
  console.log('Earned badges in Progress component:', earnedBadges);

  return (
    <section className="bg-[#2D2D2D] p-5 rounded-[10px] border border-[#444] mb-5">
      <div className="flex items-center gap-3 mb-5">
        <img src="/images/your-progress.png" alt="Progress Icon" className="w-6 h-6" />
        <h2 className="text-white font-semibold text-xl">Your Progress</h2>
      </div>

      {activeChallenge ? (
        <div id="progress-content">
          {/* Progress Bar */}
          <div className="progress-container mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#E0E0E0] text-sm">Challenge Progress</span>
              <span className={`font-semibold ${getProgressColor(progress)}`}>
                {progress}%
              </span>
            </div>
            <div className="w-full h-4 bg-[#444] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#4CAF50] to-[#81C784] transition-all duration-500 ease-out"
                style={{ width: `${getProgressWidth(progress)}%` }}
              />
            </div>
          </div>

          {/* Streak Information */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-[#E0E0E0]">
                Current Streak: <span className="font-semibold text-white">{streak}</span> days
              </span>
            </div>
          </div>

          {/* Progress Feedback */}
          <div className="bg-[#3D3D3D] p-3 rounded border border-[#444] mb-4">
            <p className="text-[#E0E0E0] text-sm">
              {getProgressMessage(progress)}
            </p>
          </div>

          {/* BADGES SECTION */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span className="text-[#E0E0E0] font-semibold">Your Badges</span>
              </div>
              {earnedBadges.length > 0 && (
                <button
                  onClick={onViewBadges}
                  className="flex items-center gap-1 text-[#B7FF00] hover:text-[#a3e600] text-sm transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View All
                </button>
              )}
            </div>
            
            {earnedBadges.length === 0 ? (
              <div className="text-center py-4 bg-[#3D3D3D] rounded border border-[#444]">
                <Award className="w-8 h-8 text-[#A9A9A9] mx-auto mb-2" />
                <p className="text-[#A9A9A9] text-sm">
                  No badges yet. Log expenses for 3 consecutive days to earn your first badge!
                </p>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {earnedBadges.slice(0, 5).map((userBadge, index) => {
                  const badge = userBadge.badgeId;
                  if (!badge) return null;
                  
                  return (
                    <div key={badge._id || index} className="relative group">
                      <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-[#181818]" />
                      </div>
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-[#181818] text-white text-xs p-2 rounded shadow-lg z-10 whitespace-nowrap">
                        {badge.name || badge.title || `Badge ${index + 1}`}
                      </div>
                    </div>
                  );
                })}
                {earnedBadges.length > 5 && (
                  <div 
                    className="w-10 h-10 bg-[#444] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#555] transition-colors"
                    onClick={onViewBadges}
                    title="View all badges"
                  >
                    <span className="text-[#E0E0E0] text-sm">+{earnedBadges.length - 5}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div id="progress-complete" className="text-center py-4">
          <div className="badge-container mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-10 h-10 text-[#181818]" />
            </div>
          </div>
          <p className="text-[#E0E0E0] mb-4">
            {streak > 0 
              ? `You're on a ${streak}-day streak! Start a new challenge to keep it going and earn rewards.`
              : "Complete challenges to earn badges and build your streak! Start a challenge to begin your journey."
            }
          </p>
          
          {/* BADGES SECTION FOR NO ACTIVE CHALLENGE */}
          <div className="mt-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-[#E0E0E0] font-semibold">Your Badges</span>
            </div>
            
            {earnedBadges.length === 0 ? (
              <div className="bg-[#3D3D3D] p-4 rounded border border-[#444] mb-4">
                <p className="text-[#A9A9A9] text-sm mb-2">
                  No badges earned yet.
                </p>
                <p className="text-[#B7FF00] text-xs">
                  Log expenses for 3 consecutive days to earn your first badge!
                </p>
              </div>
            ) : (
              <div className="flex justify-center gap-2 mb-4">
                {earnedBadges.slice(0, 3).map((userBadge, index) => {
                  const badge = userBadge.badgeId;
                  if (!badge) return null;
                  
                  return (
                    <div key={badge._id || index} className="relative group">
                      <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-[#181818]" />
                      </div>
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-[#181818] text-white text-xs p-2 rounded shadow-lg z-10 whitespace-nowrap">
                        {badge.name || badge.title || `Badge ${index + 1}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {earnedBadges.length > 0 && (
              <button
                onClick={onViewBadges}
                className="px-4 py-2 bg-[#B7FF00] text-[#181818] font-semibold rounded hover:bg-[#a3e600] transition-colors flex items-center gap-2 mx-auto"
              >
                <Award className="w-4 h-4" />
                View Badge Collection
              </button>
            )}
          </div>
        </div>
      )}

      {/* Challenge Status */}
      {activeChallenge && (
        <div className="mt-4 p-3 bg-[#3D3D3D] rounded border border-[#444]">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${progress >= 100 ? 'bg-green-400' : 'bg-blue-400'} animate-pulse`} />
            <span className="text-[#E0E0E0] text-sm">
              {progress >= 100 
                ? "Challenge Completed! 🎉" 
                : `Active: ${activeChallenge.challengeId?.title || 'Daily Challenge'}`
              }
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default Progress;