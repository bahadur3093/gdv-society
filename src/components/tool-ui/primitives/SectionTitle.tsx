export default function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h4 className="text-micro uppercase tracking-wider text-text-muted font-medium">
      {children}
    </h4>
  );
}
