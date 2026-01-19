export interface NodeVersionInfo {
  version: string;
  sizeBytes: number | null;
  globals: string[];
}

export interface LoadProgress {
  current: number;
  total: number;
  version: string;
  completed: NodeVersionInfo[];
}
