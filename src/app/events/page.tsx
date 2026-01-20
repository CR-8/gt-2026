"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowUpLeft } from 'lucide-react';
import { getAllEvents, type EventData } from '@/lib/eventMiddleware';

function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const eventsData = await getAllEvents();
      setEvents(eventsData);
      setLoading(false);
    }
    
    fetchEvents();
  }, []);

  // Icon mapping for different event categories
  const getIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case 'technology':
        return (
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'cultural':
        return (
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      case 'hackathon':
        return (
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 md:px-8 lg:px-16">
        {/* Back Link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8 sm:mb-10 md:mb-12 group"
        >
          <ArrowUpLeft className="w-4 h-4 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform" />
          <span className="text-sm">Back to Home</span>
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <span className="bg-neutral-300 h-1 w-8 sm:w-12"></span>
          <span className="text-lg sm:text-xl md:text-2xl tracking-tight">All Events</span>
        </div>

        {/* Title */}
        <div className="max-w-5xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-tight">
            <span className="text-white">Explore Our </span>
            <br className="hidden sm:block" />
            <span className="text-neutral-500">Events</span>
          </h1>
          <p className="mt-6 sm:mt-8 text-neutral-400 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed">
            Discover exciting competitions, workshops, and experiences designed for innovators, creators, and tech enthusiasts.
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-16 pb-20 sm:pb-24 md:pb-32">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-neutral-400 text-lg mb-4">No events available at the moment.</p>
            <p className="text-neutral-500 text-sm">Check back soon for upcoming events!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {events.map((event) => (
              <article
                key={event.slug}
                onClick={() => router.push(`/events/${event.slug}`)}
                className="group relative flex flex-col bg-neutral-900/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-neutral-800/50 hover:border-neutral-700 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                {/* Image */}
                {event.bannerUrl && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={event.bannerUrl}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex flex-col flex-1 p-5 sm:p-6 md:p-8">
                  {/* Category */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg">
                      {getIcon(event.category)}
                    </div>
                    <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 font-medium">
                      {event.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white leading-tight mb-3 group-hover:text-[var(--color-primary-cyan)] transition-colors">
                    {event.title}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-sm sm:text-base text-neutral-400 leading-relaxed line-clamp-3 mb-6 flex-1">
                    {event.shortDescription}
                  </p>

                  {/* Event Details */}
                  <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-neutral-500 mb-6">
                    {event.entryFee && (
                      <span className="flex items-center gap-1">
                        <span className="text-white font-medium">{event.entryFee}</span>
                      </span>
                    )}
                    {event.teamSize && (
                      <span>Team: {event.teamSize}</span>
                    )}
                    {event.prizePool && (
                      <span className="text-[var(--color-success)]">{event.prizePool} Prize</span>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center text-sm font-medium text-white group-hover:text-[var(--color-primary-cyan)] transition-colors">
                    View Details
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;
