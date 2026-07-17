import os from "node:os";
import type { PlatformInfo } from "../types/collector.js";

export function getPlatformInfo(): PlatformInfo {
  return {
    isWindows: process.platform === "win32",
    isLinux: process.platform === "linux",
    isMac: process.platform === "darwin",
    hostname: os.hostname()
  };
}

