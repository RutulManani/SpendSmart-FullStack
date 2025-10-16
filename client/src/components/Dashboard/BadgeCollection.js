import React from 'react';
import { X, Award, Star, Crown, Zap } from 'lucide-react';

const BadgeCollection = ({ badges, onClose }) => {
  const getRarityIcon = (rarity) => {
    switch (rarity) {
      case 'common': return <Star className="w-4 h-4 text-gray-400" />;
      case 'rare': return <Star className="w-4 h-4 text-blue-400" />;
      case 'epic': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'legendary': return <Crown className="w-4 h-4 text-yellow-400" />;
      default: return <Award className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 bg-gray-500/10';
      case 'rare': return 'border-blue-500 bg-blue-500/10';
      case 'epic': return 'border-purple-500 bg-purple-500/10';
      case 'legendary': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getRarityText = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const earnedBadges = badges.filter(badge => badge.badgeId);
  const lockedBadges = []; // You might want to fetch all available badges to show locked ones

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2D2D2D] rounded-lg border border-[#444] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#444]">
          <div>
            <h3 className="text-xl font-semibold text-white">Your Badge Collection</h3>
            <p className="text-[#A9A9A9]">
              {earnedBadges.length} badges earned
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A9A9A9] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Badges Grid */}
        <div className="p-6">
          {earnedBadges.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-[#A9A9A9] mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">No Badges Yet</h4>
              <p className="text-[#A9A9A9]">
                Start completing challenges and maintaining streaks to earn badges!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {earnedBadges.map((userBadge, index) => {
                const badge = userBadge.badgeId;
                if (!badge) return null;

                return (
                  <div
                    key={badge._id || index}
                    className={`border-2 rounded-lg p-6 text-center transition-transform hover:scale-105 ${getRarityColor(badge.rarity)}`}
                  >
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full ${getRarityColor(badge.rarity)}`}>
                        <Award className={`w-8 h-8 ${getRarityText(badge.rarity)}`} />
                      </div>
                    </div>
                    
                    <h4 className={`font-semibold text-lg mb-2 ${getRarityText(badge.rarity)}`}>
                      {badge.name || badge.title}
                    </h4>
                    
                    {badge.description && (
                      <p className="text-[#E0E0E0] text-sm mb-3">
                        {badge.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {getRarityIcon(badge.rarity)}
                      <span className={`text-sm capitalize ${getRarityText(badge.rarity)}`}>
                        {badge.rarity}
                      </span>
                    </div>
                    
                    {badge.points > 0 && (
                      <div className="text-[#B7FF00] text-sm font-semibold">
                        +{badge.points} points
                      </div>
                    )}
                    
                    {userBadge.earnedAt && (
                      <div className="text-[#A9A9A9] text-xs mt-2">
                        Earned on {new Date(userBadge.earnedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {earnedBadges.length > 0 && (
          <div className="border-t border-[#444] p-4 bg-[#3D3D3D]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-white font-semibold">{earnedBadges.length}</div>
                <div className="text-[#A9A9A9] text-sm">Total Badges</div>
              </div>
              <div>
                <div className="text-white font-semibold">
                  {earnedBadges.filter(b => b.badgeId?.rarity === 'rare').length}
                </div>
                <div className="text-blue-400 text-sm">Rare</div>
              </div>
              <div>
                <div className="text-white font-semibold">
                  {earnedBadges.filter(b => b.badgeId?.rarity === 'epic').length}
                </div>
                <div className="text-purple-400 text-sm">Epic</div>
              </div>
              <div>
                <div className="text-white font-semibold">
                  {earnedBadges.filter(b => b.badgeId?.rarity === 'legendary').length}
                </div>
                <div className="text-yellow-400 text-sm">Legendary</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeCollection;