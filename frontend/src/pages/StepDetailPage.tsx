import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import Button from '../components/shared/Button';
import Loader from '../components/shared/Loader';

const StepDetailPage: React.FC = () => {
  const { pathId, stepId } = useParams<{ pathId: string; stepId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState<any>(null);
  const [path, setPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Load step data
  useEffect(() => {
    const loadStepData = async () => {
      if (!pathId || !stepId) return;

      try {
        setLoading(true);
        setError(null);

        // For now, we'll simulate loading step data
        // In a real app, you'd call an API to get step details
        console.log('Loading step:', stepId, 'for path:', pathId);

        // Mock step data - replace with actual API call
        const mockStep = {
          id: stepId,
          name: 'Introduction to Full Stack Development',
          description: 'Learn the fundamentals of full stack development including frontend and backend technologies.',
          content: `
# Introduction to Full Stack Development

Full stack development involves working with both the frontend and backend of web applications. This comprehensive guide will walk you through the essential concepts and technologies.

## What is Full Stack Development?

Full stack development refers to the development of both front-end (client-side) and back-end (server-side) portions of a web application.

### Frontend Technologies
- **HTML**: Structure of web pages
- **CSS**: Styling and layout
- **JavaScript**: Interactivity and dynamic content
- **React/Vue/Angular**: Modern frontend frameworks

### Backend Technologies
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Web application framework for Node.js
- **Databases**: MongoDB, PostgreSQL, MySQL
- **APIs**: RESTful APIs and GraphQL

## Getting Started

1. **Set up your development environment**
2. **Learn HTML and CSS basics**
3. **Master JavaScript fundamentals**
4. **Choose your tech stack**
5. **Build your first full stack application**

## Next Steps

After completing this introduction, you'll be ready to dive deeper into specific technologies and build real-world applications.
          `,
          resourceLinks: [
            'https://developer.mozilla.org/en-US/docs/Web/HTML',
            'https://developer.mozilla.org/en-US/docs/Web/CSS',
            'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
            'https://nodejs.org/en/docs/'
          ],
          order: 1,
          completedBy: [] as string[],
          completionCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const mockPath = {
          id: pathId,
          title: 'Full Stack Web Development',
          description: 'Complete guide to becoming a full stack developer',
          category: 'web-development'
        };

        setStep(mockStep);
        setPath(mockPath);

        // Check if user has completed this step
        if (user && mockStep.completedBy && mockStep.completedBy.includes(user.id)) {
          setIsCompleted(true);
        }

      } catch (err: any) {
        console.error('Error loading step:', err);
        setError(err.message || 'Failed to load step');
      } finally {
        setLoading(false);
      }
    };

    if (pathId && stepId && isAuthenticated) {
      loadStepData();
    }
  }, [pathId, stepId, isAuthenticated, user]);

  const handleMarkComplete = async () => {
    if (!step || !user) return;

    setCompleting(true);
    try {
      // Here you would call an API to mark the step as completed
      console.log('Marking step as completed:', step.id, 'for user:', user.id);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsCompleted(true);
      console.log('Step marked as completed successfully');
    } catch (error) {
      console.error('Error marking step as completed:', error);
    } finally {
      setCompleting(false);
    }
  };

  const handleMarkIncomplete = async () => {
    if (!step || !user) return;

    try {
      // Here you would call an API to mark the step as incomplete
      console.log('Marking step as incomplete:', step.id, 'for user:', user.id);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsCompleted(false);
      console.log('Step marked as incomplete successfully');
    } catch (error) {
      console.error('Error marking step as incomplete:', error);
    }
  };

  if (loading) {
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

  if (error || !step) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-secondary-900 mb-4">
              {error || 'Step Not Found'}
            </h1>
            <p className="text-secondary-600 mb-6">
              {error || `The step you're looking for could not be loaded.`}
            </p>
            <Button onClick={() => navigate(`/paths/${pathId}`)}>
              Back to Path
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-secondary-600">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-primary-600"
            >
              Dashboard
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/paths/${pathId}`)}
              className="hover:text-primary-600"
            >
              {path?.title || 'Path'}
            </button>
            <span>/</span>
            <span className="text-secondary-900">{step.title}</span>
          </div>
        </nav>

        {/* Step Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <span className="badge badge-primary">
                  Step {step.order}
                </span>
                <span className="text-sm text-secondary-500">
                  {path?.category || 'General'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-4">
                {step.name}
              </h1>
              <p className="text-lg text-secondary-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {!isCompleted ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleMarkComplete}
                loading={completing}
                disabled={completing}
              >
                {completing ? 'Marking Complete...' : 'Mark as Complete'}
              </Button>
            ) : (
              <Button
                variant="success"
                size="lg"
                onClick={handleMarkIncomplete}
              >
                ✓ Completed
              </Button>
            )}

            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(`/paths/${pathId}`)}
            >
              Back to Path
            </Button>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">
            Step Content
          </h2>

          <div className="prose prose-lg max-w-none">
            <div
              className="text-secondary-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: step.content.replace(/\n/g, '<br />').replace(/^# (.+)$/gm, '<h1>$1</h1>').replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^### (.+)$/gm, '<h3>$1</h3>')
              }}
            />
          </div>
        </div>

        {/* Resource Links */}
        {step.resourceLinks && step.resourceLinks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">
              Additional Resources
            </h2>

            <div className="grid gap-4">
              {step.resourceLinks.map((link: string, index: number) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
                >
                  <div className="flex-shrink-0 mr-4">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-secondary-900 font-medium">
                      Resource {index + 1}
                    </p>
                    <p className="text-secondary-600 text-sm">
                      {link}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Step Metadata */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">
            Step Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                Progress
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion Status</span>
                  <span className={isCompleted ? 'text-success-600' : 'text-warning-600'}>
                    {isCompleted ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Step Order</span>
                  <span>{step.order}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Times Completed</span>
                  <span>{step.completionCount || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                Timeline
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Created</span>
                  <span>{new Date(step.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Updated</span>
                  <span>{new Date(step.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StepDetailPage;
