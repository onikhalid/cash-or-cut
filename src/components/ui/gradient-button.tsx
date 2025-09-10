'use client'

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { useRef, useLayoutEffect, useState } from 'react';

// Button variant types
type ButtonVariant = 'default' | 'success' | 'danger' | 'warning' | 'orange';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GradientButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// Gradient definitions for different variants
const gradientVariants = {
  default: {
    fill: "url(#paint0_linear_default)",
    stroke: "#6AE385",
    gradientStops: [
      { offset: "0%", color: "#15693C" },
      { offset: "100%", color: "#29CF76" }
    ]
  },
  success: {
    fill: "url(#paint0_linear_success)",
    stroke: "#4ADE80",
    gradientStops: [
      { offset: "0%", color: "#166534" },
      { offset: "100%", color: "#22C55E" }
    ]
  },
  danger: {
    fill: "url(#paint0_linear_danger)",
    stroke: "#F87171",
    gradientStops: [
      { offset: "0%", color: "#991B1B" },
      { offset: "100%", color: "#EF4444" }
    ]
  },
  orange: {
    fill: "url(#paint0_linear_orange)",
    stroke: "#FFC125",
    gradientStops: [
      { offset: "0%", color: "#C26600" },
      { offset: "100%", color: "#F1A325" }
    ]
  },
  warning: {
    fill: "url(#paint0_linear_warning)",
    stroke: "#FBBF24",
    gradientStops: [
      { offset: "0%", color: "#92400E" },
      { offset: "100%", color: "#F59E0B" }
    ]
  }
};

// Size configurations
const sizeConfig = {
  sm: {
    height: 36,
    width: 240,
    rx: 18,
    textClass: "text-sm px-4",
    iconSize: 16
  },
  md: {
    height: 44,
    width: 312,
    rx: 22,
    textClass: "text-base px-6",
    iconSize: 20
  },
  lg: {
    height: 56,
    width: 384,
    rx: 28,
    textClass: "text-lg px-8",
    iconSize: 24
  }
};

const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled = false,
  className = '',
  ...props
}) => {
  const config = sizeConfig[size];
  const gradientConfig = gradientVariants[variant];
  const gradientId = `paint0_linear_${variant}_${Math.random().toString(36).substr(2, 9)}`;

  // Button width logic: auto by default, 100% if fullWidth, else user can override via style/props
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (buttonRef.current) {
      setMeasuredWidth(buttonRef.current.offsetWidth);
    }
  }, [children, size, fullWidth, className, leftIcon, rightIcon]);

  const buttonWidth = fullWidth ? '100%' : undefined;
  const isDisabled = disabled || loading;

  return (
    <button
      ref={buttonRef}
      className={`relative cursor-pointer inline-flex items-center justify-center font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 ${config.textClass} ${className} ${fullWidth ? 'w-full' : ''}`}
      disabled={isDisabled}
      style={{ width: buttonWidth, height: config.height, ...(props.style || {}) }}
      {...props}
    >
      {/* SVG Background */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${measuredWidth || config.width} ${config.height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x={1}
          y={1}
          width={(measuredWidth || config.width) - 2}
          height={config.height - 2}
          rx={config.rx - 1}
          fill={`url(#${gradientId})`}
          stroke={gradientConfig.stroke}
          strokeWidth={2}
        />
        <defs>
          <linearGradient
            id={gradientId}
            x1="50%"
            y1="100%"
            x2="50%"
            y2="0%"
            gradientUnits="userSpaceOnUse"
          >
            {gradientConfig.gradientStops.map((stop, index) => (
              <stop key={index} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
        </defs>
      </svg>

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <div className="flex items-center gap-2">
            <div 
              className="animate-spin rounded-full border-2 border-white/30 border-t-white"
              style={{ width: config.iconSize, height: config.iconSize }}
            />
            <span>Loading...</span>
          </div>
        ) : (
          <>
            {leftIcon && (
              <span className="flex items-center" style={{ fontSize: config.iconSize }}>
                {leftIcon}
              </span>
            )}
            <span>{children}</span>
            {rightIcon && (
              <span className="flex items-center" style={{ fontSize: config.iconSize }}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </span>
    </button>
  );
};


export default GradientButton