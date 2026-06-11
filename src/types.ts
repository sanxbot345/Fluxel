export enum DeploymentState {
  QUEUED = "QUEUED",
  BUILDING = "BUILDING",
  READY = "READY",
  ERROR = "ERROR",
  CANCELED = "CANCELED",
  INITIALIZING = "INITIALIZING",
  ANALYZING = "ANALYZING",
  DEPLOYING = "DEPLOYING",
}

export interface DeploymentHistoryItem {
  id: string;
  name: string;
  url: string;
  readyState: DeploymentState;
  createdAt: number;
  framework: string | null;
  sourceType: "zip" | "github";
  gitRepoUrl?: string;
  gitBranch?: string;
  target?: string;
}

export interface ProjectAnalytics {
  total: number;
  success: number;
  failed: number;
}

export interface VercelLogEvent {
  id: string;
  text: string;
  timestamp: number;
  type?: "stdout" | "stderr" | "info";
}

export interface NotificationSettings {
  emailEnabled: boolean;
  emailRecipient: string;
  slackEnabled: boolean;
  slackWebhookUrl: string;
}

export interface NotificationLog {
  id: string;
  timestamp: number;
  eventName: "started" | "succeeded" | "failed";
  projectName: string;
  status: string;
  deploymentUrl: string;
  deploymentId: string;
  emailSent: boolean;
  emailConfigured: boolean;
  slackSent: boolean;
  slackConfigured: boolean;
  emailRecipient: string;
  slackWebhookUrl: string;
  emailSubject: string;
  emailBodyHtml: string;
  slackPayload: string;
  error?: string;
}
