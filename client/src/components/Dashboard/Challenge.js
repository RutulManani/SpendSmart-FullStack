// client/src/components/Dashboard/Challenge.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../services/api';
import { Clock, Flame } from 'lucide-react';

const Challenge = ({ activeChallenge, onChallengeStart, onChallengeEnd, streak }) => {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => { fetchChallenges(); }, []);

  useEffect(() => {
    if (!activeChallenge) return;
    const startTime = new Date(activeChallenge.startedAt).getTime();
    const duration = (activeChallenge.challengeId?.durationHours || 24) * 60 * 60 * 1000;
    const endTime = startTime + duration;
    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(Math.floor(remaining / 1000));
      if (remaining <= 0) handleChallengeComplete();
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeChallenge]); // eslint-disable-line

  const fetchChallenges = async () => {
    setFetching(true);
    try {
      const res = await api.get('/challenges');
      const list = Array.isArray(res.data?.challenges) ? res.data.challenges
        : Array.isArray(res.data) ? res.data : [];
      setChallenges(list);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setChallenges([]);
    } finally {
      setFetching(false);
    }
  };

  const handleStartChallenge = async () => {
    if (!selectedChallenge) {
      alert('Please select a challenge first!');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/challenges/start', { challengeId: selectedChallenge });
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
    } catch {
      alert('Failed to end challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeComplete = useCallback(() => {
    setShowCompleted(true);
    onChallengeEnd();
  }, [onChallengeEnd]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const resetChallenge = () => setShowCompleted(false);
  const hasRealData = useMemo(() => challenges.length > 0, [challenges]);

  return (
    <section className="bg-[#2D2D2D] p-5 rounded-[10px] border border-[#444] flex-1">
      <div className="flex items-center gap-3 mb-5">
        <img src="/images/challenge-icon.png" alt="Challenge Icon" className="w-6 h-6" />
        <h2 className="text-white font-semibold text-xl">Today's Challenge</h2>
      </div>

      {!activeChallenge && !showCompleted && (
        <div id="challenge-container">
          <p className="text-[#E0E0E0] mb-5">
            Select a daily challenge from the dropdown, track your progress, and earn rewards! Gain 10 points
            for positive moods and lose 10 for negative ones—stay motivated to achieve your goals. The progress
            bar will become visible after your first entry.
          </p>

          <div className="flex flex-col gap-2.5">
            <select
              value={selectedChallenge}
              onChange={(e) => setSelectedChallenge(e.target.value)}
              className="w-full p-3 border border-white bg-[#3D3D3D] text-[#E0E0E0] rounded"
              disabled={fetching || !hasRealData}
            >
              <option value="" disabled>
                {fetching ? 'Loading challenges...' : hasRealData ? 'Select Challenge' : 'No challenges yet'}
              </option>
              {challenges.map((c) => (
                <option key={c._id} value={c._id} className="bg-[#1E1E1E] text-[#E0E0E0]">
                  {c.title || c.name || 'Untitled Challenge'}
                </option>
              ))}
            </select>

            <button
              onClick={handleStartChallenge}
              className="w-full p-3 bg-[#B7FF00] text-[#181818] font-semibold rounded mt-2.5 hover:bg-[#a3e600] transition-colors"
              disabled={loading || fetching || !selectedChallenge}
            >
              {loading ? 'Starting...' : 'Start'}
            </button>
          </div>
        </div>
      )}

      {activeChallenge && !showCompleted && (
        <div id="active-challenge">
          <p className="text-[#E0E0E0] mb-5">
            {activeChallenge.challengeId?.title || activeChallenge.challengeId?.name || 'Current Challenge'}
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
        <>
          <div id="completed-challenge" className="text-center py-5">
            <p className="text-[#E0E0E0]">
              You've completed your last challenge! Your <span className="font-semibold">{streak}-day</span> streak
              has begun—start a new challenge by tapping the button below.
            </p>
          </div>
          <button
            onClick={resetChallenge}
            className="w-full p-3 bg-[#B7FF00] text-[#181818] font-semibold rounded mt-4 hover:bg-[#a3e600] transition-colors"
          >
            Reset
          </button>
        </>
      )}
    </section>
  );
};

export default Challenge;