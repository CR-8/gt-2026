"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { getEventBySlug, type EventData } from '@/lib/eventMiddleware';
import { Button } from '@/components/ui/button';
import { RegistrationForm } from '@/components/register/form';
import { Download, Users, Trophy, IndianRupee, ArrowUp, ChevronLeft, CheckCircle } from 'lucide-react';

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
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Event Not Found</h1>
          <p className="text-neutral-400 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Button asChild variant="outline">
            <Link href="/#events" className="inline-flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Events
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Main Content */}
      <div className="mx-auto px-8 lg:px-16 py-12">
        {/* Event Header */}
        <div className="mb-12">
          <Button asChild variant="ghost" className="mb-6 -ml-2 mx-4">
            <Link href="/events" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white">
              <ChevronLeft className="w-4 h-5" />
              Back to Events
            </Link>
          </Button>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent">
            {event.title}
          </h1>
        </div>

        {/* 8:3 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-8">
          {/* Main Content - 8 columns */}
          <div className="lg:col-span-8">
            {/* Event Banner */}
            <div className="mb-12 rounded-2xl overflow-hidden aspect-video relative border border-neutral-800">
              {event.bannerUrl ? (
                <img
                  src={event.bannerUrl}
                  alt={`${event.title} banner`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-red-600/20 to-pink-600/20"></div>
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-8">
                      <div className="text-5xl md:text-6xl lg:text-7xl font-bold opacity-20 text-white leading-tight">
                        {event.title}
                      </div>
                      <div className="mt-4 text-neutral-400 text-sm uppercase tracking-wider">
                        {event.category}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* About Section */}
            {event.fullDescription && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-white">About This Event</h2>
                <p className="text-neutral-300 leading-relaxed text-lg">{event.fullDescription}</p>
              </div>
            )}

            {/* Markdown Content */}
            {event.content && (
              <div className="prose prose-invert prose-lg max-w-none">
                <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({...props}) => <h1 className="text-4xl font-bold mt-8 mb-6 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent" {...props} />,
                  h2: ({...props}) => <h2 className="text-3xl font-bold mt-8 mb-4 border-b border-neutral-800 pb-3" {...props} />,
                  h3: ({...props}) => <h3 className="text-2xl font-semibold mt-6 mb-3 text-neutral-100" {...props} />,
                  h4: ({...props}) => <h4 className="text-xl font-semibold mt-4 mb-2 text-neutral-200" {...props} />,
                  p: ({...props}) => <p className="text-neutral-300 leading-relaxed mb-4 text-base" {...props} />,
                  ul: ({...props}) => <ul className="list-disc list-inside mb-6 space-y-2 text-neutral-300" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal list-inside mb-6 space-y-2 text-neutral-300" {...props} />,
                  li: ({...props}) => <li className="ml-4 leading-relaxed" {...props} />,
                  blockquote: ({...props}) => (
                    <blockquote className="border-l-4 border-orange-600 pl-6 py-3 my-6 italic text-neutral-300 bg-orange-600/5 rounded-r-lg" {...props} />
                  ),
                  code: ({inline, ...props}: {inline?: boolean} & React.HTMLAttributes<HTMLElement>) => 
                    inline ? (
                      <code className="bg-neutral-800 px-2 py-1 rounded text-sm text-orange-400 font-mono" {...props} />
                    ) : (
                      <code className="block bg-black/70 p-4 rounded-lg overflow-x-auto text-sm my-4 border border-neutral-800 font-mono" {...props} />
                    ),
                  table: ({...props}) => (
                    <div className="overflow-x-auto my-6 rounded-lg border border-neutral-800">
                      <table className="w-full border-collapse" {...props} />
                    </div>
                  ),
                  th: ({...props}) => <th className="border-b border-neutral-800 px-4 py-3 bg-neutral-800/50 text-left font-semibold text-white" {...props} />,
                  td: ({...props}) => <td className="border-b border-neutral-800 px-4 py-3 text-neutral-300" {...props} />,
                  a: ({href, ...props}) => {
                    const isJavaScript = typeof href === 'string' && href.startsWith('javascript:');
                    const sanitizedHref = isJavaScript ? '#' : href;
                    const isExternal = typeof sanitizedHref === 'string' && sanitizedHref.startsWith('http');
                    return (
                      <a 
                        href={sanitizedHref} 
                        className="text-orange-500 hover:text-orange-400 underline decoration-orange-500/30 hover:decoration-orange-400 transition-colors" 
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
                        className="rounded-lg my-6 max-w-full h-auto border border-neutral-800"
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
            )}
          </div>

          {/* Sidebar - 3 columns */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Register Now Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 shadow-lg shadow-orange-600/20">
                <h3 className="text-xl font-bold mb-4 text-white">Ready to Participate?</h3>
                <div className='flex flex-col gap-3'>
                  {event.registrationOpen ? (
                    <Button 
                      onClick={() => setIsFormOpen(true)}
                      className="w-full bg-white text-orange-600 hover:bg-neutral-100 font-semibold shadow-md"
                      size="lg"
                    >
                      Register Now
                    </Button>
                  ) : (
                    <Button 
                      disabled
                      className="w-full bg-white/50 text-orange-600/50 font-semibold cursor-not-allowed"
                      size="lg"
                    >
                      Registration Closed
                    </Button>
                  )}
                  {event.rulebookUrl && (
                    <Button 
                      onClick={() => window.open(event.rulebookUrl || '#', '_blank')}
                      variant="outline"
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                      size="lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Rulebook
                    </Button>
                  )}
                </div>
              </div>
              {/* Prize Pool Card */}
              {event.prizePool && event.prizePool !== 'N/A' && (
                <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Prize Pool</h3>
                  </div>
                  <div className="text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    {event.prizePool}
                  </div>
                  {event.prizes && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <span className="text-neutral-300 flex items-center gap-2">
                          <span className="text-lg">🥇</span> First Prize
                        </span>
                        <span className="font-semibold text-yellow-500">{event.prizes.first}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-neutral-800/50">
                        <span className="text-neutral-300 flex items-center gap-2">
                          <span className="text-lg">🥈</span> Second Prize
                        </span>
                        <span className="font-semibold text-gray-400">{event.prizes.second}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-orange-600/10 border border-orange-600/20">
                        <span className="text-neutral-300 flex items-center gap-2">
                          <span className="text-lg">🥉</span> Third Prize
                        </span>
                        <span className="font-semibold text-orange-500">{event.prizes.third}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Participation Details */}
              <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm">
                <h3 className="text-sm font-semibold mb-4 text-neutral-400 uppercase tracking-wider">Participation Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-600/10 border border-green-600/20">
                      <IndianRupee className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-neutral-500 mb-1">Entry Fee</div>
                      <div className="text-lg font-semibold text-white">{event.entryFee || 'Free'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-orange-600/10 border border-orange-600/20">
                      <Users className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-neutral-500 mb-1">Team Size</div>
                      <div className="text-lg font-semibold text-white">{event.teamSize || '1'} members</div>
                    </div>
                  </div>
                  {event.registrationOpen !== undefined && (
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${event.registrationOpen ? 'bg-green-600/10 border border-green-600/20' : 'bg-red-600/10 border border-red-600/20'}`}>
                        <CheckCircle className={`w-5 h-5 ${event.registrationOpen ? 'text-green-400' : 'text-red-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-neutral-500 mb-1">Registration Status</div>
                        <div className={`text-lg font-semibold ${event.registrationOpen ? 'text-green-400' : 'text-red-400'}`}>
                          {event.registrationOpen ? 'Open' : 'Closed'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Back to Top Button */}
              <Button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                variant="outline"
                className="w-full bg-neutral-800/50 hover:bg-neutral-800 border-neutral-700"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Back to top
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form Modal */}
      {isFormOpen && event.id && (
        <RegistrationForm
          eventId={event.id}
          eventSlug={event.slug}
          eventTitle={event.title}
          participationFee={event.entryFee || 'Free'}
          teamSize={event.teamSize || '1-4'}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}

export default EventPage;
