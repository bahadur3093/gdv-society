export const monthName = (m: number) =>
  new Date(2000, m - 1, 1).toLocaleString("en-IN", { month: "long" });
