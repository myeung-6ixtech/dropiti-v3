import React, { ReactNode } from "react";
import { useHaptic } from "@/hooks/useHaptic";

interface ButtonProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "outline" | "tertiary" | "danger" | "success";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
}) => {
  const { tap } = useHaptic();
  // Size Classes
  const sizeClasses = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
    xl: "btn-xl",
  };

  // Variant Classes - Airbnb Style
  const variantClasses = {
    primary: "btn-primary",
    outline: "btn-secondary",
    tertiary: "btn-tertiary",
    danger: "btn-danger",
    success: "btn-success",
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-medium gap-2 rounded-lg transition ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={() => {
        tap(variant === 'danger' ? 'warning' : variant === 'success' ? 'success' : 'light');
        onClick?.();
      }}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
