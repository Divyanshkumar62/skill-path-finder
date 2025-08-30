import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePaths } from '../hooks/usePaths';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import PathCard from '../components/paths/PathCard';
import Button from '../components/shared/Button';
import Loader from '../components/shared/Loader';

const LearningPathsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { paths, loading, searchPaths } = usePaths();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Load paths data
  useEffect(() => {
    if (isAuthenticated) {
      searchPaths({ limit: 20 });
    }
  }, [isAuthenticated, searchPaths]);

  // Filter paths by category/difficulty
  const recommendedPaths = paths.filter(path => path.category === 'web-development').slice(0, 8);
  const popularPaths = paths.filter(path => path.category === 'mobile-development').slice(0, 8);
  const beginnerPaths = paths.filter(path => path.difficulty === 'beginner').slice(0, 8);
  const intermediatePaths = paths.filter(path => path.difficulty === 'intermediate').slice(0, 8);
  const advancedPaths = paths.filter(path => path.difficulty === 'advanced').slice(0, 8);

  // Horizontal scroll component
  const HorizontalScrollSection: React.FC<{
    title: string;
    paths: any[];
    emptyMessage: string;
  }> = ({ title, paths, emptyMessage }) => (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-secondary-900">{title}</h2>
        {paths.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            View All
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : paths.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-6 min-w-max">
            {paths.map((path) => (
              <div key={path.id} className="flex-shrink-0 w-80">
                <PathCard
                  path={path}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 text-secondary-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-secondary-600 mb-6">
            Check back soon for new learning paths in this category.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      )}
    </div>
  );

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Learning Paths
          </h1>
          <p className="text-secondary-600">
            Discover and enroll in comprehensive learning paths to master new skills
          </p>
        </div>

        {/* Recommended Paths */}
        <HorizontalScrollSection
          title="Recommended for You"
          paths={recommendedPaths}
          emptyMessage="No recommended paths available"
        />

        {/* Popular Paths */}
        <HorizontalScrollSection
          title="Popular Paths"
          paths={popularPaths}
          emptyMessage="No popular paths available"
        />

        {/* Beginner Level */}
        <HorizontalScrollSection
          title="Beginner Friendly"
          paths={beginnerPaths}
          emptyMessage="No beginner paths available"
        />

        {/* Intermediate Level */}
        <HorizontalScrollSection
          title="Intermediate Level"
          paths={intermediatePaths}
          emptyMessage="No intermediate paths available"
        />

        {/* Advanced Level */}
        <HorizontalScrollSection
          title="Advanced Challenges"
          paths={advancedPaths}
          emptyMessage="No advanced paths available"
        />

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Our AI-powered system can recommend personalized learning paths based on your goals and current skill level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="bg-white text-primary-600 hover:bg-primary-50"
            >
              Get AI Recommendations
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LearningPathsPage;
