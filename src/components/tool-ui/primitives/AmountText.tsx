export default function AmountText({ value }: { value: number }) {
  return <span>₹{value.toLocaleString("en-IN")}</span>;
}
