import { describe, expect, it } from "vitest";
import { mergeConfig } from "../src/config/load.js";

describe("mergeConfig", () => {
  it("uses defaults for missing fields", () => {
    const config = mergeConfig({});
    expect(config.server.port).toBe(9898);
    expect(config.intervals.cpu).toBe(1000);
  });
});

