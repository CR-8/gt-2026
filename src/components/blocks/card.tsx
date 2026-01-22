import React from "react";

interface EventCardProps {
    title?: string;
    description?: string;
    category?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

function EventCard({ 
    title = "Event Title", 
    description = "Event Description", 
    category,
    icon,
    onClick,
    className = ""
}: EventCardProps) {
    return (
        <div 
            className={`group w-full backdrop-blur-sm rounded-2xl sm:rounded-3xl transition-all duration-300 p-5 sm:p-6 md:p-8 relative overflow-hidden cursor-pointer border border-neutral-800/50 hover:border-neutral-700 ${className}`}
            onClick={onClick}
        >
            {/* Category Label */}
            {category && (
                <div className="mb-4 sm:mb-5 md:mb-6">
                    <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-medium">
                        {category}
                    </span>
                </div>
            )}

            {/* Content Container */}
            <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
                {/* Icon */}
                {icon && (
                    <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center rounded-xl sm:rounded-2xl transition-colors duration-300">
                        {icon}
                    </div>
                )}

                {/* Title */}
                <h3 className="text-2xl sm:text-2xl md:text-3xl font-normal text-white leading-tight">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default EventCard;
