import React, { useState, useEffect } from 'react';
import Challenge from '../components/Dashboard/Challenge';
import ExpenseForm from '../components/Dashboard/ExpenseForm';
import Progress from '../components/Dashboard/Progress';
import SpendingHistory from '../components/Dashboard/SpendingHistory';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [progress, setProgress] = useState(0);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch active challenge
      const challengeRes = await api.get('/challenges/active');
      setActiveChallenge(challengeRes.data.activeChallenge);
      
      // Fetch recent expenses
      const expensesRes = await api.get('/expenses?limit=10');
      setExpenses(expensesRes.data.expenses);
      
      // Update progress if there's an active challenge
      if (challengeRes.data.activeChallenge) {
        setProgress(challengeRes.data.activeChallenge.progress);
      }
      
      // Set badges from user data
      setBadges(user?.badges || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = async (expense) => {
    // Add new expense to the list
    setExpenses([expense, ...expenses.slice(0, 9)]);
    
    // Refresh challenge data to update progress
    if (activeChallenge) {
      const challengeRes = await api.get('/challenges/active');
      setActiveChallenge(challengeRes.data.activeChallenge);
      setProgress(challengeRes.data.activeChallenge?.progress || 0);
    }
  };

  const handleChallengeStart = (challenge) => {
    setActiveChallenge(challenge);
    setProgress(0);
  };

  const handleChallengeEnd = () => {
    setActiveChallenge(null);
    setProgress(0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto p-5">
      {/* Top Row - Challenge and Log Expense */}
      <div className="flex flex-col lg:flex-row gap-5 mb-5">
        <Challenge
          activeChallenge={activeChallenge}
          onChallengeStart={handleChallengeStart}
          onChallengeEnd={handleChallengeEnd}
          streak={user?.currentStreak || 0}
        />
        <ExpenseForm
          onExpenseAdded={handleExpenseAdded}
          hasActiveChallenge={!!activeChallenge}
        />
      </div>

      {/* Middle Row - Progress Section */}
      <Progress
        progress={progress}
        activeChallenge={activeChallenge}
        badges={badges}
        streak={user?.currentStreak || 0}
      />

      {/* Bottom Row - Spending History */}
      <SpendingHistory expenses={expenses} />
    </main>
  );
};

export default Dashboard;