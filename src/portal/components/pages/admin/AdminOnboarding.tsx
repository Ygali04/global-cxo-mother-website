import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Rocket, TrendingUp, UserCheck, X, CheckCircle, Calendar, Users, FlaskConical, Send } from "lucide-react";
import { walkOnboardingApi } from "@/portal/api/sandbox";
import { toast } from "sonner";
import OnboardCxO from "@/portal/components/pages/onboarding/OnboardCxO";
import OnboardStartup from "@/portal/components/pages/onboarding/OnboardStartup";
import AdminOnboardingEditor from "./AdminOnboardingEditor";
import { loadOnboardingSchema } from "@/portal/types/onboarding";
import type { OnboardField } from "@/portal/types/onboarding";

type SimulatorFlow = "cxo" | "startup" | null;
type SimulatorStep = "email" | "flow-select" | "form" | "calendar" | "complete" | "login";
type OnboardingFlow = "regular" | "cohort";
type Tab = "simulator" | "editor";

const CXO_MOCK_USER = {
  name: "Jane Rodriguez",
  email: "jane@enterprise.com",
  company_affiliation: "Acme Corp",
  role: "Chief Information Officer",
  tier: "cxo",
};

const STARTUP_MOCK_USER = {
  name: "Alex Kim",
  email: "alex@startup.io",
  company_affiliation: "TechVenture AI",
  role: "Founder & CEO",
  tier: "startup",
  linkedin: "https://linkedin.com/in/alexkim",
};

const previewCards = [
  {
    id: "cxo" as const,
    title: "CxO Preview",
    description:
      "Experience the onboarding flow as a Chief Information Officer joining the network.",
    icon: UserCheck,
    borderColor: "border-blue-200 hover:border-blue-400",
    iconColor: "text-blue-600",
    enabled: true,
  },
  {
    id: "startup" as const,
    title: "Startup Preview",
    description:
      "Experience the onboarding flow as a startup founder seeking CXO partnerships.",
    icon: Rocket,
    borderColor: "border-cyan-200 hover:border-cyan-400",
    iconColor: "text-cyan-600",
    enabled: true,
  },
  {
    id: "vc" as const,
    title: "VC Preview",
    description:
      "Experience the onboarding flow as a venture capital partner. Coming soon.",
    icon: TrendingUp,
    borderColor: "border-gray-200",
    iconColor: "text-gray-400",
    enabled: false,
  },
];

const FLOW_OPTIONS: Array<{
  flow: OnboardingFlow;
  Icon: typeof Users;
  iconColor: string;
  hoverBorderColor: string;
  title: string;
  description: React.ReactNode;
}> = [
  {
    flow: "regular",
    Icon: Users,
    iconColor: "#60a5fa",
    hoverBorderColor: "#60a5fa",
    title: "Regular Member Onboarding",
    description: "Standard profile setup — name, company, and password. No program enrollment required.",
  },
  {
    flow: "cohort",
    Icon: Calendar,
    iconColor: "#a78bfa",
    hoverBorderColor: "#a78bfa",
    title: "Program Cohort Onboarding",
    description: (
      <>
        Extended setup for{" "}
        <strong style={{ color: "#c4b5fd" }}>CxO Advisory Program — Cohort A</strong>
        . Includes profile + calendar connection.
      </>
    ),
  },
];

function FlowSelectStep({
  onSelect,
  onBack,
}: {
  onSelect: (flow: OnboardingFlow) => void;
  onBack: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "600px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontSize: 13,
              color: "#94a3b8",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}
          >
            Step 2 of onboarding
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
            Choose Your Onboarding Path
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 8 }}>
            Select the type of onboarding that applies to you.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {FLOW_OPTIONS.map(({ flow, Icon, iconColor, hoverBorderColor, title, description }) => (
            <button
              key={flow}
              onClick={() => onSelect(flow)}
              style={{
                background: "#1e293b",
                border: "2px solid #334155",
                borderRadius: 12,
                padding: "28px 24px",
                textAlign: "left",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = hoverBorderColor)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#334155")}
            >
              <div style={{ marginBottom: 12 }}>
                <Icon style={{ width: 32, height: 32, color: iconColor }} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>
                {title}
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
                {description}
              </div>
            </button>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              fontSize: 13,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            ← Back to email
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOnboarding() {
  const [activeTab, setActiveTab] = useState<Tab>("simulator");
  const [activeFlow, setActiveFlow] = useState<SimulatorFlow>(null);
  const [simulatorStep, setSimulatorStep] = useState<SimulatorStep>("email");
  const [onboardingFlow, setOnboardingFlow] = useState<OnboardingFlow>("regular");
  const [fieldConfig, setFieldConfig] = useState<OnboardField[] | undefined>(undefined);
  const [loginDone, setLoginDone] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("self");

  const handleCardClick = (id: string, enabled: boolean) => {
    if (!enabled) return;
    if (id === "cxo" || id === "startup") {
      setFieldConfig(loadOnboardingSchema());
      setSimulatorStep("email");
      setLoginDone(false);
      setOnboardingFlow("regular");
      setActiveFlow(id);
    }
  };

  const handleClose = () => {
    setActiveFlow(null);
  };

  const handleFormSubmit = async () => {
    if (onboardingFlow === "cohort") {
      setSimulatorStep("calendar");
    } else {
      handleClose();
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Onboarding Experience
        </h1>

        <div className="mt-4 flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "simulator"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "editor"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Editor
          </button>
        </div>

        <div className="mt-6">
          {activeTab === "simulator" ? (
            <div>
              {/* Send Test Emails (Spec 01 sandbox) */}
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="h-5 w-5 text-amber-600" />
                  <h3 className="text-sm font-semibold text-amber-800">Send Test Onboarding Emails</h3>
                </div>
                <p className="text-xs text-amber-700 mb-3">
                  Fire a real onboarding email — no user is created, no data is persisted.
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-amber-700 font-medium">Send to:</span>
                  <select
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    className="rounded-md border border-amber-300 bg-white px-2 py-1 text-xs text-amber-800"
                  >
                    <option value="self">My inbox</option>
                    <option value="info@globalciocircle.com">info@globalciocircle.com</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["cxo", "startup", "vc"] as const).map((flow) => (
                    <button
                      key={flow}
                      onClick={async () => {
                        try {
                          const result = await walkOnboardingApi({ flow, recipient: testEmailRecipient === "self" ? undefined : testEmailRecipient });
                          toast.success(`[SANDBOX] ${result.email_type} email sent to ${result.sent_to}`);
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Failed to send test email");
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-200 transition-colors"
                    >
                      <Send className="h-3 w-3" />
                      Test {flow.toUpperCase()} onboarding
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6">
                Select a flow to preview:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {previewCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id, card.enabled)}
                    disabled={!card.enabled}
                    className={`relative border rounded-xl p-6 text-left transition-shadow ${
                      card.enabled
                        ? `${card.borderColor} hover:shadow-lg cursor-pointer`
                        : "border-gray-200 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {!card.enabled && (
                      <span className="absolute top-3 right-3 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                        Coming Soon
                      </span>
                    )}
                    <card.icon className={`h-8 w-8 ${card.iconColor} mb-3`} />
                    <h3 className="text-base font-semibold text-slate-900">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {card.description}
                    </p>
                  </button>
                ))}
              </div>

              <p className="mt-6 text-xs text-slate-400">
                Click a card to experience the onboarding flow as that user
                type.
              </p>
            </div>
          ) : (
            <AdminOnboardingEditor />
          )}
        </div>
      </div>

      {activeFlow && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900">
          <button
            onClick={handleClose}
            className="fixed top-4 right-4 z-[10000] flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
            Exit Simulator
          </button>

          {simulatorStep === "email" && (
            <div
              style={{
                minHeight: "100vh",
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
              }}
            >
              <div style={{ width: "100%", maxWidth: "560px" }}>
                <div
                  style={{
                    background: "#e2e8f0",
                    borderRadius: "10px 10px 0 0",
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#fc5c65",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#fed330",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#26de81",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      color: "#64748b",
                      fontFamily: "monospace",
                    }}
                  >
                    Inbox — Global CXO Circle
                  </span>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "0 0 10px 10px",
                    padding: "28px 32px 24px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                  }}
                >
                  <div
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      paddingBottom: "14px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}
                    >
                      <strong>From:</strong> Global CXO Circle &lt;noreply@globalciocircle.com&gt;
                    </div>
                    <div
                      style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}
                    >
                      <strong>To:</strong>{" "}
                      {activeFlow === "cxo"
                        ? CXO_MOCK_USER.email
                        : STARTUP_MOCK_USER.email}
                    </div>
                    <div
                      style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}
                    >
                      You've been invited to the CxO Advisory Program
                    </div>
                  </div>

                  <div
                    style={{
                      maxWidth: 460,
                      margin: "0 auto",
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    }}
                  >
                    <div
                      style={{
                        textAlign: "center",
                        marginBottom: 20,
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#1f2f62",
                      }}
                    >
                      Global CXO Circle
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        color: "#333",
                        lineHeight: 1.7,
                      }}
                    >
                      <p style={{ marginTop: 0 }}>
                        Hi{" "}
                        {activeFlow === "cxo"
                          ? CXO_MOCK_USER.name
                          : STARTUP_MOCK_USER.name}
                        ,
                      </p>
                      <p>
                        You've been invited to join the{" "}
                        <strong>CxO Advisory Program — Cohort 1</strong> as a{" "}
                        {activeFlow === "cxo"
                          ? "CXO advisor"
                          : "startup participant"}
                        .
                      </p>
                      {activeFlow === "cxo" ? (
                        <p>
                          Over the next 6 months, you'll be matched with 2
                          innovative startups, contributing 20 hours of advisory
                          time to each (40 hours total).
                        </p>
                      ) : (
                        <p>
                          You'll receive 40 hours of advisory time from 2
                          world-class CXOs over 6 months.
                        </p>
                      )}
                      <p
                        style={{
                          fontSize: 14,
                          color: "#666",
                          marginTop: 20,
                        }}
                      >
                        Your next step: set up your advisory profile and connect
                        your calendar.
                      </p>
                    </div>

                    <div style={{ textAlign: "center", margin: "24px 0" }}>
                      <span
                        style={{
                          display: "inline-block",
                          background: "#1f2f62",
                          color: "white",
                          padding: "13px 32px",
                          borderRadius: 8,
                          fontWeight: 600,
                          fontSize: 15,
                        }}
                      >
                        Set Up Your Profile →
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: "#999",
                        textAlign: "center",
                        marginTop: 20,
                        paddingTop: 14,
                        borderTop: "1px solid #eee",
                      }}
                    >
                      This link expires in 7 days. If you have questions, reply
                      to this email.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 20,
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={() => setSimulatorStep("flow-select")}
                    style={{
                      background: "#1f2f62",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      padding: "11px 22px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Simulate: New User (Full Form)
                  </button>
                  <button
                    onClick={() => setSimulatorStep("login")}
                    style={{
                      background: "white",
                      color: "#1f2f62",
                      border: "2px solid #1f2f62",
                      borderRadius: 8,
                      padding: "11px 22px",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Simulate: Existing User (Login)
                  </button>
                </div>
              </div>
            </div>
          )}

          {simulatorStep === "flow-select" && (
            <FlowSelectStep
              onSelect={(flow) => { setOnboardingFlow(flow); setSimulatorStep("form"); }}
              onBack={() => setSimulatorStep("email")}
            />
          )}

          {simulatorStep === "form" && (
            activeFlow === "cxo" ? (
              <OnboardCxO
                userInfo={CXO_MOCK_USER}
                onSubmit={handleFormSubmit}
                simulationMode
                fieldConfig={fieldConfig}
              />
            ) : (
              <OnboardStartup
                userInfo={STARTUP_MOCK_USER}
                onSubmit={handleFormSubmit}
                simulationMode
                fieldConfig={fieldConfig}
              />
            )
          )}

          {simulatorStep === "calendar" && (
            <div
              style={{
                minHeight: "100vh",
                background: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
              }}
            >
              <div style={{ width: "100%", maxWidth: "560px" }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    Step 3 of onboarding
                  </div>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
                    Connect Your Calendar
                  </h2>
                  <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 8 }}>
                    Connect your calendar so advisors and startups can schedule sessions with you.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                  {[
                    { name: "Google Calendar", icon: "📅", color: "#4285f4" },
                    { name: "Microsoft Outlook", icon: "📆", color: "#0078d4" },
                    { name: "Apple Calendar", icon: "🗓", color: "#1d1d1f" },
                  ].map((provider) => (
                    <div
                      key={provider.name}
                      style={{
                        background: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: 10,
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 24 }}>{provider.icon}</span>
                        <span style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>{provider.name}</span>
                      </div>
                      <button
                        onClick={() => toast.success(`Simulated: ${provider.name} connected`)}
                        style={{
                          background: provider.color,
                          color: "white",
                          border: "none",
                          borderRadius: 7,
                          padding: "8px 18px",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 10,
                    padding: "16px 20px",
                    marginBottom: 28,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Default Availability
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                      <span
                        key={day}
                        style={{
                          background: "#0f172a",
                          border: "1px solid #475569",
                          borderRadius: 6,
                          padding: "4px 10px",
                          fontSize: 13,
                          color: "#cbd5e1",
                          fontWeight: 500,
                        }}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: "#94a3b8" }}>
                    9:00 AM – 5:00 PM (your local time)
                  </div>
                </div>

                <button
                  onClick={() => setSimulatorStep("complete")}
                  style={{
                    width: "100%",
                    background: "#1f2f62",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "14px",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {simulatorStep === "complete" && (
            <div
              style={{
                minHeight: "100vh",
                background: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
              }}
            >
              <div style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <CheckCircle style={{ width: 64, height: 64, color: "#22c55e" }} />
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>
                  Onboarding Complete!
                </h2>
                <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
                  You're all set. Your calendar is connected and your profile is ready.
                </p>
                <button
                  onClick={handleClose}
                  style={{
                    background: "#1f2f62",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    padding: "13px 32px",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {simulatorStep === "login" && (
            <div
              style={{
                minHeight: "100vh",
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "36px 40px",
                  width: "100%",
                  maxWidth: 400,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                }}
              >
                {loginDone ? (
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 40,
                        marginBottom: 16,
                      }}
                    >
                      ✓
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#1f2f62",
                        marginBottom: 8,
                      }}
                    >
                      Welcome back!
                    </div>
                    <p style={{ color: "#64748b", fontSize: 15 }}>
                      You've been added to{" "}
                      <strong>CxO Advisory Program — Cohort 1</strong>. Check
                      your dashboard to get started.
                    </p>
                    <button
                      onClick={handleClose}
                      style={{
                        marginTop: 24,
                        background: "#1f2f62",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        padding: "11px 28px",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Go to Dashboard
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        textAlign: "center",
                        marginBottom: 24,
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#1f2f62",
                      }}
                    >
                      Global CXO Circle
                    </div>
                    <p
                      style={{
                        textAlign: "center",
                        color: "#64748b",
                        fontSize: 14,
                        marginBottom: 24,
                      }}
                    >
                      Sign in to accept your invitation
                    </p>
                    <div style={{ marginBottom: 16 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#374151",
                          marginBottom: 6,
                        }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue=""
                        placeholder={activeFlow === "cxo" ? CXO_MOCK_USER.email : STARTUP_MOCK_USER.email}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: 8,
                          fontSize: 14,
                          boxSizing: "border-box",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: 24 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#374151",
                          marginBottom: 6,
                        }}
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        defaultValue=""
                        placeholder="••••••••"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: 8,
                          fontSize: 14,
                          boxSizing: "border-box",
                          outline: "none",
                        }}
                      />
                    </div>
                    <button
                      onClick={() => setLoginDone(true)}
                      style={{
                        width: "100%",
                        background: "#1f2f62",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        padding: "12px",
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
