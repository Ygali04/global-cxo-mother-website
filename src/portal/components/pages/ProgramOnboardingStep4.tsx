import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/portal/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { OnboardingProgramInfo } from '@/portal/api/types';

function formatDate(iso: string | null): string {
  if (!iso) return 'TBD';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

interface ProgramOnboardingStep4Props {
  program: OnboardingProgramInfo;
  role: string;
  hoursCommitted: number;
  partnersCount: number;
}

interface SummaryRowProps {
  label: string;
  value: React.ReactNode;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-navy-100 last:border-0">
      <span className="text-sm text-navy-500">{label}</span>
      <span className="text-sm font-medium text-navy-800">{value}</span>
    </div>
  );
}

const ProgramOnboardingStep4: React.FC<ProgramOnboardingStep4Props> = ({
  program,
  role,
  hoursCommitted,
  partnersCount,
}) => {
  const isCxO = role === 'cxo';

  return (
    <div className="space-y-6 text-center">
      {/* Green checkmark */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-navy-900">You're All Set!</h2>
          <p className="text-navy-500 text-sm leading-relaxed">
            Your onboarding is complete. Welcome to the {program.name}.
          </p>
        </div>
      </div>

      {/* Summary grid */}
      <div className="rounded-xl border border-navy-100 bg-white text-left p-1 divide-y divide-navy-50">
        <SummaryRow label="Program" value={program.name} />
        <SummaryRow
          label="Your Role"
          value={
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isCxO ? 'bg-amber-100 text-amber-700' : 'bg-cyan-100 text-cyan-700'
              }`}
            >
              {isCxO ? 'CxO Advisor' : 'Startup'}
            </span>
          }
        />
        <SummaryRow
          label="Duration"
          value={`${program.duration_months} months (${formatDate(program.starts_at)} – ${formatDate(program.ends_at)})`}
        />
        <SummaryRow label="Hours committed" value={`${hoursCommitted}h`} />
        <SummaryRow
          label="Calendar"
          value={
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Connected
            </span>
          }
        />
        <SummaryRow
          label={isCxO ? 'Startups assigned' : 'CXO advisors'}
          value={`${partnersCount} matched`}
        />
      </div>

      {/* CTA */}
      <Button
        asChild
        className="w-full h-11 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold shadow-lg shadow-navy-900/20 transition-all"
      >
        <Link to="/dashboard">
          Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>

      <p className="text-xs text-navy-400">
        Need help?{' '}
        <a href="mailto:programs@globalciocircle.com" className="underline hover:text-navy-600 transition-colors">
          Contact us
        </a>
      </p>
    </div>
  );
};

export default ProgramOnboardingStep4;
