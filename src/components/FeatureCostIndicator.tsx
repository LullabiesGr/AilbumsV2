import React from 'react';
import { CreditCard, Info } from 'lucide-react';
import { useCredits } from '../context/CreditsContext';

interface FeatureCostIndicatorProps {
  feature: string;
  className?: string;
  showBalance?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const FeatureCostIndicator: React.FC<FeatureCostIndicatorProps> = ({ 
  feature, 
  className = '',
  showBalance = false,
  size = 'md'
}) => {
  const { getCost, balance } = useCredits();
  
  const cost = getCost(feature);
  const canAfford = balance >= cost;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (cost === 0) {
    return (
      <div className={`inline-flex items-center space-x-1 ${sizeClasses[size]} 
                     bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 
                     rounded-full font-medium ${className}`}>
        <span>FREE</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-1 ${sizeClasses[size]} 
                   ${canAfford 
                     ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                     : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                   } rounded-full font-medium ${className}`}>
      <CreditCard className={iconSizes[size]} />
      <span>{cost} credit{cost !== 1 ? 's' : ''}</span>
      {showBalance && (
        <>
          <span className="text-gray-400">•</span>
          <span className={canAfford ? 'text-green-600' : 'text-red-600'}>
            {balance} available
          </span>
        </>
      )}
      {!canAfford && (
        <Info className={`${iconSizes[size]} text-red-500`} title="Insufficient credits" />
      )}
    </div>
  );
};

export default FeatureCostIndicator;