#!/usr/bin/env node

import { input, select } from "@inquirer/prompts";
import { execSync } from "node:child_process";
import { parseArgs } from "node:util";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function getCurrentDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function getCurrentTime(): string {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function detectDateFormat(dateStr: string): number {
  const trimmed = dateStr.trim();

  // Full date and time: YYYY-MM-DD HH:MM:SS or YYYY-MM-DDTHH:MM:SS
  if (/^\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}/.test(trimmed)) {
    return 1;
  }

  // Date only: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return 2;
  }

  // Time only: HH:MM or HH:MM:SS
  if (/^\d{2}:\d{2}/.test(trimmed)) {
    return 3;
  }

  throw new Error("Invalid date format. Use YYYY-MM-DD HH:MM:SS, YYYY-MM-DD, or HH:MM:SS");
}

function normalizeGitDate(option: number, rawValue: string): string {
  const value = rawValue.trim();
  const now = new Date();

  if (option === 1) {
    const fullDateTimeMatch = value
      .replace("T", " ")
      .match(/^(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2})(?::(\d{2}))?$/);

    if (!fullDateTimeMatch) {
      throw new Error("Use format: YYYY-MM-DD HH:MM:SS");
    }

    const [, datePart, hourMinutePart, secondsPart] = fullDateTimeMatch;
    const fullDateTime = `${datePart} ${hourMinutePart}:${secondsPart ?? "00"}`;
    const parsedDate = new Date(fullDateTime);

    if (parsedDate > now) {
      throw new Error("Cannot use a future date");
    }

    return fullDateTime;
  }

  if (option === 2) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error("For 'Only Date', use: YYYY-MM-DD");
    }

    const fullDateTime = `${value} ${getCurrentTime()}`;
    const parsedDate = new Date(fullDateTime);

    if (parsedDate > now) {
      throw new Error("Cannot use a future date");
    }

    return fullDateTime;
  }

  const hourOnlyMatch = value.match(/^(\d{2}:\d{2})(?::(\d{2}))?$/);
  if (!hourOnlyMatch) {
    throw new Error("For 'Only Hour', use: HH:MM or HH:MM:SS");
  }

  const [, hourMinutePart, secondsPart] = hourOnlyMatch;
  const fullDateTime = `${getCurrentDate()} ${hourMinutePart}:${secondsPart ?? "00"}`;
  const parsedDate = new Date(fullDateTime);

  if (parsedDate > now) {
    throw new Error("Cannot use a future time");
  }

  return fullDateTime;
}

async function main() {
  const { values } = parseArgs({
    options: {
      date: { type: "string", short: "d" },
      action: { type: "string", short: "a" },
      message: { type: "string", short: "m" },
      amend: { type: "boolean" },
    },
    strict: false,
    allowPositionals: true,
  });

  let options: number;
  let rawDateInput: string;
  let action: string;
  let message: string;

  // CLI arguments mode
  if (values.date && typeof values.date === "string") {
    options = detectDateFormat(values.date);
    rawDateInput = values.date;
    action = values.amend ? "amend" : ((typeof values.action === "string" ? values.action : null) || "allow-empty");
    message = (typeof values.message === "string" ? values.message : "") || "";
  } else {
    // Interactive mode
    options = await select({
      message: "Select input type",
      choices: [
        {
          name: "Date and Time",
          value: 1,
          description: "Full date and time",
        },
        {
          name: "Date only",
          value: 2,
          description: "Date only (current time will be used)",
        },
        {
          name: "Time only",
          value: 3,
          description: "Time only (current date will be used)",
        },
      ],
    });

    if (options == 1) {
      rawDateInput = await input({ message: "Enter date and time (YYYY-MM-DD HH:MM:SS)" });
    } else if (options == 2) {
      rawDateInput = await input({ message: "Enter date (YYYY-MM-DD)" });
    } else {
      rawDateInput = await input({ message: "Enter time (HH:MM or HH:MM:SS)" });
    }

    action = await select({
      message: "Select action",
      choices: [
        { name: "Create empty commit", value: "allow-empty" },
        { name: "Amend last commit", value: "amend" },
      ],
    });

    message = await input({ message: "Commit message (leave empty to keep current message on amend)" });
  }

  try {
    const gitDate = normalizeGitDate(options, rawDateInput);
    const trimmedMessage = message.trim();
    let gitCommand = "";

    if (action === "amend") {
      gitCommand = trimmedMessage
        ? `git commit --amend --allow-empty --reset-author -m ${JSON.stringify(trimmedMessage)}`
        : "git commit --amend --allow-empty --reset-author --no-edit";
    } else {
      if (!trimmedMessage) {
        throw new Error("For new commits, a message is required.");
      }
      gitCommand = `git commit --allow-empty -m ${JSON.stringify(trimmedMessage)}`;
    }

    execSync(gitCommand, {
      stdio: "inherit",
      env: {
        ...process.env,
        GIT_AUTHOR_DATE: gitDate,
        GIT_COMMITTER_DATE: gitDate,
      },
    });
  } catch (error) {
    console.error((error as Error).message);
  }
}

main();