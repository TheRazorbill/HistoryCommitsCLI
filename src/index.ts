import { input, select } from "@inquirer/prompts";

async function main() {
  const answer = await input({ message: "hello" });
  console.log(answer);
  const options = await select({
    message: "Choose",
    choices: [
        {
            name: "1",
            value: 1,
            description: "hello"
        },
        {
            name: "2",
            value: 2,
            description: "hello"
        },
        {
            name: "3",
            value: 3,
            description: "hello"
        },
    ]
  })
  console.log(options)
}

main()