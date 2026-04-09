import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = "", id, ...props }) => {
    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    {label}
                </label>
            )}
            <input
                id={id}
                className={cn(
                    "block w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white transition-all placeholder:text-zinc-500 focus:border-soul-pink focus:outline-none focus:ring-1 focus:ring-soul-pink",
                    error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "",
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        </div>
    );
};
