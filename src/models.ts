export interface NodeVersionInfo {
  version: string;
  sizeMB: number | null;
  globals: string[];
}

export interface LoadProgress {
  current: number;
  total: number;
  version: string;
  completed: NodeVersionInfo[];
}
