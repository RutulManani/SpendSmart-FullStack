// client/src/components/Layout/Layout.js
import React from 'react';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B7FF00] mx-auto"></div>
          <p className="text-white mt-4">Loading SpendSmart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>

      {/* Minimal Footer */}
      <footer className="bg-[#2D2D2D] border-t border-[#444] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="text-white font-semibold text-lg">SpendSmart</div>
              <p className="text-[#A9A9A9] max-w-2xl">
                SpendSmart helps you understand your spending habits by connecting expenses with emotions.
                Turn mindful spending into a fun, gamified experience and build better financial habits.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* GitHub icon linking to my profile */}
              <a
                href="https://github.com/RutulManani"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open GitHub profile"
                className="text-[#A9A9A9] hover:text-white transition-colors"
                title="GitHub"
              >
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.486 2 12.018c0 4.428 2.867 8.185 6.842 9.507.5.092.68-.218.68-.484
                    0-.238-.008-.87-.013-1.707-2.782.606-3.37-1.345-3.37-1.345-.454-1.158-1.11-1.467-1.11-1.467-.91-.62.068-.61.068-.61
                    1.004.071 1.532 1.034 1.532 1.034.893 1.532 2.343 1.09 2.912.834.092-.649.35-1.09.636-1.34-2.221-.254-4.557-1.115-4.557-4.956
                    0-1.094.39-1.99 1.03-2.69-.103-.254-.447-1.274.098-2.653 0 0 .84-.271 2.751 1.027A9.58 9.58 0 0112 6.846c.85.004
                    1.706.116 2.505.338 1.91-1.298 2.748-1.028 2.748-1.028.546 1.38.202 2.4.1 2.653.64.701 1.028 1.596 1.028 2.69
                    0 3.847-2.34 4.696-4.567 4.944.36.31.679.922.679 1.858 0 1.34-.012 2.423-.012 2.752 0 .269.18.581.688.483A10.02 10.02 0 0022 12.018C22 6.486 17.523 2 12 2z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="border-t border-[#444] mt-8 pt-6">
            <p className="text-[#A9A9A9] text-sm">© 2025 SpendSmart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
