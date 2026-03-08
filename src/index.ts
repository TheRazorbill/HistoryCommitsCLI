import { input, select } from "@inquirer/prompts";
import { exec, execSync } from "node:child_process";

async function main() {
  const options = await select({
    message: "Choose",
    choices: [
      {
        name: "1 - Date and Hour",
        value: 1,
        description: "Date and Hour",
      },
      {
        name: "2 - Only Date",
        value: 2,
        description: "Only Date",
      },
      {
        name: "3 - Only Hour",
        value: 3,
        description: "Only Hour",
      },
    ],
  });
  console.log(options);

  let answer = "";

  if (options == 1) {
    answer = await input({ message: "Date and Hour" });
    console.log(answer);
  } else if (options == 2) {
    answer = await input({ message: "Date" });
    console.log(answer);
  } else {
    answer = await input({ message: "Hour" });
    console.log(answer);
  }

  let message = await input({message: "Commit message"})

  try {
    execSync(
      `GIT_AUTHOR_DATE="${answer}" GIT_COMMITTER_DATE="${answer}" git commit -m "${message}"`,
    ).toString();
  } catch (error) {
    console.error((error as Error).message);
  }
}

main();