import { highestOutstandingVillasTool } from "./highest-outstanding-villas";
import { listPendingTool } from "./list-pending";
import { listUnpaidTool } from "./list-unpaid";
import { lookupResidentTool } from "./lookup-resident";
import { lookupVillaTool } from "./lookup-villa";
import { monthlyExpensesSummaryTool } from "./monthly-expenses-summary";
import { societyStatsTool } from "./society-stats";

export const telegramTools = {
  list_pending_users: listPendingTool,
  list_unpaid_bills: listUnpaidTool,
  society_stats: societyStatsTool,
  lookup_resident: lookupResidentTool,
  lookup_villa: lookupVillaTool,
  monthly_expenses_summary: monthlyExpensesSummaryTool,
  highest_outstanding_villas: highestOutstandingVillasTool,
};

export type TelegramToolName = keyof typeof telegramTools;