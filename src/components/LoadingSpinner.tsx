interface Props {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<Props> = ({
  size = "md",
  color = "border-blue-500",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-16 h-16 border-4",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${color} border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
};

export default LoadingSpinner;
