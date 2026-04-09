import { cn } from "@/lib/utils";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    footer?: React.ReactNode;
    variant?: "default" | "glass" | "glass-dark";
}

export const Card: React.FC<CardProps> = ({
    children,
    className = "",
    title,
    description,
    footer,
    variant = "default",
}) => {
    const variants = {
        default: "bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900 border shadow-sm",
        glass: "glass text-white border-white/10 shadow-2xl",
        "glass-dark": "glass-dark text-white border-white/5 shadow-2xl",
    };

    return (
        <div
            className={cn(
                "overflow-hidden rounded-[2rem] transition-all duration-300",
                variants[variant],
                className
            )}
        >
            {(title || description) && (
                <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-900">
                    {title && (
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className="px-6 py-5">{children}</div>
            {footer && (
                <div className="bg-zinc-50/50 px-6 py-4 dark:bg-zinc-900/20">
                    {footer}
                </div>
            )}
        </div>
    );
};
