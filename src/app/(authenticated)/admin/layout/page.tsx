import PlotLayoutMap from "@/components/templates/PlotLayoutMap";

export default function LayoutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out">
      <PlotLayoutMap userRole="admin" />
    </div>
  );
}
