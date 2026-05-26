"use client";

import React, { useState } from "react";
import type { PlotData } from "@/types";
import PlotMapLeftSplit from "@/components/organisms/PlotMapLeftSplit";
import PlotMapRightSplit from "@/components/organisms/PlotMapRightSplit";

interface PlotLayoutMapProps {
  userRole: "admin" | "resident";
  onEditPlot?: (villaNumber: string) => void;
}

interface HoverInfo {
  plot: PlotData;
  x: number;
  y: number;
}

export default function PlotLayoutMap({
  userRole,
  onEditPlot,
}: PlotLayoutMapProps) {
  const [hoveredPlot, setHoveredPlot] = useState<HoverInfo | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(null);
  const [showOccupiedOnly, setShowOccupiedOnly] = useState<boolean>(false);



  return (
    <div className="min-h-screen bg-slate-950 p-6 select-none font-sans">
      {/* Upper Control Bar Layout Elements */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Layout Map & Dimensions
          </h1>
          <p className="text-sm text-slate-400">
            Interactive plot layout with detailed specifications.
          </p>
        </div>
        
        {/* Toggle for Occupied/Unoccupied Villas */}
        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <span className="text-sm text-slate-300 font-medium">Filter:</span>
          <button
            onClick={() => setShowOccupiedOnly(false)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              !showOccupiedOnly
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            All Villas
          </button>
          <button
            onClick={() => setShowOccupiedOnly(true)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              showOccupiedOnly
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Occupied Only
          </button>
        </div>
      </div>

      {/* Split Screen Layout: Map on Left (30%), Dimensions on Right (70%) */}
      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* Left Split: SVG Plot Map Component */}
        <PlotMapLeftSplit
          onPlotHover={setHoveredPlot}
          onPlotSelect={setSelectedPlot}
          selectedPlot={selectedPlot}
          hoveredPlot={hoveredPlot}
        />

        {/* Right Split: Dimensions Panel Component */}
        <PlotMapRightSplit
          selectedPlot={selectedPlot}
          showOccupiedOnly={showOccupiedOnly}
        />
      </div>
    </div>
  );
}
