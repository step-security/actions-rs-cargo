/**
 * Parse action input into a some proper thing.
 */

import * as core from "@actions/core";

import stringArgv from "string-argv";

// Parsed action input
export interface Input {
  command: string;
  toolchain?: string;
  args: string[];
  useCross: boolean;
}

const MAX_COMMAND_LEN = 64;
const MAX_TOOLCHAIN_LEN = 128;
const MAX_ARGS_LEN = 8192;
const VALID_TOOLCHAIN = /^[a-zA-Z0-9._+-]+$/;
const VALID_COMMAND = /^[a-zA-Z0-9._-]+$/;

function bounded(name: string, value: string, max: number): string {
  if (value.length > max) {
    throw new Error(
      `'${name}' input is too long (${value.length} chars; max ${max})`
    );
  }
  return value;
}

export function get(): Input {
  const command = bounded(
    "command",
    core.getInput("command", { required: true }),
    MAX_COMMAND_LEN
  );
  if (!VALID_COMMAND.test(command)) {
    throw new Error(
      `'command' input contains invalid characters: "${command}". Allowed: A-Z a-z 0-9 _ . -`
    );
  }

  const rawArgs = bounded("args", core.getInput("args"), MAX_ARGS_LEN);
  const args = stringArgv(rawArgs);

  let toolchain = bounded(
    "toolchain",
    core.getInput("toolchain"),
    MAX_TOOLCHAIN_LEN
  );
  if (toolchain.startsWith("+")) {
    toolchain = toolchain.slice(1);
  }
  if (toolchain && !VALID_TOOLCHAIN.test(toolchain)) {
    throw new Error(
      `'toolchain' input contains invalid characters: "${toolchain}". Allowed: A-Z a-z 0-9 _ . + -`
    );
  }

  const useCross = core.getInput("use-cross") === "true";

  return {
    command: command,
    args: args,
    useCross: useCross,
    toolchain: toolchain || undefined,
  };
}
