import React from "react";

interface Props {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<Props> = ({ 
  size = "md", 
  color = "border-blue-500", 
  className = "" 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-16 h-16 border-4"
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${color} border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
};

interface LoadingStateProps {
  title?: string;
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  title = "Loading", 
  message = "Please wait...", 
  size = "lg" 
}) => (
  <div className="text-center py-8">
    <LoadingSpinner size={size} className="mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{message}</p>
  </div>
);

export default LoadingSpinner;