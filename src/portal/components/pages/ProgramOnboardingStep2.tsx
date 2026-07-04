import React, { useState, useEffect } from 'react';
import { Button } from '@/portal/components/ui/button';
import { Input } from '@/portal/components/ui/input';
import { Label } from '@/portal/components/ui/label';
import { Textarea } from '@/portal/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/portal/components/ui/select';
import { ArrowRight } from 'lucide-react';

export interface ProfileFormData {
  fullName: string;
  title: string;
  company: string;
  linkedinUrl: string;
  phone: string;
  timezone: string;
  bio: string;
  photoUrl: string;
}

interface ProgramOnboardingStep2Props {
  onNext: (data: ProfileFormData) => void;
  onBack: () => void;
  userData: {
    name: string;
    email: string;
    title?: string;
    company?: string;
    linkedin?: string;
    phone?: string;
    bio?: string;
  };
  isSaving?: boolean;
}

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Amsterdam',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
];

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'America/New_York';
  }
}

const ProgramOnboardingStep2: React.FC<ProgramOnboardingStep2Props> = ({
  onNext,
  onBack,
  userData,
  isSaving = false,
}) => {
  const [form, setForm] = useState<ProfileFormData>({
    fullName: userData.name,
    title: userData.title ?? '',
    company: userData.company ?? '',
    linkedinUrl: userData.linkedin ?? '',
    phone: userData.phone ?? '',
    timezone: detectTimezone(),
    bio: userData.bio ?? '',
    photoUrl: '',
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Sync from userData if it loads async (e.g. auth context hydrates after mount)
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      fullName: userData.name || prev.fullName,
      title: userData.title || prev.title,
      company: userData.company || prev.company,
      linkedinUrl: userData.linkedin || prev.linkedinUrl,
      phone: userData.phone || prev.phone,
      bio: userData.bio || prev.bio,
    }));
  }, [userData.name, userData.title, userData.company, userData.linkedin, userData.phone, userData.bio]);

  const set = (key: keyof ProfileFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    if (!form.fullName.trim()) errors.push('Full Name is required');
    if (!form.title.trim()) errors.push('Title is required');
    if (!form.company.trim()) errors.push('Company is required');
    if (!form.phone.trim()) errors.push('Phone is required');
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    onNext(form);
  };

  const inputClass =
    'h-10 rounded-xl border-navy-200 bg-white text-navy-900 placeholder:text-navy-400 focus-visible:ring-blue-500 focus-visible:border-blue-400 text-sm';
  const labelClass = 'text-navy-700 font-medium text-sm';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-navy-900">Your Account Details</h2>
        <p className="text-navy-500 text-sm">Help your partners get to know you.</p>
      </div>

      {/* Row: Full Name */}
      <div className="space-y-1.5">
        <Label htmlFor="fullName" className={labelClass}>Full Name</Label>
        <Input
          id="fullName"
          value={form.fullName}
          onChange={set('fullName')}
          placeholder="Jane Smith"
          className={inputClass}
          required
        />
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1">
          {validationErrors.map((err) => (
            <p key={err} className="text-xs text-red-700">{err}</p>
          ))}
        </div>
      )}

      {/* Row: Title + Company */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="title" className={labelClass}>Title <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            value={form.title}
            onChange={set('title')}
            placeholder="CIO"
            className={inputClass}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company" className={labelClass}>Company <span className="text-red-500">*</span></Label>
          <Input
            id="company"
            value={form.company}
            onChange={set('company')}
            placeholder="Acme Corp"
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* LinkedIn */}
      <div className="space-y-1.5">
        <Label htmlFor="linkedinUrl" className={labelClass}>LinkedIn URL</Label>
        <Input
          id="linkedinUrl"
          type="url"
          value={form.linkedinUrl}
          onChange={set('linkedinUrl')}
          placeholder="https://linkedin.com/in/yourprofile"
          className={inputClass}
        />
      </div>

      {/* Row: Phone + Timezone */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="phone" className={labelClass}>Phone <span className="text-red-500">*</span></Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+1 (555) 000-0000"
            className={inputClass}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="timezone" className={labelClass}>Timezone</Label>
          <Select
            value={form.timezone}
            onValueChange={(v) => setForm((prev) => ({ ...prev, timezone: v }))}
          >
            <SelectTrigger
              id="timezone"
              className="h-10 rounded-xl border-navy-200 bg-white text-navy-900 focus:ring-blue-500 text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz} className="text-sm">
                  {tz.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio" className={labelClass}>Bio / About</Label>
        <Textarea
          id="bio"
          value={form.bio}
          onChange={set('bio')}
          placeholder="A short introduction about yourself and your background..."
          className="rounded-xl border-navy-200 bg-white text-navy-900 placeholder:text-navy-400 focus-visible:ring-blue-500 focus-visible:border-blue-400 text-sm min-h-[80px] resize-none"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        <Button
          type="submit"
          disabled={isSaving}
          className="w-full h-11 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold shadow-lg shadow-navy-900/20 transition-all"
        >
          {isSaving ? 'Saving…' : 'Continue'}
          {!isSaving && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-navy-500 hover:text-navy-700 transition-colors text-center"
        >
          Back
        </button>
      </div>
    </form>
  );
};

export default ProgramOnboardingStep2;
