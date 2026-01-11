"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { getEventBySlug, type EventData } from '@/lib/eventMiddleware';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { RegistrationForm } from '@/components/register/form';

function EventPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      const eventData = await getEventBySlug(slug);
      setEvent(eventData);
      setLoading(false);
    }
    
    fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Event Not Found</h1>
          <Link href="/#events" className="text-blue-500 hover:underline">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Breadcrumb */}
      <div className="border-b border-neutral-800/50 backdrop-blur-sm py-5 px-6 sm:px-8 lg:px-16">
        <Breadcrumb>
          <BreadcrumbList className="text-neutral-400 text-sm">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="hover:text-white transition-colors flex items-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-neutral-600" />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/#events" className="hover:text-white transition-colors">
                  Events
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-neutral-600" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white font-medium">
                {event.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-6 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-16">
        {/* Event Header */}
        <div className="mb-12 lg:mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 text-xs uppercase tracking-wider text-neutral-400 mb-6">
            {event.category}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 lg:mb-8 leading-tight tracking-tight">
            {event.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-neutral-400">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-medium">Gantavya Team</span>
            </div>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {event.date}
            </span>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{event.readTime}</span>
            </div>
          </div>
        </div>

        {/* 8:3 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 lg:gap-12">
          {/* Main Content - 8 columns */}
          <div className="lg:col-span-8">
            {/* Event Poster */}
            <div className="mb-10 lg:mb-12 rounded-2xl lg:rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-900 to-black border border-neutral-800/50 aspect-video relative group hover:border-neutral-700/50 transition-all duration-300">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-purple-600/40 to-pink-600/40 opacity-60 group-hover:opacity-70 transition-opacity"></div>
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold opacity-20 text-center leading-tight">{event.title}</span>
              </div>
            </div>

            {/* Event Details Bar */}
            <div className="mb-10 lg:mb-12 p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-neutral-900/80 to-black/80 backdrop-blur-sm border border-neutral-800/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
                <div className="group">
                  <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2 font-medium">Date</div>
                  <div className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors">{event.date}</div>
                </div>
                <div className="group">
                  <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2 font-medium">Time</div>
                  <div className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors">{event.time}</div>
                </div>
                <div className="group">
                  <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2 font-medium">Location</div>
                  <div className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors">{event.location}</div>
                </div>
              </div>
            </div>

            {/* Markdown Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({...props}) => <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />,
                  h2: ({...props}) => <h2 className="text-3xl font-bold mt-8 mb-4 border-b border-neutral-800 pb-2" {...props} />,
                  h3: ({...props}) => <h3 className="text-2xl font-semibold mt-6 mb-3" {...props} />,
                  h4: ({...props}) => <h4 className="text-xl font-semibold mt-4 mb-2" {...props} />,
                  p: ({...props}) => <p className="text-neutral-300 leading-relaxed mb-4" {...props} />,
                  ul: ({...props}) => <ul className="list-disc list-inside mb-4 space-y-2 text-neutral-300" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-neutral-300" {...props} />,
                  li: ({...props}) => <li className="ml-4" {...props} />,
                  blockquote: ({...props}) => (
                    <blockquote className="border-l-4 border-blue-600 pl-4 py-2 my-6 italic text-neutral-400 bg-black/50 rounded-r-lg" {...props} />
                  ),
                  code: ({inline, ...props}: {inline?: boolean} & React.HTMLAttributes<HTMLElement>) => 
                    inline ? (
                      <code className="bg-neutral-800 px-2 py-1 rounded text-sm text-blue-400" {...props} />
                    ) : (
                      <code className="block bg-black p-4 rounded-lg overflow-x-auto text-sm my-4" {...props} />
                    ),
                  table: ({...props}) => (
                    <div className="overflow-x-auto my-6">
                      <table className="w-full border-collapse border border-neutral-800" {...props} />
                    </div>
                  ),
                  th: ({...props}) => <th className="border border-neutral-800 px-4 py-2 bg-black text-left font-semibold" {...props} />,
                  td: ({...props}) => <td className="border border-neutral-800 px-4 py-2" {...props} />,
                  a: ({href, ...props}) => {
                    const isJavaScript = typeof href === 'string' && href.startsWith('javascript:');
                    const sanitizedHref = isJavaScript ? '#' : href;
                    const isExternal = typeof sanitizedHref === 'string' && sanitizedHref.startsWith('http');
                    return (
                      <a 
                        href={sanitizedHref} 
                        className="text-blue-500 hover:text-blue-400 underline" 
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        {...props} 
                      />
                    );
                  },
                  img: ({src, alt, ...props}) => {
                    const isJavaScript = typeof src === 'string' && src.startsWith('javascript:');
                    const sanitizedSrc = isJavaScript ? '' : (typeof src === 'string' ? src : '');
                    
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={sanitizedSrc} 
                        alt={alt || 'Event image'} 
                        className="rounded-lg my-4 max-w-full h-auto"
                        loading="lazy"
                        {...props} 
                      />
                    );
                  },
                }}
              >
                {event.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Sidebar - 3 columns */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Register Now Card */}
              <div className="p-6 lg:p-7 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40">
                <h3 className="text-xl font-bold mb-5 text-white">Register Now</h3>
                <div className='flex flex-col justify-center items-center gap-3'>
                    <button 
                    onClick={() => setIsFormOpen(true)}
                    className="w-full py-3.5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-neutral-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                    >
                    Register for Event
                    </button>
                    <button 
                    onClick={() => setIsFormOpen(true)}
                    className="w-full py-3.5 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                    Download Brochure
                    </button>
                </div>
              </div>
              

              {/* Prize Pool Card */}
              {event.prizePool && event.prizePool !== 'N/A' && (
                <div className="p-6 lg:p-7 rounded-2xl bg-gradient-to-br from-neutral-900/80 to-black/80 backdrop-blur-sm border border-neutral-800/50 hover:border-neutral-700/50 transition-all duration-300">
                  <h3 className="text-xs uppercase tracking-wider font-semibold mb-4 text-neutral-400">Prize Pool</h3>
                  <div className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-6">{event.prizePool}</div>
                  {event.prizes && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
                        <span className="text-neutral-300 text-sm font-medium">🥇 First Prize</span>
                        <span className="font-bold text-yellow-500">{event.prizes.first}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-gray-400/20 hover:border-gray-400/40 transition-colors">
                        <span className="text-neutral-300 text-sm font-medium">🥈 Second Prize</span>
                        <span className="font-bold text-gray-400">{event.prizes.second}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-orange-600/20 hover:border-orange-600/40 transition-colors">
                        <span className="text-neutral-300 text-sm font-medium">🥉 Third Prize</span>
                        <span className="font-bold text-orange-600">{event.prizes.third}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Participation Details */}
              <div className="p-6 lg:p-7 rounded-2xl bg-gradient-to-br from-neutral-900/80 to-black/80 backdrop-blur-sm border border-neutral-800/50 hover:border-neutral-700/50 transition-all duration-300">
                <h3 className="text-xs uppercase tracking-wider font-semibold mb-5 text-neutral-400">Participation Details</h3>
                <div className="space-y-5">
                  <div className="p-4 rounded-lg bg-black/40 border border-neutral-800/50">
                    <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2 font-medium">Entry Fee</div>
                    <div className="text-xl font-bold text-white">{event.participationFee}</div>
                  </div>
                  <div className="p-4 rounded-lg bg-black/40 border border-neutral-800/50">
                    <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2 font-medium">Team Size</div>
                    <div className="text-xl font-bold text-white">{event.teamSize}</div>
                  </div>
                </div>
              </div>

              {/* Share Card */}
              <div className="p-6 lg:p-7 rounded-2xl bg-gradient-to-br from-neutral-900/80 to-black/80 backdrop-blur-sm border border-neutral-800/50 hover:border-neutral-700/50 transition-all duration-300">
                <h3 className="text-xs uppercase tracking-wider font-semibold mb-4 text-neutral-400">Share This Event</h3>
                <div className="flex gap-3">
                  <button className="flex-1 p-3 bg-neutral-800/80 hover:bg-neutral-700 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-neutral-700/50">
                    <svg className="w-5 h-5 mx-auto text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <button className="flex-1 p-3 bg-neutral-800/80 hover:bg-neutral-700 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-neutral-700/50">
                    <svg className="w-5 h-5 mx-auto text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                  <button className="flex-1 p-3 bg-neutral-800/80 hover:bg-neutral-700 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-neutral-700/50">
                    <svg className="w-5 h-5 mx-auto text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Back to Top Button */}
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full p-3.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 transition-all duration-300 flex items-center justify-center gap-2 border border-neutral-700/50 hover:border-neutral-600/50 hover:scale-[1.02] active:scale-[0.98] group"
              >
                <svg className="w-4 h-4 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span className="font-medium">Back to top</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form Modal */}
      {isFormOpen && (
        <RegistrationForm
          eventTitle={event.title}
          eventSlug={event.slug}
          participationFee={event.participationFee || 'Free'}
          teamSize={event.teamSize || '1-4'}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}

export default EventPage;
