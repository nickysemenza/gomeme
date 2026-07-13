import LoadingSpinner from "./LoadingSpinner";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<Props> = ({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "relative inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

  const variantClasses = {
    primary: "bg-primary text-white font-semibold hover:bg-primary-deep",
    secondary: "bg-bg text-ink border border-line hover:bg-well",
    danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const disabledClasses = "disabled:opacity-40 disabled:cursor-not-allowed";

  const allClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  return (
    <button className={allClasses} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className="flex items-center gap-2">
          <LoadingSpinner size="sm" color="border-current" />
          <span>Working…</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
