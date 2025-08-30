import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePaths } from '../hooks/usePaths';
import { useSteps } from '../hooks/useSteps';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import Button from '../components/shared/Button';
import Loader from '../components/shared/Loader';

const PathDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { fetchPathById, loading: pathLoading } = usePaths();
  const { fetchSteps, loading: stepsLoading } = useSteps();

  const [path, setPath] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Load path data
  useEffect(() => {
    const loadPathData = async () => {
      if (!id) return;

      try {
        console.log('Loading path data for ID:', id);
        const path = await fetchPathById(id);
        console.log('Path data received:', path);

        // Set path data
        if (path) {
          setPath(path);
        }

        // Load steps for this path
        console.log('Fetching steps for path ID:', id);
        const stepsData = await fetchSteps(id);
        console.log('Steps data received:', stepsData);
        setSteps(stepsData || []);
      } catch (error) {
        console.error('Error loading path data:', error);
        navigate('/dashboard');
      }
    };

    if (id && isAuthenticated) {
      loadPathData();
    }
  }, [id, isAuthenticated, fetchPathById, fetchSteps, navigate]);

  const handleStartLearning = () => {
    if (steps.length > 0) {
      // Navigate to first step or learning interface
      console.log('Starting learning for path:', path.id);
      navigate(`/paths/${path.id}/steps/${steps[0].id}`);
    }
  };

  if (pathLoading || stepsLoading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <Loader size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-secondary-900 mb-4">
              Path Not Found
            </h1>
            <p className="text-secondary-600 mb-6">
              The learning path you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Path Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <span className="badge badge-primary">
                  {path.category}
                </span>
                <span className="text-sm text-secondary-500">
                  {path.stepCount} steps
                </span>
              </div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-4">
                {path.title}
              </h1>
              <p className="text-lg text-secondary-600 leading-relaxed">
                {path.description}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartLearning}
            >
              Start Learning
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Path Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Steps</p>
                <p className="text-2xl font-bold text-secondary-900">{path.stepCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-lg">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Estimated Time</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {path.estimatedTime ? `${path.estimatedTime}h` : `${path.stepCount * 2}h`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-warning-100 rounded-lg">
                <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Difficulty</p>
                <p className="text-2xl font-bold text-secondary-900 capitalize">
                  {path.difficulty || 'Beginner'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Path Steps */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">
            Learning Path
          </h2>

          {steps.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-secondary-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                Steps Coming Soon
              </h3>
              <p className="text-secondary-600">
                This learning path is being prepared. Check back soon!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(steps) && steps
                .sort((a, b) => a.order - b.order)
                .map((step, index) => (
                  <div
                    key={step.id || index}
                    className="flex items-start space-x-4 p-4 rounded-lg border border-secondary-200 hover:border-primary-300 transition-colors duration-200"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {step.order || index + 1}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                        {step.title || step.name || 'Untitled Step'}
                      </h3>
                      <p className="text-secondary-600 mb-3">
                        {step.description || 'No description available'}
                      </p>

                      {(step.content || step.resourceLinks) && (
                        <div className="text-sm text-secondary-500 line-clamp-2">
                          {step.content || (step.resourceLinks && step.resourceLinks.join(', '))}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                      {step.resourceLinks && step.resourceLinks.length > 0 && (
                      >
                          Resources: {step.resourceLinks.join(', ')}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
                      {step.name || 'Untitled Step'}
      </main>

      <Footer />
    </div>
  );
};

export default PathDetailPage;
