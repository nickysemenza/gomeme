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
    "relative inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:scale-[0.97]";

  const variantClasses = {
    primary:
      "bg-coral-500 text-white font-semibold hover:bg-coral-600 hover:shadow-[0_10px_30px_-10px] hover:shadow-coral-500/60",
    secondary:
      "bg-card text-ink border border-line hover:border-coral-400 hover:text-coral-700",
    danger:
      "bg-coral-500/10 text-coral-700 border border-coral-500/20 hover:bg-coral-500/20",
  };

  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-4 text-base",
  };

  const disabledClasses =
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:shadow-none";

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
