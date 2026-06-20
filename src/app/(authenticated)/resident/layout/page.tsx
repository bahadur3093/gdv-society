import PlotLayoutMap from "@/components/templates/PlotLayoutMap";

export default function ResidentLayoutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out">
      <PlotLayoutMap userRole="resident" />
    </div>
  );
}
