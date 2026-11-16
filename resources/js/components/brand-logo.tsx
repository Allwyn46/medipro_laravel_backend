import React from "react";

interface BrandLogoProps {
    className?: string;
    iconOnly?: boolean;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    variant?: "auto" | "light" | "dark";
    alt?: string;
}

export function SmartTechIcon({
    className = "h-7 w-auto",
}: {
    className?: string;
}) {
    return (
        <img
            src="/images/smart-tech-icon.png"
            alt="Smart Tech Infinity Emblem"
            className={`object-contain ${className}`}
        />
    );
}

export function BrandLogo({
    className = "",
    iconOnly = false,
    size = "md",
    variant = "auto",
    alt = "SMART TECH",
}: BrandLogoProps) {
    const heightClasses = {
        xs: "h-5 sm:h-6",
        sm: "h-6 sm:h-7",
        md: "h-8 sm:h-9",
        lg: "h-10 sm:h-11",
        xl: "h-12 sm:h-14",
    };

    if (iconOnly) {
        return (
            <img
                src="/images/smart-tech-icon.png"
                alt={alt}
                className={`${heightClasses[size]} w-auto object-contain shrink-0 ${className}`}
            />
        );
    }

    if (variant === "light") {
        // Explicitly white text for dark backgrounds
        return (
            <div className={`inline-flex items-center select-none ${className}`}>
                <img
                    src="/images/smart-tech-logo.png"
                    alt={alt}
                    className={`${heightClasses[size]} w-auto object-contain shrink-0`}
                />
            </div>
        );
    }

    if (variant === "dark") {
        // Explicitly dark text for light backgrounds
        return (
            <div className={`inline-flex items-center select-none ${className}`}>
                <img
                    src="/images/smart-tech-logo-dark.png"
                    alt={alt}
                    className={`${heightClasses[size]} w-auto object-contain shrink-0`}
                />
            </div>
        );
    }

    // Auto: Adapts to dark/light mode
    return (
        <div className={`inline-flex items-center select-none ${className}`}>
            <img
                src="/images/smart-tech-logo-dark.png"
                alt={alt}
                className={`${heightClasses[size]} w-auto object-contain shrink-0 dark:hidden`}
            />
            <img
                src="/images/smart-tech-logo.png"
                alt={alt}
                className={`${heightClasses[size]} w-auto object-contain shrink-0 hidden dark:block`}
            />
        </div>
    );
}

export default BrandLogo;
