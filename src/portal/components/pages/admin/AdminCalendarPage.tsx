import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { X, Rocket, TrendingUp, UserCheck, CalendarClock, ChevronLeft, ChevronRight, Clock, Users, ExternalLink, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/portal/components/ui/card";
import { Button } from "@/portal/components/ui/button";
import { Badge } from "@/portal/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/portal/components/ui/dialog";
import { listAdminSessionsApi, type SessionListItem } from "@/portal/api/adminSessions";
import { openAdminCalendar } from "@/portal/lib/calcomBridge";
import CalendarOnboarding from "./CalendarOnboarding";
import AdminCalendarEditor from "./AdminCalendarEditor";
import AdminCalendarSettings from "./AdminCalendarSettings";
import AdminSessionEditor from "./AdminSessionEditor";
import AdminSessionSimulator from "./AdminSessionSimulator";
import { loadCalendarOnboardingConfig } from "./calendarOnboardingTypes";
import type { CalendarOnboardingConfig } from "./calendarOnboardingTypes";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function statusColor(s: string) {
  if (s === "completed" || s === "confirmed") return "bg-green-500";
  if (s === "cancelled") return "bg-red-400";
  if (s === "pending" || s === "requested") return "bg-amber-400";
  return "bg-blue-500";
}

function statusBadge(s: string) {
  if (s === "completed" || s === "confirmed") return "bg-green-100 text-green-700";
  if (s === "cancelled") return "bg-red-100 text-red-700";
  if (s === "pending" || s === "requested") return "bg-amber-100 text-amber-700";
  return "bg-blue-100 text-blue-700";
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDateFull(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Full Calendar Component
// ---------------------------------------------------------------------------

type CalView = "month" | "week" | "day";

function FullCalendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalView>("month");
  const [selectedSession, setSelectedSession] = useState<SessionListItem | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date().toISOString().slice(0, 10);

  // Fetch ALL sessions (large page size to get everything)
  const { data: sessionsData } = useQuery({
    queryKey: ["admin", "calendar-sessions"],
    queryFn: () => listAdminSessionsApi({ page_size: 500 }),
    staleTime: 60_000,
  });
  const sessions = sessionsData?.items ?? [];

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, SessionListItem[]>();
    for (const s of sessions) {
      const dateKey = (s.starts_at ?? s.created_at ?? "").slice(0, 10);
      if (!dateKey) continue;
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(s);
    }
    return map;
  }, [sessions]);

  // Navigation
  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToPrevWeek = () => setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
  const goToNextWeek = () => setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
  const goToPrevDay = () => setCurrentDate(new Date(currentDate.getTime() - 86400000));
  const goToNextDay = () => setCurrentDate(new Date(currentDate.getTime() + 86400000));

  const drillDown = useCallback((dateStr: string) => {
    setCurrentDate(new Date(dateStr + "T12:00:00"));
    if (view === "month") setView("week");
    else if (view === "week") setView("day");
  }, [view]);

  const goUp = useCallback(() => {
    if (view === "day") setView("week");
    else if (view === "week") setView("month");
  }, [view]);

  // ---------- Month View ----------
  const monthDays = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const days: Array<{ date: string; day: number; isCurrentMonth: boolean }> = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const pm = month === 0 ? 11 : month - 1;
      const py = month === 0 ? year - 1 : year;
      days.push({ date: `${py}-${String(pm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, day: d, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, day: d, isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nm = month === 11 ? 0 : month + 1;
      const ny = month === 11 ? year + 1 : year;
      days.push({ date: `${ny}-${String(nm + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, day: d, isCurrentMonth: false });
    }
    return days;
  }, [year, month]);

  // ---------- Week View ----------
  const weekDays = useMemo(() => {
    const dayOfWeek = currentDate.getDay();
    const sunday = new Date(currentDate);
    sunday.setDate(sunday.getDate() - dayOfWeek);
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }, [currentDate]);

  // ---------- Day View ----------
  const dayStr = currentDate.toISOString().slice(0, 10);
  const daySessions = sessionsByDate.get(dayStr) ?? [];

  // ---------- Stats ----------
  const totalThisMonth = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    let count = 0;
    sessionsByDate.forEach((list, key) => { if (key.startsWith(prefix)) count += list.length; });
    return count;
  }, [sessionsByDate, year, month]);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {view !== "month" && (
            <Button variant="ghost" size="sm" onClick={goUp} className="text-xs text-slate-500">
              <ChevronLeft className="h-3 w-3 mr-1" />
              {view === "week" ? "Month" : "Week"}
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={view === "month" ? goToPrevMonth : view === "week" ? goToPrevWeek : goToPrevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold w-48 text-center text-slate-800">
              {view === "month" && `${MONTHS[month]} ${year}`}
              {view === "week" && `Week of ${new Date(weekDays[0]).toLocaleDateString([], { month: "short", day: "numeric" })} – ${new Date(weekDays[6]).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`}
              {view === "day" && formatDateFull(dayStr)}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={view === "month" ? goToNextMonth : view === "week" ? goToNextWeek : goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs">{totalThisMonth} sessions this month</Badge>
          <div className="flex rounded-md border border-slate-200 overflow-hidden">
            {(["month", "week", "day"] as CalView[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1 text-xs font-medium capitalize transition-colors ${view === v ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                {v}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => { setCurrentDate(new Date()); setView("month"); }}>
            Today
          </Button>
        </div>
      </div>

      {/* Month View */}
      {view === "month" && (
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-lg overflow-hidden">
              {monthDays.map((day, i) => {
                const dayEvents = sessionsByDate.get(day.date) ?? [];
                const isToday = day.date === today;
                return (
                  <button key={i} onClick={() => drillDown(day.date)}
                    className={`relative bg-white p-1.5 min-h-[72px] text-left transition-colors hover:bg-blue-50 ${!day.isCurrentMonth ? "opacity-40" : ""}`}
                  >
                    <span className={`text-xs font-medium ${isToday ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center" : "text-slate-700"}`}>
                      {day.day}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 3).map((s) => (
                          <div key={s.id} className={`h-1.5 w-full rounded-full ${statusColor(s.session_status || s.status)}`} title={`${s.organizer_name ?? "?"} - ${s.participant_name ?? "?"}`} />
                        ))}
                        {dayEvents.length > 3 && (
                          <p className="text-[9px] text-slate-400 text-center">+{dayEvents.length - 3} more</p>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />Scheduled</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500 inline-block" />Completed</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />Pending</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400 inline-block" />Cancelled</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {view === "week" && (
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((dateStr) => {
                const wdSessions = sessionsByDate.get(dateStr) ?? [];
                const isToday = dateStr === today;
                const dayObj = new Date(dateStr + "T12:00:00");
                return (
                  <button key={dateStr} onClick={() => drillDown(dateStr)} className="text-left">
                    <div className={`rounded-lg border p-3 min-h-[160px] transition-colors hover:border-blue-300 hover:bg-blue-50/50 ${isToday ? "border-blue-400 bg-blue-50" : "border-slate-200"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-500">{DAYS[dayObj.getDay()]}</span>
                        <span className={`text-sm font-bold ${isToday ? "text-blue-600" : "text-slate-800"}`}>{dayObj.getDate()}</span>
                      </div>
                      <div className="space-y-1.5">
                        {wdSessions.slice(0, 4).map((s) => (
                          <div key={s.id} className="flex items-center gap-1.5 cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedSession(s); }}>
                            <span className={`h-2 w-2 rounded-full shrink-0 ${statusColor(s.session_status || s.status)}`} />
                            <span className="text-[10px] text-slate-700 truncate">{s.organizer_name?.split(" ")[0] ?? "?"} - {s.participant_name?.split(" ")[0] ?? "?"}</span>
                          </div>
                        ))}
                        {wdSessions.length > 4 && <p className="text-[9px] text-slate-400">+{wdSessions.length - 4} more</p>}
                        {wdSessions.length === 0 && <p className="text-[9px] text-slate-300 italic">No sessions</p>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day View */}
      {view === "day" && (
        <Card>
          <CardContent className="pt-4">
            {daySessions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Clock className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium">No sessions on this day</p>
              </div>
            ) : (
              <div className="space-y-2">
                {daySessions.map((s) => (
                  <button key={s.id} onClick={() => setSelectedSession(s)} className="w-full text-left rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-sm font-medium text-slate-800">{s.organizer_name ?? "Organizer"} - {s.participant_name ?? "Participant"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {s.starts_at && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(s.starts_at)}{s.ends_at ? ` - ${formatTime(s.ends_at)}` : ""}</span>}
                          {s.meeting_type && <span>{s.meeting_type}</span>}
                          {s.program_name && <Badge variant="outline" className="text-[9px] px-1">{s.program_name}</Badge>}
                        </div>
                      </div>
                      <Badge className={`text-[10px] shrink-0 ${statusBadge(s.session_status || s.status)}`}>
                        {s.session_status || s.status}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Session Detail Modal */}
      <Dialog open={!!selectedSession} onOpenChange={(open) => { if (!open) setSelectedSession(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={`${statusBadge(selectedSession.session_status || selectedSession.status)}`}>
                  {selectedSession.session_status || selectedSession.status}
                </Badge>
                {selectedSession.starts_at && (
                  <span className="text-xs text-slate-500">{formatDateFull(selectedSession.starts_at)}</span>
                )}
              </div>

              <div className="space-y-3 rounded-lg bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{selectedSession.organizer_name ?? "Organizer"}</p>
                    <p className="text-xs text-slate-400">Organizer</p>
                  </div>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{selectedSession.participant_name ?? "Participant"}</p>
                    <p className="text-xs text-slate-400">Participant</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {selectedSession.starts_at && (
                  <div>
                    <p className="text-xs text-slate-400">Time</p>
                    <p className="font-medium">{formatTime(selectedSession.starts_at)}{selectedSession.ends_at ? ` - ${formatTime(selectedSession.ends_at)}` : ""}</p>
                  </div>
                )}
                {selectedSession.meeting_type && (
                  <div>
                    <p className="text-xs text-slate-400">Type</p>
                    <p className="font-medium capitalize">{selectedSession.meeting_type}</p>
                  </div>
                )}
                {selectedSession.program_name && (
                  <div>
                    <p className="text-xs text-slate-400">Program</p>
                    <p className="font-medium">{selectedSession.program_name}</p>
                  </div>
                )}
                {selectedSession.created_at && (
                  <div>
                    <p className="text-xs text-slate-400">Created</p>
                    <p className="font-medium">{new Date(selectedSession.created_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <Button className="w-full" variant="outline" onClick={() => { setSelectedSession(null); navigate("/admin/meetings"); }}>
                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                View in Sessions
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simulator Tab (existing, preserved)
// ---------------------------------------------------------------------------

type SimulatorTier = "cxo" | "startup" | null;
type SimulatorStep = "email" | "wizard";

const previewCards = [
  { id: "cxo" as const, title: "CxO Preview", description: "Preview the calendar onboarding as a Chief Information Officer.", icon: UserCheck, borderColor: "border-amber-200 hover:border-amber-400", iconColor: "text-amber-600", enabled: true },
  { id: "startup" as const, title: "Startup Preview", description: "Preview the calendar onboarding as a startup founder.", icon: Rocket, borderColor: "border-cyan-200 hover:border-cyan-400", iconColor: "text-cyan-600", enabled: true },
  { id: "vc" as const, title: "VC Preview", description: "Preview as a venture capital partner. Coming soon.", icon: TrendingUp, borderColor: "border-gray-200", iconColor: "text-gray-400", enabled: false },
];

function SimulatorTab() {
  const [activeTier, setActiveTier] = useState<SimulatorTier>(null);
  const [simulatorStep, setSimulatorStep] = useState<SimulatorStep>("email");
  const [simulatorConfig, setSimulatorConfig] = useState<CalendarOnboardingConfig | undefined>(undefined);
  const [sessionSimOpen, setSessionSimOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<"simulator" | "editor" | "forms" | "settings">("simulator");

  const subTabs: { id: typeof editorTab; label: string }[] = [
    { id: "simulator", label: "Simulator" },
    { id: "editor", label: "Editor" },
    { id: "forms", label: "Forms" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <>
      <div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit mb-6">
          {subTabs.map((tab) => (
            <button key={tab.id} onClick={() => setEditorTab(tab.id)} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${editorTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {editorTab === "simulator" && (
          <div>
            <p className="text-sm text-slate-600 mb-6">Select a tier to preview the calendar onboarding flow:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {previewCards.map((card) => (
                <button key={card.id} onClick={() => { if (card.enabled && (card.id === "cxo" || card.id === "startup")) { setSimulatorStep("email"); setSimulatorConfig(loadCalendarOnboardingConfig()); setActiveTier(card.id); } }} disabled={!card.enabled}
                  className={`relative border rounded-xl p-6 text-left transition-shadow ${card.enabled ? `${card.borderColor} hover:shadow-lg cursor-pointer` : "border-gray-200 opacity-60 cursor-not-allowed"}`}>
                  {!card.enabled && <span className="absolute top-3 right-3 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Coming Soon</span>}
                  <card.icon className={`h-8 w-8 ${card.iconColor} mb-3`} />
                  <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{card.description}</p>
                </button>
              ))}
            </div>
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Session Flow</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <button onClick={() => setSessionSimOpen(true)} className="w-full sm:w-auto border border-violet-200 hover:border-violet-400 hover:shadow-lg rounded-xl p-6 text-left transition-all cursor-pointer bg-white">
                <CalendarClock className="h-8 w-8 text-violet-600 mb-3" />
                <h3 className="text-base font-semibold text-slate-900">Session Invite Simulator</h3>
                <p className="mt-1 text-sm text-slate-500">Experience the full session lifecycle: invite creation, acceptance, and feedback.</p>
                <span className="mt-3 inline-block text-xs font-medium text-violet-600">Launch Session Simulator &rarr;</span>
              </button>
            </div>
          </div>
        )}
        {editorTab === "editor" && <AdminCalendarEditor />}
        {editorTab === "forms" && <AdminSessionEditor />}
        {editorTab === "settings" && <AdminCalendarSettings />}
      </div>

      {activeTier && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900 overflow-y-auto">
          <div className="fixed top-4 left-4 right-4 z-[10000] flex items-center justify-between pointer-events-none">
            <button
              onClick={() => setActiveTier(null)}
              className="pointer-events-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-xl hover:bg-white hover:text-blue-600 transition-all hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 text-blue-600" />
              <span>Back to Admin Console</span>
            </button>
            <button
              onClick={() => setActiveTier(null)}
              className="pointer-events-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all hover:scale-105"
            >
              <X className="h-4 w-4" />
              <span>Exit Simulator</span>
            </button>
          </div>
          {simulatorStep === "email" && (
            <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
              <div style={{ width: "100%", maxWidth: "560px" }}>
                <div style={{ background: "#e2e8f0", borderRadius: "10px 10px 0 0", padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#fc5c65", display: "inline-block" }} />
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#fed330", display: "inline-block" }} />
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#26de81", display: "inline-block" }} />
                  <span style={{ marginLeft: 8, fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>Inbox — Global CXO Circle</span>
                </div>
                <div style={{ background: "#ffffff", borderRadius: "0 0 10px 10px", padding: "28px 32px 24px", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
                  <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "14px", marginBottom: "20px" }}>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}><strong>From:</strong> Global CXO Circle &lt;noreply@globalciocircle.com&gt;</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}><strong>To:</strong> {activeTier === "cxo" ? "jane@enterprise.com" : "alex@startup.io"}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Set Up Your Calendar for GCXO Advisory</div>
                  </div>
                  <div style={{ maxWidth: 460, margin: "0 auto", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
                    <div style={{ textAlign: "center", marginBottom: 20, fontSize: 20, fontWeight: 700, color: "#1f2f62" }}>Global CXO Circle</div>
                    <div style={{ fontSize: 15, color: "#333", lineHeight: 1.7 }}>
                      <p style={{ marginTop: 0 }}>Hi {activeTier === "cxo" ? "Jane" : "Alex"},</p>
                      <p>Your profile is set up! Connect your calendar so we can schedule advisory sessions for <strong>CxO Advisory Program — Cohort 1</strong>.</p>
                      <p>This takes less than 2 minutes.</p>
                    </div>
                    <div style={{ textAlign: "center", margin: "24px 0" }}>
                      <button onClick={() => setSimulatorStep("wizard")} style={{ background: "#1f2f62", color: "white", border: "none", padding: "13px 32px", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Connect Your Calendar &rarr;</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {simulatorStep === "wizard" && <CalendarOnboarding simulationMode onSimulationExit={() => setActiveTier(null)} config={simulatorConfig} tier={activeTier} />}
        </div>,
        document.body,
      )}

      {sessionSimOpen && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="fixed top-4 left-4 right-4 z-[10000] flex items-center justify-between pointer-events-none">
            <button
              onClick={() => setSessionSimOpen(false)}
              className="pointer-events-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-xl hover:bg-white hover:text-blue-600 transition-all hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 text-blue-600" />
              <span>Back to Admin Console</span>
            </button>
            <button
              onClick={() => setSessionSimOpen(false)}
              className="pointer-events-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all hover:scale-105"
            >
              <X className="h-4 w-4" />
              <span>Exit Simulator</span>
            </button>
          </div>
          <AdminSessionSimulator />
        </div>,
        document.body,
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

type TopTab = "calendar" | "tools";

export default function AdminCalendarPage() {
  const [topTab, setTopTab] = useState<TopTab>("calendar");

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Calendar</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => void openAdminCalendar()}
            className="w-full justify-center sm:w-auto"
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Cal.com Admin
          </Button>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-full sm:w-auto">
          <button onClick={() => setTopTab("calendar")} className={`flex-1 sm:flex-none rounded-md px-4 py-2 text-sm font-medium transition-colors ${topTab === "calendar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            Calendar
          </button>
          <button onClick={() => setTopTab("tools")} className={`flex-1 sm:flex-none rounded-md px-4 py-2 text-sm font-medium transition-colors ${topTab === "tools" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            Tools & Simulator
          </button>
        </div>
        </div>
      </div>

      {topTab === "calendar" && <FullCalendar />}
      {topTab === "tools" && <SimulatorTab />}
    </div>
  );
}
