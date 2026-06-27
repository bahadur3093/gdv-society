import { listAllVillas } from "./list-all-villas";
import { listPendingTool } from "./list-pending";
import { listUnpaidTool } from "./list-unpaid";
import { lookupResidentTool } from "./lookup-resident";
import { lookupVillaTool } from "./lookup-villa";
import { societyStatsTool } from "./society-stats";

export const telegramTools = {
  list_pending_users: listPendingTool,
  list_unpaid_bills: listUnpaidTool,
  society_stats: societyStatsTool,
  lookup_resident: lookupResidentTool,
  lookup_villa: lookupVillaTool,
  list_all_villas: listAllVillas,
};

export type TelegramToolName = keyof typeof telegramTools;