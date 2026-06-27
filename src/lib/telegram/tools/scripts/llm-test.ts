import { processUserMessage } from "@/lib/telegram/llm";

async function main() {
  const message = process.argv[2] || "show me all villas";
  console.log("\n[TEST] Sending:", message, "\n");

  const response = await processUserMessage(message);

  console.log("\n[TEST] Response:");
  console.log(response);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
