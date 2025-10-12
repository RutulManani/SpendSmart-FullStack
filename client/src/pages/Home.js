import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingDown, Award, Target, BarChart3, Heart, Shield } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Heart,
      title: 'Mood-Aware Tracking',
      description: 'Link every expense to your emotional state and discover your spending triggers.'
    },
    {
      icon: Target,
      title: 'Daily Challenges',
      description: 'Take on engaging challenges that help you build better financial habits.'
    },
    {
      icon: Award,
      title: 'Earn Badges',
      description: 'Get rewarded for maintaining streaks and achieving your financial goals.'
    },
    {
      icon: BarChart3,
      title: 'Insights & Reports',
      description: 'Visualize your spending patterns and understand the emotions behind them.'
    },
    {
      icon: TrendingDown,
      title: 'Break the Cycle',
      description: 'Identify emotional spending patterns and develop healthier coping strategies.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial and emotional data is encrypted and protected.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-5 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome to <span className="text-[#B7FF00]">SpendSmart</span>
          </h1>
          <p className="text-xl text-[#E0E0E0] max-w-3xl mx-auto mb-8">
            The mood-aware expense tracker that helps you understand the emotions behind your spending. 
            Break the cycle of emotional spending with gamified challenges and personalized insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-[#B7FF00] text-[#181818] font-semibold rounded-lg hover:bg-[#a3e600] transition-colors text-lg min-w-[200px]"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-[#B7FF00] text-[#B7FF00] font-semibold rounded-lg hover:bg-[#B7FF00] hover:text-[#181818] transition-colors text-lg min-w-[200px]"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-[#2D2D2D] p-6 rounded-lg border border-[#444] hover:border-[#B7FF00] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#3D3D3D] rounded-lg">
                    <Icon className="w-6 h-6 text-[#B7FF00]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-[#A9A9A9] text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#2D2D2D] border-y border-[#444] py-16">
        <div className="max-w-[1400px] mx-auto px-5">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            How SpendSmart Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#B7FF00] rounded-full flex items-center justify-center mx-auto mb-4 text-[#181818] font-bold text-2xl">
                1
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">
                Start a Challenge
              </h3>
              <p className="text-[#A9A9A9]">
                Choose from daily challenges designed to help you build better spending habits
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#B7FF00] rounded-full flex items-center justify-center mx-auto mb-4 text-[#181818] font-bold text-2xl">
                2
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">
                Log with Mood
              </h3>
              <p className="text-[#A9A9A9]">
                Track every expense along with your emotional state at the time of purchase
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#B7FF00] rounded-full flex items-center justify-center mx-auto mb-4 text-[#181818] font-bold text-2xl">
                3
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">
                Gain Insights
              </h3>
              <p className="text-[#A9A9A9]">
                Discover patterns, earn badges, and develop healthier financial habits
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-[1400px] mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold text-[#B7FF00] mb-2">100%</div>
            <p className="text-[#E0E0E0]">Free to Use</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-[#B7FF00] mb-2">24/7</div>
            <p className="text-[#E0E0E0]">Track Anytime</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-[#B7FF00] mb-2">∞</div>
            <p className="text-[#E0E0E0]">Unlimited Entries</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#2D2D2D] border-t border-[#444] py-16">
        <div className="max-w-[1400px] mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl text-[#E0E0E0] mb-8 max-w-2xl mx-auto">
            Join SpendSmart today and start your journey towards mindful spending and financial wellness.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-[#B7FF00] text-[#181818] font-semibold rounded-lg hover:bg-[#a3e600] transition-colors text-lg"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#444] py-8">
        <div className="max-w-[1400px] mx-auto px-5 text-center">
          <p className="text-[#A9A9A9]">
            © 2025 SpendSmart.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;