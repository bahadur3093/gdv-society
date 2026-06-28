import OutstandingBillsView from "./tools/OutstandingBillsView";

type ToolOutputMap = {
  getOutstandingBills: {
    count: number;
    bills: {
      month: number;
      year: number;
      amount: number;
      status: "PENDING" | "PARTIAL" | "PAID";
    }[];
  };
};

export function renderToolUI(toolName: string, output: any) {
  switch (toolName) {
    case "getOutstandingBills":
      return (
        <OutstandingBillsView
          {...(output as ToolOutputMap["getOutstandingBills"])}
        />
      );
    default:
      return null;
  }
}
