import { Box, Text } from "ink";
import { useState, useEffect } from "react";

import type { NodeVersionInfo, LoadProgress } from "../models.js";
import {
  getNvmDir,
  getActiveNodeVersion,
  getNodeVersionsDir,
  loadNodeVersions,
} from "../data/nvm.js";
import { ErrorMessage } from "./components/ErrorMessage.js";
import { LoadingProgress } from "./components/LoadingProgress.js";
import { VersionTable } from "./components/version-table/VersionTable.js";

type AppState =
  | { status: "loading"; progress: LoadProgress | null }
  | { status: "error"; message: string }
  | { status: "success"; versions: NodeVersionInfo[] }
  | { status: "empty"; versionsDir: string };

export function App() {
  const [state, setState] = useState<AppState>({
    status: "loading",
    progress: null,
  });
  const activeVersion = getActiveNodeVersion();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const nvmDir = getNvmDir();
        const versionsDir = getNodeVersionsDir(nvmDir);

        const versions = await loadNodeVersions(versionsDir, (progress) => {
          if (!cancelled) {
            setState({ status: "loading", progress });
          }
        });

        if (cancelled) return;

        if (versions.length === 0) {
          setState({ status: "empty", versionsDir });
        } else {
          setState({ status: "success", versions });
        }
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : String(error);
        setState({ status: "error", message });
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  switch (state.status) {
    case "loading":
      return <LoadingProgress progress={state.progress} />;
    case "error":
      return <ErrorMessage message={state.message} />;
    case "empty":
      return (
        <Box flexDirection="column">
          <Text>No Node.js versions found under:</Text>
          <Text> {state.versionsDir}</Text>
        </Box>
      );
    case "success":
      return (
        <VersionTable versions={state.versions} activeVersion={activeVersion} />
      );
  }
}
