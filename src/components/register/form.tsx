"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { XIcon, CheckCircle2, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RegistrationFormProps {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  participationFee: string;
  teamSize: string;
  onClose: () => void;
}

export function RegistrationForm({
  eventId,
  eventTitle,
  participationFee,
  teamSize,
  onClose,
}: RegistrationFormProps) {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    leaderEmail: '',
    leaderPhone: '',
    college: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.teamName || !formData.leaderName || !formData.leaderEmail || !formData.leaderPhone || !formData.college) {
      setSubmitStatus('error');
      setSubmitMessage('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.leaderEmail)) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a valid email address');
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.leaderPhone)) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setSubmitStatus('processing');
      setSubmitMessage('Creating your registration...');

      // Step 1: Register team
      const registerResponse = await fetch('/api/teams/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          team_name: formData.teamName,
          college_name: formData.college,
          captain: {
            name: formData.leaderName,
            email: formData.leaderEmail,
            contact: formData.leaderPhone,
          },
        }),
      });

      if (!registerResponse.ok) {
        const error = await registerResponse.json();
        throw new Error(error.error || 'Registration failed');
      }

      const { team_id, amount_payable } = await registerResponse.json();

      // Step 2: Create Razorpay order
      setSubmitMessage('Preparing payment...');
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const { order_id, amount, currency, key_id } = await orderResponse.json();

      // Step 3: Initialize Razorpay
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'Gantavya 2026',
        description: `Registration for ${eventTitle}`,
        order_id: order_id,
        handler: function (response: any) {
          // Payment successful
          setSubmitStatus('success');
          setSubmitMessage('Payment successful! Registration complete. You will receive a confirmation email shortly.');
          
          // Close after 3 seconds
          setTimeout(() => {
            setFormData({
              teamName: '',
              leaderName: '',
              leaderEmail: '',
              leaderPhone: '',
              college: '',
            });
            onClose();
          }, 3000);
        },
        prefill: {
          name: formData.leaderName,
          email: formData.leaderEmail,
          contact: formData.leaderPhone,
        },
        theme: {
          color: '#ea580c',
        },
        modal: {
          ondismiss: function() {
            setSubmitStatus('error');
            setSubmitMessage('Payment cancelled. Your registration is saved but payment is pending.');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Registration failed. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl h-[90vh] max-h-[700px] bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-neutral-800 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Register for {eventTitle}</h2>
              <p className="text-sm text-neutral-400">
                Fill in the details below to register your team
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              {/* Success/Error Messages */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-300">Registration Successful!</h3>
                    <p className="text-sm text-green-200 mt-1">{submitMessage}</p>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-300">Registration Failed</h3>
                    <p className="text-sm text-red-200 mt-1">{submitMessage}</p>
                  </div>
                </div>
              )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Info */}
              <div className="p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-500">Entry Fee:</span>
                    <span className="ml-2 text-white font-semibold">{participationFee}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Team Size:</span>
                    <span className="ml-2 text-white font-semibold">{teamSize}</span>
                  </div>
                </div>
              </div>

              {/* Team Name */}
              <div className="space-y-2">
                <Label htmlFor="teamName" className="text-sm font-medium text-white">
                  Team Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="teamName"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  placeholder="Enter your team name"
                  className="bg-neutral-800 border-neutral-700 text-white"
                  required
                />
              </div>

              {/* Team Leader Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-neutral-800 pb-2">
                  Team Leader Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leaderName" className="text-sm font-medium text-white">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="leaderName"
                      name="leaderName"
                      value={formData.leaderName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leaderEmail" className="text-sm font-medium text-white">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="leaderEmail"
                      name="leaderEmail"
                      type="email"
                      value={formData.leaderEmail}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leaderPhone" className="text-sm font-medium text-white">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="leaderPhone"
                      name="leaderPhone"
                      value={formData.leaderPhone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="college" className="text-sm font-medium text-white">
                      College/Institution <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="college"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      placeholder="Your college name"
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="p-4 bg-orange-900/20 border border-orange-700/50 rounded-lg">
                <p className="text-sm text-orange-200">
                  <strong>Note:</strong> You can add team members after completing initial registration. 
                  A confirmation email will be sent with further instructions.
                </p>
              </div>
            </form>
          </div>
        </ScrollArea>
      </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 border-t border-neutral-800 p-6">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={submitStatus === 'success' || submitStatus === 'processing'}
            >
              {submitStatus === 'processing' ? 'Processing...' : submitStatus === 'success' ? 'Registered!' : 'Proceed to Payment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
