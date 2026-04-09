import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold" | "lavender" | "soul";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    className = "",
    disabled,
    ...props
}) => {
    const baseStyles =
        "inline-flex items-center justify-center rounded-xl font-semibold tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95";

    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-lg shadow-indigo-500/20",
        secondary: "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-400 shadow-lg shadow-rose-500/20",
        outline: "glass border-white/10 text-white hover:bg-white/10 focus:ring-zinc-200",
        ghost: "bg-transparent hover:bg-white/5 text-zinc-300 hover:text-white focus:ring-white/10",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 shadow-sm",
        gold: "btn-soul",
        soul: "btn-soul",
        lavender: "bg-indigo-400/20 text-indigo-200 hover:bg-indigo-400/30 border border-indigo-400/30 backdrop-blur-sm",
    };

    const sizes = {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3.5 text-base",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            ) : null}
            {children}
        </button>
    );
};
