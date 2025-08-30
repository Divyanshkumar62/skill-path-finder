import React from 'react';
import { Link } from 'react-router-dom';
import type { Path } from '../../api/pathApi';
import Button from '../shared/Button';

interface PathCardProps {
  path: Path;
  onEnroll?: (pathId: string) => void;
  progress?: number;
}

const PathCard: React.FC<PathCardProps> = ({
  path,
  onEnroll,
  progress = 0,
}) => {
  const handleEnroll = () => {
    if (onEnroll) {
      onEnroll(path.id);
    }
  };

  return (
    <div className="card group hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
            {path.title}
          </h3>
          <p className="text-secondary-600 text-sm line-clamp-2 mb-3">
            {path.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="badge badge-primary">
            {path.category}
          </span>
          <span className="text-sm text-secondary-500">
            {path.stepCount} steps
          </span>
        </div>
      </div>

      {progress > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-secondary-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          to={`/paths/${path.id}`}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
        >
          View Details →
        </Link>

        <Button
          variant="primary"
          size="sm"
          as={Link}
          to={`/paths/${path.id}`}
        >
          Start Learning
        </Button>
      </div>
    </div>
  );
};

export default PathCard;
