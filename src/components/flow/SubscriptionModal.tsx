import React, { useState } from 'react';
import { 
  X, Check, Sparkles, AlertCircle, ArrowUpRight, 
  Pause, Play, ShieldCheck, Mail, CheckCircle2, Zap 
} from 'lucide-react';
import { ClientProfile } from '../../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'pause' | 'upgrade';
  currentProfile: ClientProfile;
  onConfirmAction: (action: 'pause' | 'resume' | 'upgrade', targetPlan?: string, notes?: string) => Promise<void>;
}

const AVAILABLE_PLANS = [
  {
    name: 'Scale ($1,299/mo)',
    title: 'Scale Plan',
    price: '$1,299',
    period: '/ month ($999/mo quarterly • $899/mo yearly)',
    description: 'Perfect for growing creators & brands scaling organic video output.',
    features: [
      '1 Active Request at a time',
      'Daily sub-24h to 48h turnaround',
      'Unlimited revisions',
      'Short-form (Reels/TikTok/Shorts) & Long-form',
      'Native FEVIQO Flow portal access',
    ],
  },
  {
    name: 'Pro ($2,299/mo)',
    title: 'Pro Plan',
    price: '$2,299',
    period: '/ month ($1,999/mo quarterly • $1,799/mo yearly)',
    popular: true,
    description: 'Our most popular tier for high-volume channels and multi-platform brands.',
    features: [
      '2 Active Requests simultaneously (Double Output)',
      'Dedicated Senior Editor + Creative Director check',
      'Sub-24h turnaround on short-form',
      '4K ProRes Master exports',
      'Slack collaboration channel with your editor',
      'Free thumbnail & visual hook ideation',
    ],
  },
  {
    name: 'In-House Studio ($5,999/mo)',
    title: 'In-House Studio',
    price: '$5,999',
    period: '/ month ($4,999/mo quarterly • $4,699/mo yearly)',
    description: 'A full-scale remote editing studio embedded into your company workflow.',
    features: [
      '3+ Active Requests in continuous parallel production',
      'Dedicated Creative Director + 2 Dedicated Senior Editors',
      'Priority express queue with same-day delivery',
      'Advanced 3D motion graphics & custom VFX',
      'Multi-seat team accounts on FEVIQO Flow',
      'Direct WhatsApp & Slack sync',
    ],
  },
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  mode,
  currentProfile,
  onConfirmAction,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>(
    mode === 'upgrade' 
      ? currentProfile.plan.includes('Scale') ? 'Pro ($2,299/mo)' : 'In-House Studio ($5,999/mo)'
      : currentProfile.plan
  );
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      if (mode === 'pause') {
        await onConfirmAction('pause', undefined, notes);
        setCompletedMessage('Your subscription has been paused. Our partner team at partner@feviqo.com has been notified to assist you anytime.');
      } else {
        await onConfirmAction('upgrade', selectedPlan, notes);
        setCompletedMessage(`Successfully upgraded to ${selectedPlan}! The production team at partner@feviqo.com is now scaling your editor queue.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {completedMessage ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#22C55E] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              {mode === 'pause' ? 'Plan Successfully Paused' : 'Plan Upgrade Dispatched!'}
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {completedMessage}
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 max-w-md mx-auto space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <Mail className="w-4 h-4 text-[#22C55E]" />
                <span>Executive Alert Dispatched to <strong>partner@feviqo.com</strong></span>
              </div>
              <p className="text-slate-500">
                You can switch, resume, or adjust your workspace settings at any time with 1-click flexibility.
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer shadow-md mt-2"
            >
              Back to Workspace
            </button>
          </div>
        ) : mode === 'pause' ? (
          /* Pause Plan Flow */
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                <Pause className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">1-Click Flexibility</span>
                </div>
                <h3 className="text-2xl font-black text-slate-950 mt-1">Pause Your Subscription</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Zero lock-in contracts or cancellation stress. You can pause your plan now and resume anytime with a single click.
                </p>
              </div>
            </div>

            {/* Current status summary card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Current Plan:</span>
                <span className="font-bold text-slate-900">{currentProfile.plan}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Video Assets & Cuts:</span>
                <span className="font-bold text-emerald-700">100% Intact & Preserved</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Concierge Notification:</span>
                <span className="font-bold text-slate-700">Alerting partner@feviqo.com</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Any note for our team? (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Let us know if you are waiting on new footage, taking a seasonal break, or need any special assistance..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#22C55E] focus:bg-white transition resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Keep Plan Active
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Pausing Plan...</span>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Confirm Pause (1-Click)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Upgrade Plan Flow */
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#22C55E] flex items-center justify-center border border-emerald-200 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Instant Scale</span>
                </div>
                <h3 className="text-2xl font-black text-slate-950 mt-1">Upgrade Your Editing Capacity</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Double or triple your video output with simultaneous dedicated editors and priority turnaround.
                </p>
              </div>
            </div>

            {/* Plan Tiers Selection */}
            <div className="space-y-3">
              {AVAILABLE_PLANS.map((plan) => {
                const isSelected = selectedPlan === plan.name;
                const isCurrent = currentProfile.plan === plan.name;

                return (
                  <div
                    key={plan.name}
                    onClick={() => setSelectedPlan(plan.name)}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[#22C55E] bg-emerald-50/40 shadow-md'
                        : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-slate-950">{plan.title}</h4>
                          {plan.popular && (
                            <span className="px-2 py-0.5 rounded-full bg-[#22C55E] text-slate-950 text-[10px] font-black uppercase">
                              Most Popular
                            </span>
                          )}
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                              Current Plan
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">{plan.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xl font-black text-slate-950">{plan.price}</span>
                        <span className="text-xs text-slate-500">{plan.period}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Additional Instructions or Timeline Needs (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., We are launching a YouTube series next week and need immediate double queue throughput..."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#22C55E] focus:bg-white transition resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span>Zero lock-in contracts • Alerting partner@feviqo.com</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#1ebd52] text-slate-950 font-black text-xs transition cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Upgrading Plan...</span>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Confirm Upgrade (1-Click)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
