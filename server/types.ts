export type Tone = "red" | "amber" | "blue" | "green" | "gray";
export type Priority = "High" | "Medium" | "Low" | "Backlog";
export type Status = "Blocked" | "In Progress" | "Pending" | "Not Started" | "Complete" | "Waiting";
export type Lane = "Needs Attention" | "Ready" | "Waiting" | "Done";

export interface StatusSnapshot {
  id: string;
  title: string;
  status: string;
  detail: string;
  action: string;
  tone: Tone;
  iconKey: string;
  updatedAt: string;
}

export interface LicensingStep {
  id: string;
  step: string;
  status: Status;
  owner: string;
  source: string;
  detail: string;
  sourceReceiptId?: string | null;
}

export interface Card {
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

export interface SourceReceipt {
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

export interface MessageEvent {
  id: string;
  direction: "inbound" | "outbound";
  channel: "web" | "imessage";
  sender: string;
  text: string;
  response?: string | null;
  createdAt: string;
}

export interface IMessageConfig {
  enabled: boolean;
  chatGuid: string;
  allowedSenders: string[];
  lastRowId: number;
  sendReplies: boolean;
}

export interface AppState {
  metrics: StatusSnapshot[];
  licensingSteps: LicensingStep[];
  cards: Card[];
  receipts: SourceReceipt[];
  messageEvents: MessageEvent[];
  imessage: IMessageConfig;
}

export interface CommandResult {
  response: string;
  changed: boolean;
  state: AppState;
}
