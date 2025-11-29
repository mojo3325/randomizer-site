import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    variant === "default" && "bg-retro-phosphor text-black hover:bg-retro-phosphorDim",
                    variant === "outline" && "border border-retro-phosphor text-retro-phosphor hover:bg-retro-phosphor/10",
                    variant === "ghost" && "hover:bg-retro-phosphor/10 text-retro-phosphor",
                    size === "default" && "h-9 px-4 py-2",
                    size === "sm" && "h-8 rounded-md px-3 text-xs",
                    size === "lg" && "h-10 rounded-md px-8",
                    size === "icon" && "h-9 w-9",
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
