import React from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  AlertTriangle,
  Archive,
  Banknote,
  Building2,
  CalendarClock,
  Check,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileText,
  Flag,
  Gauge,
  LayoutDashboard,
  Mailbox,
  Menu,
  MessageSquareText,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import "./styles.css";

declare global {
  interface Window {
    __trifectaRoot?: Root;
  }
}

type Tone = "red" | "amber" | "blue" | "green" | "gray";
type Priority = "High" | "Medium" | "Low" | "Backlog";
type Status = "Blocked" | "In Progress" | "Pending" | "Not Started" | "Complete" | "Waiting";
type Lane = "Needs Attention" | "Ready" | "Waiting" | "Done";

interface StatusSnapshot {
  id: string;
  title: string;
  status: string;
  detail: string;
  action: string;
  tone: Tone;
  iconKey: string;
  updatedAt: string;
}

interface LicensingStep {
  id: string;
  step: string;
  status: Status;
  owner: string;
  source: string;
  detail: string;
  sourceReceiptId?: string | null;
}

interface Card {
  id: string;
  title: string;
  body: string;
  priority: Priority;
  status: Status;
  lane: Lane;
  owner: string;
  due: string;
  area: string;
  sourceIds: string[];
  history: string[];
  createdAt: string;
  updatedAt: string;
}

interface SourceReceipt {
  id: string;
  source: string;
  date: string;
  area: string;
  read: string;
  confidence: string;
  tone: Tone;
  link?: string | null;
  createdAt: string;
}

interface MessageEvent {
  id: string;
  direction: "inbound" | "outbound";
  channel: "web" | "imessage";
  sender: string;
  text: string;
  response?: string | null;
  createdAt: string;
}

interface IMessageConfig {
  enabled: boolean;
  chatGuid: string;
  allowedSenders: string[];
  lastRowId: number;
  sendReplies: boolean;
}

interface AppState {
  metrics: StatusSnapshot[];
  licensingSteps: LicensingStep[];
  cards: Card[];
  receipts: SourceReceipt[];
  messageEvents: MessageEvent[];
  imessage: IMessageConfig;
}

interface CommandResult {
  response: string;
  changed: boolean;
  state: AppState;
}

interface RecentChat {
  guid: string;
  displayName: string;
  lastMessage: string;
  lastRowId: number;
}

const navItems = [
  { label: "Command Center", icon: <LayoutDashboard />, active: true },
  { label: "LLC Setup", icon: <Building2 /> },
  { label: "Licensing", icon: <ShieldCheck /> },
  { label: "Banking", icon: <Banknote /> },
  { label: "Carrier Readiness", icon: <Users /> },
  { label: "Sources", icon: <FileText /> },
  { label: "Settings", icon: <Settings /> },
];

const lanes: Lane[] = ["Needs Attention", "Ready", "Waiting", "Done"];

function App() {
  const [state, setState] = React.useState<AppState | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [selectedArea, setSelectedArea] = React.useState("All Areas");
  const [commandText, setCommandText] = React.useState("");
  const [commandResponse, setCommandResponse] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [chatGuidDraft, setChatGuidDraft] = React.useState("");
  const [allowedDraft, setAllowedDraft] = React.useState("");
  const [enabledDraft, setEnabledDraft] = React.useState(false);
  const [sendRepliesDraft, setSendRepliesDraft] = React.useState(false);
  const [recentChats, setRecentChats] = React.useState<RecentChat[]>([]);

  React.useEffect(() => {
    void loadState();
  }, []);

  React.useEffect(() => {
    if (!state) return;
    setChatGuidDraft(state.imessage.chatGuid);
    setAllowedDraft(state.imessage.allowedSenders.join(", "));
    setEnabledDraft(state.imessage.enabled);
    setSendRepliesDraft(state.imessage.sendReplies);
  }, [state?.imessage.chatGuid, state?.imessage.enabled, state?.imessage.sendReplies, state?.imessage.allowedSenders.join("|")]);

  async function loadState() {
    try {
      const next = await api<AppState>("/api/state");
      setState(next);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function submitCommand(event?: React.FormEvent) {
    event?.preventDefault();
    const text = commandText.trim();
    if (!text) return;
    setBusy(true);
    try {
      const result = await api<CommandResult>("/api/command", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setState(result.state);
      setCommandResponse(result.response);
      setCommandText("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function runJob(kind: "proton-dfs" | "reagan-uhc") {
    setBusy(true);
    try {
      const result = await api<CommandResult>(`/api/jobs/${kind}`, { method: "POST" });
      setState(result.state);
      setCommandResponse(result.response);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function listChats() {
    setBusy(true);
    try {
      const result = await api<{ ok: true; chats: RecentChat[] } | { ok: false; error: string }>("/api/imessage/chats");
      if (!result.ok) throw new Error(result.error);
      setRecentChats(result.chats);
      setCommandResponse("Loaded recent iMessage chats. Pick the Trifecta group GUID, then save config.");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function saveIMessageConfig() {
    setBusy(true);
    try {
      const allowedSenders = allowedDraft
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const imessage = await api<IMessageConfig>("/api/imessage/config", {
        method: "POST",
        body: JSON.stringify({
          enabled: enabledDraft,
          chatGuid: chatGuidDraft,
          allowedSenders,
          sendReplies: sendRepliesDraft,
        }),
      });
      setState((current) => (current ? { ...current, imessage } : current));
      setCommandResponse("iMessage bridge config saved locally.");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function pollMessages() {
    setBusy(true);
    try {
      const result = await api<{ ok: boolean; processed: number; error?: string; state: AppState }>("/api/imessage/poll", {
        method: "POST",
      });
      if (!result.ok) throw new Error(result.error ?? "iMessage poll failed.");
      setState(result.state);
      setCommandResponse(`Polled iMessage. Processed ${result.processed} command(s).`);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (!state) {
    return (
      <div className="loading-screen">
        <Archive />
        <strong>Loading Trifecta Command Center</strong>
        {error && <span>{error}</span>}
      </div>
    );
  }

  const areas = ["All Areas", ...Array.from(new Set(state.cards.map((card) => card.area)))];
  const filteredCards = selectedArea === "All Areas" ? state.cards : state.cards.filter((card) => card.area === selectedArea);
  const groupedCards = lanes.map((lane) => ({
    lane,
    cards: filteredCards.filter((card) => card.lane === lane),
  }));

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Archive size={26} />
          </div>
          <div>
            <strong>Trifecta Command Center</strong>
            <span>Hermes assistant online</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {navItems.map((item) => (
            <button className={`nav-item ${item.active ? "active" : ""}`} key={item.label}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="workspace-card">
          <Building2 size={20} />
          <div>
            <strong>Trifecta Benefits LLC</strong>
            <span>Florida agency setup</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
            <Menu />
          </button>
          <div>
            <h1>Command Center</h1>
            <p>LLC, licensing, banking, and carrier readiness command center.</p>
          </div>
          <form className="topbar-actions" onSubmit={submitCommand}>
            <label className="search-box">
              <Search size={18} />
              <input
                aria-label="Ask Hermes"
                placeholder="Ask Hermes"
                value={commandText}
                onChange={(event) => setCommandText(event.target.value)}
              />
            </label>
            <button className="icon-button ask-submit" type="submit" aria-label="Send Hermes command" title="Send Hermes command" disabled={busy}>
              <Send size={18} />
            </button>
            <button className="secondary-button" type="button" onClick={() => void runJob("proton-dfs")} disabled={busy}>
              <RefreshCw size={18} />
              Add Source
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                setCommandText("create card for ");
              }}
            >
              <Plus size={18} />
              New Card
            </button>
          </form>
        </header>

        {(commandResponse || error) && (
          <section className={`command-result ${error ? "error" : ""}`}>
            <MessageSquareText size={18} />
            <span>{error || commandResponse}</span>
          </section>
        )}

        <section className="metric-grid" aria-label="Status summary">
          {state.metrics.map((metric) => (
            <article className="metric-card" key={metric.id}>
              <div className={`metric-icon ${metric.tone}`}>{iconFor(metric.iconKey)}</div>
              <div className="metric-copy">
                <span>{metric.title}</span>
                <strong className={metric.tone}>{metric.status}</strong>
                <p>{metric.detail}</p>
                <button type="button" onClick={() => setCommandText(metric.title.includes("UHC") ? "check Reagan UHC status" : "show licensing status")}>
                  {metric.action}
                  <ChevronRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <article className="panel licensing-panel">
            <div className="panel-header">
              <div>
                <h2>Licensing Status</h2>
                <p>Current formation path to Florida agency NPN, then archived as operating history.</p>
              </div>
              <span className="timestamp">
                <CalendarClock size={16} />
                {latestUpdatedAt(state.metrics)}
              </span>
            </div>

            <div className="status-table">
              <div className="table-head">
                <span>Step</span>
                <span>Status</span>
                <span>Owner</span>
                <span>Source</span>
              </div>
              {state.licensingSteps.map((item) => (
                <div className="status-row" key={item.id}>
                  <div className="step-cell">
                    <StatusDot status={item.status} />
                    <div>
                      <strong>{item.step}</strong>
                      <p>{item.detail}</p>
                    </div>
                  </div>
                  <StatusPill status={item.status} />
                  <OwnerBadge initials={item.owner} />
                  <button className="source-button" type="button" onClick={() => setCommandText(`sources for ${item.step}`)}>
                    {item.source}
                    <ExternalLink size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button className="text-link" type="button" onClick={() => setCommandText("show licensing status")}>
              View full licensing checklist
              <ChevronRight size={16} />
            </button>
          </article>

          <article className="panel attention-panel">
            <div className="panel-header">
              <div>
                <h2>Command Board</h2>
                <p>Cards move through the board; completed licensing becomes history, not clutter.</p>
              </div>
              <span>{filteredCards.length} items</span>
            </div>

            <div className="filters" aria-label="Task filters">
              {areas.map((area) => (
                <button className={selectedArea === area ? "selected" : ""} key={area} onClick={() => setSelectedArea(area)}>
                  {area}
                </button>
              ))}
            </div>

            <div className="kanban-board">
              {groupedCards.map(({ lane, cards }) => (
                <KanbanLane lane={lane} cards={cards} key={lane} />
              ))}
            </div>
          </article>
        </section>

        <section className="panel receipts-panel">
          <div className="panel-header">
            <div>
              <h2>Source Receipts</h2>
              <p>Hermes uses these receipts when answering founders.</p>
            </div>
            <button className="text-link" type="button" onClick={() => void runJob("reagan-uhc")}>
              Check Reagan
              <RefreshCw size={16} />
            </button>
          </div>
          <div className="receipts-table">
            <div className="receipts-head">
              <span>Source</span>
              <span>Date</span>
              <span>Area</span>
              <span>Current read</span>
              <span>Confidence</span>
            </div>
            {state.receipts.map((receipt) => (
              <div className="receipt-row" key={receipt.id}>
                <strong>{receipt.source}</strong>
                <span>{receipt.date}</span>
                <span>{receipt.area}</span>
                <span>{receipt.read}</span>
                <span className="confidence">
                  <i className={receipt.tone} />
                  {receipt.confidence}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="ops-grid">
          <article className="panel imessage-panel">
            <div className="panel-header">
              <div>
                <h2>iMessage Bridge</h2>
                <p>Mac-local, allowlisted, and replies stay off until you explicitly enable them.</p>
              </div>
              <span>{state.imessage.enabled ? "Enabled" : "Disabled"}</span>
            </div>
            <div className="settings-grid">
              <label>
                <span>Chat GUID</span>
                <input value={chatGuidDraft} onChange={(event) => setChatGuidDraft(event.target.value)} placeholder="iMessage group chat GUID" />
              </label>
              <label>
                <span>Allowed sender handles</span>
                <input value={allowedDraft} onChange={(event) => setAllowedDraft(event.target.value)} placeholder="+15555555555, email@example.com" />
              </label>
              <label className="toggle-row">
                <input type="checkbox" checked={enabledDraft} onChange={(event) => setEnabledDraft(event.target.checked)} />
                <span>Enable local reader</span>
              </label>
              <label className="toggle-row">
                <input type="checkbox" checked={sendRepliesDraft} onChange={(event) => setSendRepliesDraft(event.target.checked)} />
                <span>Send replies to chat</span>
              </label>
            </div>
            <div className="panel-actions">
              <button className="secondary-button" type="button" onClick={() => void listChats()} disabled={busy}>
                <Mailbox size={17} />
                Recent Chats
              </button>
              <button className="secondary-button" type="button" onClick={() => void pollMessages()} disabled={busy}>
                <RefreshCw size={17} />
                Poll Once
              </button>
              <button className="primary-button" type="button" onClick={() => void saveIMessageConfig()} disabled={busy}>
                <Send size={17} />
                Save
              </button>
            </div>
            {recentChats.length > 0 && (
              <div className="chat-list">
                {recentChats.map((chat) => (
                  <button key={chat.guid} type="button" onClick={() => setChatGuidDraft(chat.guid)}>
                    <strong>{chat.displayName}</strong>
                    <span>{chat.guid}</span>
                  </button>
                ))}
              </div>
            )}
          </article>

          <article className="panel message-panel">
            <div className="panel-header">
              <div>
                <h2>Command Audit</h2>
                <p>Web and iMessage commands are recorded locally.</p>
              </div>
              <span>Last row {state.imessage.lastRowId}</span>
            </div>
            <div className="event-list">
              {state.messageEvents.length ? (
                state.messageEvents.slice(0, 8).map((event) => (
                  <div className="event-row" key={event.id}>
                    <span>{event.channel}</span>
                    <strong>{event.text}</strong>
                    <p>{event.response}</p>
                  </div>
                ))
              ) : (
                <div className="empty-lane">No command events yet</div>
              )}
            </div>
          </article>
        </section>

        <section className="mobile-actions" aria-label="Command center quick actions">
          <button onClick={() => setCommandText("what is blocked?")}>
            <MessageSquareText />
            Ask
          </button>
          <button onClick={() => setCommandText("show licensing status")}>
            <ClipboardList />
            Tasks
          </button>
          <button onClick={() => setCommandText("status")}>
            <Gauge />
            Status
          </button>
        </section>
      </main>

      {sidebarOpen && (
        <button className="scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}>
          <X />
        </button>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: Status }) {
  if (status === "Complete") {
    return (
      <span className="status-dot complete">
        <Check size={14} />
      </span>
    );
  }
  if (status === "Blocked") {
    return (
      <span className="status-dot blocked">
        <AlertTriangle size={14} />
      </span>
    );
  }
  return <span className={`status-dot ${status.toLowerCase().replace(" ", "-")}`} />;
}

function StatusPill({ status }: { status: Status }) {
  return <span className={`status-pill ${status.toLowerCase().replace(" ", "-")}`}>{status}</span>;
}

function OwnerBadge({ initials }: { initials: string }) {
  return <span className="owner-badge">{initials}</span>;
}

function CardView({ card }: { card: Card }) {
  return (
    <article className="task-card">
      <div className="task-top">
        <span className={`priority ${card.priority.toLowerCase()}`}>{card.priority}</span>
        <span>{card.area}</span>
      </div>
      <h3>{card.title}</h3>
      <p>{card.body}</p>
      <div className="task-meta">
        <StatusPill status={card.status} />
        <OwnerBadge initials={card.owner} />
      </div>
      <div className="due-line">
        <CalendarClock size={15} />
        {card.due}
      </div>
    </article>
  );
}

function KanbanLane({ lane, cards }: { lane: Lane; cards: Card[] }) {
  return (
    <section className="kanban-lane" aria-label={`${lane} cards`}>
      <div className="lane-header">
        <strong>{lane}</strong>
        <span>{cards.length}</span>
      </div>
      <div className="lane-cards">
        {cards.length ? cards.map((card) => <CardView card={card} key={card.id} />) : <div className="empty-lane">No cards</div>}
      </div>
    </section>
  );
}

function iconFor(iconKey: string) {
  if (iconKey === "users") return <Users />;
  if (iconKey === "bank") return <Banknote />;
  if (iconKey === "flag") return <Flag />;
  return <ShieldCheck />;
}

function latestUpdatedAt(metrics: StatusSnapshot[]) {
  const latest = metrics
    .map((metric) => new Date(metric.updatedAt).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];
  if (!latest) return "Updated";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(latest);
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

const rootElement = document.getElementById("root")!;
window.__trifectaRoot ??= createRoot(rootElement);
window.__trifectaRoot.render(<App />);
