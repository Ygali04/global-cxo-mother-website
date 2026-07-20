import React from 'react';
import { Button } from '@/portal/components/ui/button';
import { Badge } from '@/portal/components/ui/badge';
import { Users, Clock, CalendarDays, ArrowRight } from 'lucide-react';
import type { OnboardingInfo } from '@/portal/api/types';

interface ProgramOnboardingStep1Props {
  onNext: () => void;
  info: OnboardingInfo;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'TBD';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const ProgramOnboardingStep1: React.FC<ProgramOnboardingStep1Props> = ({ onNext, info }) => {
  const { program, role, hours_committed, partners } = info;
  const isCxO = role === 'cxo';
  const partnerLabel = isCxO ? 'Startups' : 'CXOs';

  return (
    <div className="space-y-6">
      {/* Welcome heading */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-navy-900">
          Welcome to the <span className="text-blue-600">{program.name}</span>
        </h2>
        <p className="text-navy-500 text-sm leading-relaxed">
          {isCxO
            ? `You'll contribute ${program.hours_per_cxo} hours of advisory expertise across this program, helping startups grow through structured engagements.`
            : `You'll receive ${hours_committed} hours of advisory time from experienced CXOs who will help guide your startup.`}
        </p>
      </div>

      {/* Program details */}
      <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-navy-700 uppercase tracking-wide">Program Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <CalendarDays className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-navy-400 text-xs">Duration</p>
              <p className="font-medium text-navy-800">{program.duration_months} months</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-navy-400 text-xs">Hours committed</p>
              <p className="font-medium text-navy-800">{hours_committed}h</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays className="h-4 w-4 text-navy-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-navy-400 text-xs">Start date</p>
              <p className="font-medium text-navy-800">{formatDate(program.starts_at)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays className="h-4 w-4 text-navy-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-navy-400 text-xs">End date</p>
              <p className="font-medium text-navy-800">{formatDate(program.ends_at)}</p>
            </div>
          </div>
        </div>
        {program.description && (() => {
          // Split description by bullet separators (• or leading -) and
          // render as a vertical list so each point gets its own line.
          const parts = program.description
            .split(/\s*[•]\s*|\s+-\s+/)
            .map((s) => s.trim())
            .filter(Boolean);
          return parts.length > 1 ? (
            <ul className="text-xs text-navy-500 leading-relaxed border-t border-navy-100 pt-3 space-y-1.5 list-disc pl-4">
              {parts.map((pt, i) => <li key={i}>{pt}</li>)}
            </ul>
          ) : (
            <p className="text-xs text-navy-500 leading-relaxed border-t border-navy-100 pt-3">
              {program.description}
            </p>
          );
        })()}
      </div>

      {/* Matched partners */}
      {partners.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-navy-700">
              Your Matched {partnerLabel}
            </h3>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200/60 text-xs">
              {partners.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="flex items-center gap-3 rounded-lg border border-navy-100 bg-white p-3"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-navy-600 to-blue-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {partner.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-navy-900 text-sm truncate">{partner.name}</p>
                  <p className="text-xs text-navy-500 truncate">
                    {[partner.role, partner.company].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={onNext}
        className="w-full h-11 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold shadow-lg shadow-navy-900/20 transition-all"
      >
        Continue
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProgramOnboardingStep1;
