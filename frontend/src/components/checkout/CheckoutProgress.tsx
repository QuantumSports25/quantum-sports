import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface CheckoutProgressProps {
  currentStep: 'contact' | 'shipping' | 'payment' | 'review' | 'success';
}

const CheckoutProgress: React.FC<CheckoutProgressProps> = ({ currentStep }) => {
  const steps = [
    { id: 'contact', label: 'Contact Info' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'payment', label: 'Payment' },
    { id: 'review', label: 'Review' },
    { id: 'success', label: 'Success' }
  ];

  const getStepIndex = (step: string) => {
    return steps.findIndex(s => s.id === step);
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between overflow-x-auto">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                  ) : (
                    <Circle className="w-4 h-4 sm:w-6 sm:h-6" />
                  )}
                </div>
                <span className={`text-xs mt-1 sm:mt-2 ${
                  isCompleted 
                    ? 'text-green-600 font-medium' 
                    : isCurrent 
                    ? 'text-primary-600 font-medium' 
                    : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutProgress;
