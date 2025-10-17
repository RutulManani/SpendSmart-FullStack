import React, { useState, useEffect } from 'react';
import Challenge from '../components/Dashboard/Challenge';
import ExpenseForm from '../components/Dashboard/ExpenseForm';
import Progress from '../components/Dashboard/Progress';
import SpendingHistory from '../components/Dashboard/SpendingHistory';
import BadgeCollection from '../components/Dashboard/BadgeCollection';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [progress, setProgress] = useState(0);
  const [badges, setBadges] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch active challenge
      const challengeRes = await api.get('/challenges/active');
      console.log('Active challenge:', challengeRes.data.activeChallenge);
      setActiveChallenge(challengeRes.data.activeChallenge);
      
      // Fetch recent expenses
      const expensesRes = await api.get('/expenses?limit=10');
      setExpenses(expensesRes.data.expenses);
      
      // Update progress if there's an active challenge
      if (challengeRes.data.activeChallenge) {
        setProgress(challengeRes.data.activeChallenge.progress);
      }
      
      // Fetch user badges
      try {
        const badgesRes = await api.get('/badges/my-badges');
        console.log('Badges API Response:', badgesRes.data);
        console.log('Raw badges data:', badgesRes.data.badges);
        setBadges(badgesRes.data.badges || []);
      } catch (badgeError) {
        console.error('Error fetching badges:', badgeError);
        console.log('Badge error details:', badgeError.response?.data);
        setBadges([]);
      }
      
      // Fetch streak info
      try {
        const streakRes = await api.get('/streaks/my-streak');
        console.log('Streak data:', streakRes.data);
        setStreak(streakRes.data.currentStreak || 0);
      } catch (streakError) {
        console.error('Error fetching streak:', streakError);
        setStreak(0);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = async (expense) => {
    // Add new expense to the list
    setExpenses([expense, ...expenses.slice(0, 9)]);
    
    // Refresh all data to update progress, badges, and streaks
    await fetchDashboardData();
  };

  const handleExpenseUpdated = (updatedExpense) => {
    setExpenses(prevExpenses => 
      prevExpenses.map(expense => 
        expense._id === updatedExpense._id ? updatedExpense : expense
      )
    );
  };

  const handleExpenseDeleted = (expenseId) => {
    setExpenses(prevExpenses => 
      prevExpenses.filter(expense => expense._id !== expenseId)
    );
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

      {/* Badge Collection Modal */}
      {showBadges && (
        <BadgeCollection 
          badges={badges} 
          onClose={() => setShowBadges(false)} 
        />
      )}

      {/* Top Row - Challenge and Log Expense */}
      <div className="flex flex-col lg:flex-row gap-5 mb-5">
        <Challenge
          activeChallenge={activeChallenge}
          onChallengeStart={handleChallengeStart}
          onChallengeEnd={handleChallengeEnd}
          streak={streak}
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
        streak={streak}
        onViewBadges={() => setShowBadges(true)}
      />

      {/* Bottom Row - Spending History */}
      <SpendingHistory 
        expenses={expenses} 
        onExpenseUpdated={handleExpenseUpdated}
        onExpenseDeleted={handleExpenseDeleted}
      />
    </main>
  );
};

export default Dashboard;