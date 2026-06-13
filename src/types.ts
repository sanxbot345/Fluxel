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


