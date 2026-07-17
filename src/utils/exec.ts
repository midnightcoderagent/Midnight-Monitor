import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { CommandOptions, CommandResult } from "../types/collector.js";

const execFileAsync = promisify(execFile);

export async function runCommand<T>(
  command: string,
  args: string[],
  options: CommandOptions<T> = {}
): Promise<CommandResult<T>> {
  try {
    const result = await execFileAsync(command, args, {
      cwd: options.cwd,
      env: options.env,
      timeout: options.timeoutMs ?? 4000,
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024
    });
    const output = typeof result.stdout === "string" ? result.stdout : Buffer.from(result.stdout).toString("utf8");
    const stderr = typeof result.stderr === "string" ? result.stderr : Buffer.from(result.stderr).toString("utf8");
    return {
      stdout: output,
      stderr,
      code: 0,
      value: options.parse ? options.parse(output) : undefined
    };
  } catch (error) {
    const stdout = typeof error === "object" && error !== null && "stdout" in error ? String((error as { stdout?: unknown }).stdout ?? "") : "";
    const stderr = typeof error === "object" && error !== null && "stderr" in error ? String((error as { stderr?: unknown }).stderr ?? "") : "";
    const code = typeof error === "object" && error !== null && "code" in error && typeof (error as { code?: unknown }).code === "number"
      ? (error as { code: number }).code
      : 1;
    return {
      stdout,
      stderr,
      code,
      value: options.parse && stdout.length > 0 ? options.parse(stdout) : undefined
    };
  }
}

