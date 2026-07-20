import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/portal/components/ui/button";
import { Input } from "@/portal/components/ui/input";
import { Label } from "@/portal/components/ui/label";
import { DynamicField } from "./DynamicField";
import type { OnboardField } from "@/portal/types/onboarding";

interface OnboardStartupProps {
  userInfo: {
    name: string;
    email: string;
    company_affiliation: string;
    role: string;
    tier: string;
    linkedin: string;
  };
  onSubmit: (data: {
    name: string;
    linkedin: string;
    company_affiliation: string;
    company_size: string;
    role: string;
    password: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
  simulationMode?: boolean;
  fieldConfig?: OnboardField[];
}

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"] as const;

const INPUT_CLASS =
  "h-12 text-base rounded-xl border-white/[0.15] bg-white/[0.08] text-white placeholder:text-white/30 focus:border-blue-500 focus:ring-blue-500/20";

const CARD_CLASS =
  "bg-white/[0.05] backdrop-blur-xl border border-white/[0.12] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] p-8 max-w-lg mx-auto";

function parseFirstLast(name: string) {
  const parts = name.trim().split(/\s+/);
  return { first: parts[0] || "", last: parts.slice(1).join(" ") || "" };
}

function StepCard({
  stepLabel,
  heading,
  slideStyle,
  onBack,
  children,
  footer,
}: {
  stepLabel: string;
  heading: string;
  slideStyle: React.CSSProperties;
  onBack: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div style={slideStyle} className="w-full max-w-lg">
        <div className={CARD_CLASS}>
          <p className="text-white/40 text-sm mb-2">{stepLabel}</p>
          <h2 className="text-2xl font-bold text-white mb-8">{heading}</h2>
          <div className="space-y-6">{children}</div>
          <div className="flex justify-between items-center mt-10">
            <button
              onClick={onBack}
              className="text-white/60 hover:text-white transition-colors text-sm"
            >
              Back
            </button>
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}

const OnboardStartup: React.FC<OnboardStartupProps> = ({
  userInfo,
  onSubmit,
  isSubmitting = false,
  simulationMode = false,
  fieldConfig,
}) => {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"right" | "left">("right");
  const [slideVisible, setSlideVisible] = useState(true);

  const { first, last } = parseFirstLast(userInfo.name);

  const [firstName, setFirstName] = useState(first);
  const [lastName, setLastName] = useState(last);
  const [linkedin, setLinkedin] = useState(userInfo.linkedin || "");
  const [companyName, setCompanyName] = useState(userInfo.company_affiliation || "");
  const [companySize, setCompanySize] = useState("");
  const [role, setRole] = useState(userInfo.role || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});

  const dynamicFields = useMemo<OnboardField[]>(
    () =>
      simulationMode && fieldConfig
        ? fieldConfig.filter((f) => !f.isCore && f.tiers.includes("startup"))
        : [],
    [simulationMode, fieldConfig],
  );

  // When fieldConfig is provided in sim mode: Welcome → Dynamic → Password (3 steps)
  // Real mode or sim without config: Welcome → Personal → Company → Password (4 steps)
  const useSimDynamic = simulationMode && !!fieldConfig;
  const passwordStep = useSimDynamic ? 2 : 3;

  const progressWidth = useSimDynamic
    ? [0, 50, 100][step] ?? 100
    : [0, 33, 66, 100][step] ?? 100;

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function navigateTo(nextStep: number) {
    setSlideDirection(nextStep > step ? "right" : "left");
    setSlideVisible(false);
    setTimeout(() => {
      setStep(nextStep);
      setSlideVisible(true);
    }, 100);
  }

  const handleContinue = () => navigateTo(step + 1);
  const handleBack = () => navigateTo(step - 1);

  async function handleSubmit() {
    if (simulationMode) {
      await onSubmit({
        name: `${firstName} ${lastName}`.trim(),
        linkedin,
        company_affiliation: companyName,
        company_size: companySize,
        role,
        password,
      });
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (password.length < 12) {
      setPasswordError("Password must be at least 12 characters");
      return;
    }
    setPasswordError("");
    await onSubmit({
      name: `${firstName} ${lastName}`.trim(),
      linkedin,
      company_affiliation: companyName,
      company_size: companySize,
      role,
      password,
    });
  }

  const slideStyle: React.CSSProperties = {
    opacity: slideVisible ? 1 : 0,
    transform: slideVisible
      ? "translateX(0)"
      : slideDirection === "right"
        ? "translateX(40px)"
        : "translateX(-40px)",
    transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
  };

  const continueButton = (
    <Button
      onClick={handleContinue}
      className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 h-auto font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 text-white"
    >
      Continue
    </Button>
  );

  return (
    <div className="min-h-screen text-white relative">
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
          style={{ width: `${progressWidth}%`, transition: "all 700ms ease-out" }}
        />
      </div>

      {step === 0 && (
        <div
          className="flex flex-col items-center justify-center min-h-screen px-4"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease-out" }}
        >
          <img
            src="/cxo-circle-logo.png"
            className="w-20 h-20 mb-8 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            alt="GCXO Logo"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Welcome to Global CXO Circle, {firstName || "there"}
          </h1>
          <p className="text-white/60 text-center max-w-md mb-10 text-lg leading-relaxed">
            Complete your profile to unlock mentorship, funding connections, and
            curated introductions to enterprise leaders.
          </p>
          <Button
            onClick={handleContinue}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-lg h-auto font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 text-white"
          >
            Begin Setup
          </Button>
        </div>
      )}

      {useSimDynamic && step === 1 && (
        <StepCard
          stepLabel="Step 1 of 2"
          heading="Tell us about yourself"
          slideStyle={slideStyle}
          onBack={handleBack}
          footer={continueButton}
        >
          {dynamicFields.length > 0 ? (
            dynamicFields.map((field) => (
              <DynamicField
                key={field.id}
                field={field}
                value={dynamicValues[field.id] ?? ""}
                onChange={(v) =>
                  setDynamicValues((prev) => ({ ...prev, [field.id]: v }))
                }
              />
            ))
          ) : (
            <p className="text-white/40 text-sm text-center py-4">
              No additional fields configured for this tier.
            </p>
          )}
        </StepCard>
      )}

      {!useSimDynamic && step === 1 && (
        <StepCard
          stepLabel="Step 1 of 3"
          heading="Tell us about yourself"
          slideStyle={slideStyle}
          onBack={handleBack}
          footer={continueButton}
        >
          <div>
            <Label className="text-white/70 mb-2 block">First Name</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={INPUT_CLASS}
              placeholder="First name"
            />
          </div>
          <div>
            <Label className="text-white/70 mb-2 block">Last Name</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Last name"
            />
          </div>
          <div>
            <Label className="text-white/70 mb-2 block">
              LinkedIn URL{" "}
              <span className="text-white/30 font-normal">(optional)</span>
            </Label>
            <Input
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className={INPUT_CLASS}
              placeholder="https://linkedin.com/in/yourname"
            />
          </div>
        </StepCard>
      )}

      {!useSimDynamic && step === 2 && (
        <StepCard
          stepLabel="Step 2 of 3"
          heading="About your company"
          slideStyle={slideStyle}
          onBack={handleBack}
          footer={continueButton}
        >
          <div>
            <Label className="text-white/70 mb-2 block">Company Name</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Company name"
            />
          </div>
          <div>
            <Label className="text-white/70 mb-3 block">Company Size</Label>
            <div className="grid grid-cols-5 gap-2">
              {COMPANY_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setCompanySize(size)}
                  className={`p-3 rounded-xl border cursor-pointer text-center text-sm transition-all duration-300 ${
                    companySize === size
                      ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                      : "border-white/[0.15] text-white/60 hover:border-white/30"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-white/70 mb-2 block">Title / Role</Label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={INPUT_CLASS}
              placeholder="e.g. CEO, CTO, Founder"
            />
          </div>
        </StepCard>
      )}

      {step === passwordStep && (
        <StepCard
          stepLabel={`Step ${useSimDynamic ? 2 : 3} of ${useSimDynamic ? 2 : 3}`}
          heading="Secure your account"
          slideStyle={slideStyle}
          onBack={handleBack}
          footer={
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-3 h-auto text-base font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 text-white"
            >
              {isSubmitting ? "Saving..." : "Launch Your Journey"}
            </Button>
          }
        >
          <div>
            <Label className="text-white/70 mb-2 block">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              className={INPUT_CLASS}
              placeholder="Create a password"
            />
          </div>
          <div>
            <Label className="text-white/70 mb-2 block">Confirm Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError("");
              }}
              className={INPUT_CLASS}
              placeholder="Confirm your password"
            />
            {passwordError && (
              <p className="text-red-400 text-sm mt-2">{passwordError}</p>
            )}
          </div>
          <div className="bg-white/[0.05] border border-white/[0.1] rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">Name</span>
              <span className="text-white/80">
                {firstName} {lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Company</span>
              <span className="text-white/80">
                {companyName}
                {companySize ? ` (${companySize})` : ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Role</span>
              <span className="text-white/80">{role}</span>
            </div>
          </div>
        </StepCard>
      )}
    </div>
  );
};

export default OnboardStartup;
