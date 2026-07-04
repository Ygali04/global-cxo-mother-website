import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/portal/components/ui/button";
import { Input } from "@/portal/components/ui/input";
import { Label } from "@/portal/components/ui/label";
import { DynamicField } from "./DynamicField";
import type { OnboardField } from "@/portal/types/onboarding";

interface OnboardCxOProps {
  userInfo: {
    name: string;
    email: string;
    company_affiliation: string;
    role: string;
    tier: string;
  };
  onSubmit: (password: string) => Promise<void>;
  isSubmitting?: boolean;
  simulationMode?: boolean;
  fieldConfig?: OnboardField[];
}

const DARK_INPUT_CLASS =
  "h-12 text-base rounded-xl border-white/[0.15] bg-white/[0.08] text-white placeholder:text-white/30 focus-visible:ring-blue-500";

const OnboardCxO: React.FC<OnboardCxOProps> = ({
  userInfo,
  onSubmit,
  isSubmitting = false,
  simulationMode = false,
  fieldConfig,
}) => {
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [stepVisible, setStepVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});

  const firstName = userInfo.name.split(" ")[0];

  const dynamicFields = useMemo<OnboardField[]>(
    () =>
      simulationMode && fieldConfig
        ? fieldConfig.filter((f) => !f.isCore && f.tiers.includes("cxo"))
        : [],
    [simulationMode, fieldConfig],
  );

  const hasDynamicStep = dynamicFields.length > 0;
  // Steps: 1=Welcome, 2=Dynamic (if any), 3=Password (or 2 when no dynamic step)
  const passwordStep = hasDynamicStep ? 3 : 2;
  const totalSteps = hasDynamicStep ? 3 : 2;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  function goToStep(n: number) {
    setStep(n);
    setStepVisible(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setStepVisible(true));
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (simulationMode) {
      await onSubmit(password);
      return;
    }
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    await onSubmit(password);
  };

  const slideInStyle: React.CSSProperties = {
    opacity: stepVisible ? 1 : 0,
    transform: stepVisible ? "translateX(0)" : "translateX(60px)",
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
      {step === 1 && (
        <div
          className="flex flex-col items-center text-center max-w-lg transition-all duration-700 ease-out"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <img
            src="/cxo-circle-logo.png"
            className="w-20 h-20 mb-8 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            alt="Global CXO Circle Logo"
          />
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Welcome to Global CXO Circle, {firstName}
          </h1>
          <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-md">
            You've been invited to join an exclusive network of technology
            leaders shaping the future of enterprise innovation.
          </p>
          <div className="w-48 h-px mb-10 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <Button
            onClick={() => goToStep(2)}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-lg h-auto font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 text-white"
          >
            Get Started
          </Button>
        </div>
      )}

      {hasDynamicStep && step === 2 && (
        <div
          className="w-full max-w-md transition-all duration-500 ease-out"
          style={slideInStyle}
        >
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.12] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] p-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Additional Information
            </h2>
            <p className="text-white/60 mb-6">Please fill in the fields below.</p>
            <div className="space-y-5">
              {dynamicFields.map((field) => (
                <DynamicField
                  key={field.id}
                  field={field}
                  theme="navy"
                  value={dynamicValues[field.id] ?? ""}
                  onChange={(v) =>
                    setDynamicValues((prev) => ({ ...prev, [field.id]: v }))
                  }
                />
              ))}
            </div>
            <Button
              onClick={() => goToStep(3)}
              className="w-full mt-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-lg h-auto font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 text-white"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === passwordStep && (
        <div
          className="w-full max-w-md transition-all duration-500 ease-out"
          style={slideInStyle}
        >
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.12] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Almost there</h2>
            <p className="text-white/60 mb-6">
              Your profile has been set up by the GCXO team.
            </p>
            <div className="bg-white/[0.05] border border-white/[0.1] rounded-xl p-5 mb-8 space-y-3">
              <ProfileRow label="Name" value={userInfo.name} />
              <ProfileRow label="Email" value={userInfo.email} />
              <ProfileRow label="Company" value={userInfo.company_affiliation} />
              <ProfileRow label="Role" value={userInfo.role} />
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-white">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className={DARK_INPUT_CLASS}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className={DARK_INPUT_CLASS}
                />
              </div>
              <p className="text-white/40 text-sm">
                At least 12 characters with a mix of letters and numbers.
              </p>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-lg h-auto font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 disabled:opacity-50 text-white"
              >
                {isSubmitting ? "Setting up..." : "Complete Setup"}
              </Button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const ProfileRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between items-center">
    <span className="text-white/40 text-sm">{label}</span>
    <span className="text-white text-sm font-medium">{value}</span>
  </div>
);

export default OnboardCxO;
