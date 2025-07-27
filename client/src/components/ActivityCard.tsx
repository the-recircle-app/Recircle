import React from 'react';
import { Link } from 'wouter';
import B3trLogo from './B3trLogo';

interface ActivityCardProps {
  title: string;
  description: string;
  reward?: number | { min: number; max: number };
  icon: React.ReactNode;
  color: string;
  path: string;
  progress?: number;
  showReward?: boolean;
  hideSymbol?: boolean;
  onClick?: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  description,
  reward,
  icon,
  color,
  path,
  progress = 100,
  showReward = true,
  hideSymbol = false,
  onClick
}) => {
  const blue = "#38BDF8"; // Bright cyan/blue for dark theme
  
  const cardContent = (
    <div className="cursor-pointer bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-700 hover:shadow-lg transition-shadow duration-200">
        <div 
          className="p-4 flex items-center justify-between" 
          style={{ backgroundColor: `${color}15` }} // Very dark version of the color
        >
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-3"
              style={{ backgroundColor: `${color}25` }} // Darker version of the color
            >
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-100">{title}</h3>
              <p className="text-sm text-gray-400">{description}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            {(showReward && reward) ? (
              <div className="flex items-center justify-center mb-1">
                <span className="text-blue-300 font-bold mr-1">
                  {reward && (typeof reward === 'number' 
                    ? `+${reward}` 
                    : `+${reward.min}-${reward.max}`)}
                </span>
                <div className="bg-blue-900/50 rounded-full p-1">
                  <B3trLogo className="w-4 h-4" color={blue} />
                </div>
              </div>
            ) : (!hideSymbol && (
              <div className="flex items-center justify-center mb-1">
                <div className="bg-blue-900/50 rounded-full p-1">
                  <B3trLogo className="w-4 h-4" color={blue} />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Progress bar */}
        {progress < 100 && (
          <div className="bg-gray-700 h-2 w-full">
            <div 
              className="h-full transition-all duration-300" 
              style={{ width: `${progress}%`, backgroundColor: color }}
            ></div>
          </div>
        )}
      </div>
  );

  if (onClick) {
    return <div onClick={onClick}>{cardContent}</div>;
  }

  return (
    <Link href={path}>
      {cardContent}
    </Link>
  );
};

export default ActivityCard;