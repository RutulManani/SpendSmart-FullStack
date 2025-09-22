import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Clock, Flame } from 'lucide-react';

const Challenge = ({ activeChallenge, onChallengeStart, onChallengeEnd, streak }) => {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  useEffect(() => {
    if (activeChallenge) {
      // Calculate time remaining
      const startTime = new Date(activeChallenge.startedAt).getTime();
      const duration = activeChallenge.challengeId.durationHours * 60 * 60 * 1000;
      const endTime = startTime + duration;
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(Math.floor(remaining / 1000));

      // Set up timer
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            handleChallengeComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [activeChallenge]);

  const fetchChallenges = async () => {
    try {
      const response = await api.get('/challenges');
      setChallenges(response.data.challenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const handleStartChallenge = async () => {
    if (!selectedChallenge) {
      alert('Please select a challenge first!');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/challenges/start', {
        challengeId: selectedChallenge
      });
      onChallengeStart(response.data.userChallenge);
      setSelectedChallenge('');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to start challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleEndChallenge = async () => {
    if (!activeChallenge) return;

    setLoading(true);
    try {
      await api.post(`/challenges/end/${activeChallenge._id}`);
      onChallengeEnd();
    } catch (error) {
      alert('Failed to end challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeComplete = () => {
    setShowCompleted(true);
    onChallengeEnd();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetChallenge = () => {
    setShowCompleted(false);
  };

  return (
    <section className="bg-[#2D2D2D] p-5 rounded-[10px] border border-[#444] flex-1">
      <div className="flex items-center gap-3 mb-5">
        <img src="/Images/Challenge Icon.png" alt="Challenge Icon" className="w-6 h-6" />
        <h2 className="text-white font-semibold text-xl">Today's Challenge</h2>
      </div>

      {!activeChallenge && !showCompleted && (
        <div id="challenge-container">
          <p className="text-[#E0E0E0] mb-5">
            Select a daily challenge from the dropdown, track your progress, and earn rewards! 
            Gain 10 points for positive moods and lose 10 for negative ones—stay motivated to achieve your goals. 
            The progress bar will become visible after your first entry.
          </p>
          
          <div className="flex flex-col gap-2.5">
            <select 
              value={selectedChallenge}
              onChange={(e) => setSelectedChallenge(e.target.value)}
              className="w-full p-3 border border-white bg-[#3D3D3D] text-[#E0E0E0] rounded appearance-none"
              disabled={loading}
            >
              <option value="" disabled>Select Challenge</option>
              {challenges.map(challenge => (
                <option key={challenge._id} value={challenge._id}>
                  {challenge.title}
                </option>
              ))}
            </select>
            
            <button 
              onClick={handleStartChallenge}
              className="w-full p-3 bg-[#B7FF00] text-[#181818] font-semibold rounded mt-2.5 hover:bg-[#a3e600] transition-colors"
              disabled={loading}
            >
              {loading ? 'Starting...' : 'Start'}
            </button>
          </div>
        </div>
      )}

      {activeChallenge && !showCompleted && (
        <div id="active-challenge">
          <p className="text-[#E0E0E0] mb-5">
            {activeChallenge.challengeId.title}
          </p>
          
          <div className="challenge-info">
            <p className="text-[#4CAF50] font-bold my-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Remaining: <span>{formatTime(timeRemaining)}</span>
            </p>
            <p className="text-[#E0E0E0] flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Streak: <span className="font-semibold">{streak}</span> days
            </p>
          </div>

          <button 
            onClick={handleEndChallenge}
            className="w-full p-3 mt-4 border border-[#B7FF00] text-[#B7FF00] font-semibold rounded hover:bg-[#B7FF00] hover:text-[#181818] transition-colors"
            disabled={loading}
          >
            {loading ? 'Ending...' : 'End Challenge'}
          </button>
        </div>
      )}

      {showCompleted && (
        <div id="completed-challenge" className="text-center py-5">
          <p className="text-[#E0E0E0]">
            You've completed your last challenge! Your <span className="font-semibold">{streak}-day</span> streak 
            has begun—start a new challenge by tapping the button below.
          </p>
          <button 
            onClick={resetChallenge}
            className="w-full p-3 bg-[#B7FF00] text-[#181818] font-semibold rounded mt-4 hover:bg-[#a3e600] transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </section>
  );
};

export default Challenge;