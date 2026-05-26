"use client";

import React, { useState, useRef } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { getPlotByVillaNumber } from "@/data/plots";
import type { PlotData } from "@/types";

interface PlotPosition {
  villaNumber: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface HoverInfo {
  plot: PlotData;
  x: number;
  y: number;
}

interface PlotMapLeftSplitProps {
  onPlotHover: (hoverInfo: HoverInfo | null) => void;
  onPlotSelect: (plot: PlotData | null) => void;
  selectedPlot: PlotData | null;
  hoveredPlot: HoverInfo | null;
}

export default function PlotMapLeftSplit({
  onPlotHover,
  onPlotSelect,
  selectedPlot,
  hoveredPlot,
}: PlotMapLeftSplitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: -500, y: 500 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Dynamic SVG viewBox dimensions
  const viewBoxWidth = 1900;
  const viewBoxHeight = 920;
  
  // Calculate rotation center point (center of viewBox)
  const rotationCenterX = viewBoxWidth / 2;
  const rotationCenterY = viewBoxHeight / 2;

  // The structural layout matching your grid precisely - optimized for wider rectangular display
  const plotPositions: PlotPosition[] = [
    // Top Row (Villas 1-16)
    { villaNumber: "1", x: 80, y: 40, width: 100, height: 100 },
    { villaNumber: "2", x: 190, y: 40, width: 100, height: 100 },
    { villaNumber: "3", x: 300, y: 40, width: 100, height: 100 },
    { villaNumber: "4", x: 410, y: 40, width: 100, height: 100 },
    { villaNumber: "5", x: 520, y: 40, width: 100, height: 100 },
    { villaNumber: "6", x: 630, y: 40, width: 100, height: 100 },
    { villaNumber: "7", x: 740, y: 40, width: 100, height: 100 },
    { villaNumber: "8", x: 850, y: 40, width: 100, height: 100 },
    { villaNumber: "9", x: 960, y: 40, width: 100, height: 100 },
    { villaNumber: "10", x: 1070, y: 40, width: 100, height: 100 },
    { villaNumber: "11", x: 1180, y: 40, width: 100, height: 100 },
    { villaNumber: "12", x: 1290, y: 40, width: 100, height: 100 },
    { villaNumber: "13", x: 1400, y: 40, width: 100, height: 100 },
    { villaNumber: "14", x: 1510, y: 40, width: 100, height: 100 },
    { villaNumber: "15", x: 1620, y: 40, width: 100, height: 100 },
    { villaNumber: "16", x: 1730, y: 40, width: 100, height: 100 },

    // Second Row (Villas 28-17)
    { villaNumber: "28", x: 80, y: 210, width: 100, height: 100 },
    { villaNumber: "27", x: 190, y: 210, width: 100, height: 100 },
    { villaNumber: "26", x: 300, y: 210, width: 100, height: 100 },
    { villaNumber: "25", x: 410, y: 210, width: 100, height: 100 },
    { villaNumber: "24", x: 520, y: 210, width: 100, height: 100 },
    { villaNumber: "23", x: 630, y: 210, width: 100, height: 100 },
    { villaNumber: "22", x: 740, y: 210, width: 100, height: 100 },
    { villaNumber: "21", x: 850, y: 210, width: 100, height: 100 },
    { villaNumber: "20", x: 960, y: 210, width: 100, height: 100 },
    { villaNumber: "19", x: 1070, y: 210, width: 100, height: 100 },
    { villaNumber: "18", x: 1180, y: 210, width: 100, height: 100 },
    { villaNumber: "17", x: 1290, y: 210, width: 100, height: 100 },

    // Third Row (Villas 29-40)
    { villaNumber: "29", x: 80, y: 380, width: 100, height: 100 },
    { villaNumber: "30", x: 190, y: 380, width: 100, height: 100 },
    { villaNumber: "31", x: 300, y: 380, width: 100, height: 100 },
    { villaNumber: "32", x: 410, y: 380, width: 100, height: 100 },
    { villaNumber: "33", x: 520, y: 380, width: 100, height: 100 },
    { villaNumber: "34", x: 630, y: 380, width: 100, height: 100 },
    { villaNumber: "35", x: 740, y: 380, width: 100, height: 100 },
    { villaNumber: "36", x: 850, y: 380, width: 100, height: 100 },
    { villaNumber: "37", x: 960, y: 380, width: 100, height: 100 },
    { villaNumber: "38", x: 1070, y: 380, width: 100, height: 100 },
    { villaNumber: "39", x: 1180, y: 380, width: 100, height: 100 },
    { villaNumber: "40", x: 1290, y: 380, width: 100, height: 100 },

    // Bottom Right Section
    { villaNumber: "46", x: 1180, y: 550, width: 100, height: 100 },
    { villaNumber: "45", x: 1180, y: 660, width: 100, height: 100 },
    { villaNumber: "44", x: 1180, y: 770, width: 100, height: 100 },
    { villaNumber: "41", x: 1290, y: 550, width: 100, height: 100 },
    { villaNumber: "42", x: 1290, y: 660, width: 100, height: 210 },

    // Bottom Left Section
    { villaNumber: "52", x: 850, y: 550, width: 100, height: 100 },
    { villaNumber: "50", x: 850, y: 660, width: 100, height: 210 },
    { villaNumber: "47", x: 960, y: 550, width: 100, height: 100 },
    { villaNumber: "49", x: 960, y: 660, width: 100, height: 210 },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).tagName === "rect" ||
      (e.target as HTMLElement).tagName === "text"
    )
      return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const getPlotStyles = (villaNumber: string) => {
    const plot = getPlotByVillaNumber(parseInt(villaNumber));
    const isHovered = hoveredPlot?.plot.villaNo === parseInt(villaNumber);
    const isSelected = selectedPlot?.villaNo === parseInt(villaNumber);

    if (isHovered || isSelected) {
      return {
        fill: "fill-violet-600/90",
        stroke: "stroke-violet-400",
        strokeWidth: "3",
      };
    }

    if (!plot)
      return {
        fill: "fill-slate-800/90",
        stroke: "stroke-slate-700",
        strokeWidth: "1.5",
      };

    const plotPos = plotPositions.find(p => p.villaNumber === villaNumber);
    const oddSites = ["1", "16", "28", "29", "42", "44", "45", "49", "50"];
    const isOddSite = oddSites.includes(villaNumber);
    const isIrregularSize = plotPos && (plotPos.width !== 100 || plotPos.height !== 100);
    
    if (isOddSite) {
      return {
        fill: "fill-orange-950/80",
        stroke: "stroke-orange-500",
        strokeWidth: "2",
      };
    }
    
    if (isIrregularSize) {
      return {
        fill: "fill-purple-950/80",
        stroke: "stroke-purple-500",
        strokeWidth: "2",
      };
    }

    return {
      fill: "fill-blue-950/80",
      stroke: "stroke-blue-500",
      strokeWidth: "1.5",
    };
  };

  return (
    <div className="relative h-full flex flex-col bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl w-full lg:w-[30%]">
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative flex-1 overflow-hidden ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      >
        <svg
          className="w-full h-full transition-transform duration-75 ease-out"
          viewBox={`0 0 ${viewBoxHeight} ${viewBoxWidth}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform={`translate(-500, 500) scale(${zoom}) rotate(90 ${rotationCenterX} ${rotationCenterY})`}>
            {/* Roads */}
            <rect x="80" y="150" width="1750" height="50" className="fill-slate-800/60" />
            <text x="955" y="180" className="fill-slate-500 text-xs font-semibold tracking-widest" textAnchor="middle" transform="rotate(-90 955 180)">ROAD</text>

            <rect x="1400" y="200" width="110" height="670" className="fill-slate-800/60" />
            <text x="1455" y="540" className="fill-slate-500 text-xs font-semibold tracking-widest" textAnchor="middle" transform="rotate(-180 1455 540)">ROAD</text>

            <rect x="80" y="320" width="1320" height="50" className="fill-slate-800/60" />
            <text x="740" y="350" className="fill-slate-500 text-xs font-semibold tracking-widest" textAnchor="middle" transform="rotate(-90 740 350)">ROAD</text>

            <rect x="80" y="490" width="1320" height="50" className="fill-slate-800/60" />
            <text x="740" y="520" className="fill-slate-500 text-xs font-semibold tracking-widest" textAnchor="middle" transform="rotate(-90 740 520)">ROAD</text>

            <rect x="1070" y="540" width="100" height="330" className="fill-slate-800/60" />
            <text x="1120" y="710" className="fill-slate-500 text-xs font-semibold tracking-widest" textAnchor="middle" transform="rotate(-180 1120 710)">ROAD</text>

            <rect x="740" y="540" width="100" height="330" className="fill-slate-800/60" />
            <text x="790" y="710" className="fill-slate-500 text-xs font-semibold tracking-widest" textAnchor="middle" transform="rotate(-180 790 710)">ROAD</text>

            {/* Community Spaces */}
            <g className="opacity-90">
              <rect x="80" y="550" width="500" height="320" rx="12" className="fill-blue-950/40 stroke-blue-500/30 stroke-2" />
              <text x="320" y="710" className="fill-blue-400 font-bold text-sm tracking-wider" textAnchor="middle" transform="rotate(-90 320 710)">CIVIC AMENITIES (CA)</text>
            </g>

            <g className="opacity-90">
              <rect x="590" y="550" width="140" height="210" rx="8" className="fill-amber-950/40 stroke-amber-500/30 stroke-2" />
              <text x="660" y="660" className="fill-amber-400 font-bold text-sm tracking-wider" textAnchor="middle" transform="rotate(-90 660 660)">CLUB HOUSE</text>
            </g>

            <g className="opacity-90">
              <rect x="590" y="770" width="140" height="100" rx="8" className="fill-cyan-950/40 stroke-cyan-500/30 stroke-2" />
              <text x="660" y="825" className="fill-cyan-400 font-bold text-sm tracking-wider" textAnchor="middle" transform="rotate(-90 660 825)">POOL</text>
            </g>

            <g className="opacity-90">
              <rect x="1520" y="210" width="310" height="660" rx="16" className="fill-emerald-950/30 stroke-emerald-500/30 stroke-2" />
              <text x="1670" y="540" className="fill-emerald-400 font-bold text-base tracking-widest" textAnchor="middle" transform="rotate(-90 1670 540)">COMMUNITY PARK</text>
            </g>

            {/* Individual Plots */}
            {plotPositions.map((pos) => {
              const styles = getPlotStyles(pos.villaNumber);
              const plot = getPlotByVillaNumber(parseInt(pos.villaNumber));

              return (
                <g
                  key={pos.villaNumber}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={(e) => {
                    if (plot) onPlotHover({ plot, x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => {
                    if (plot && hoveredPlot) onPlotHover({ plot, x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => onPlotHover(null)}
                  onClick={() => onPlotSelect(plot || null)}
                >
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={pos.width}
                    height={pos.height}
                    rx="6"
                    className={`${styles.fill} ${styles.stroke} transition-colors duration-150`}
                    strokeWidth={styles.strokeWidth}
                  />
                  <text
                    x={pos.x + pos.width / 2}
                    y={pos.y + pos.height / 2 + 5}
                    textAnchor="middle"
                    className="fill-slate-200 text-sm font-bold tracking-tight font-mono pointer-events-none"
                    transform={`rotate(-90 ${pos.x + pos.width / 2} ${pos.y + pos.height / 2 + 5})`}
                  >
                    {pos.villaNumber}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover Tooltip */}
        {hoveredPlot && (
          <div
            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+12px)] transition-all duration-75"
            style={{ left: `${hoveredPlot.x}px`, top: `${hoveredPlot.y}px` }}
          >
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-xl p-4 shadow-2xl shadow-black/80 min-w-[240px] space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-sm font-bold text-slate-200">Villa #{hoveredPlot.plot.villaNo}</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 font-medium">{hoveredPlot.plot.type}</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Resident:</span>
                  <span className="text-slate-200 font-medium">{hoveredPlot.plot.ownerName || "Unassigned"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Area:</span>
                  <span className="text-violet-400 font-semibold font-mono">{hoveredPlot.plot.areaInSqFt?.toLocaleString()} Sq.Ft</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Zoom Controls */}
      <div className="flex items-center justify-center gap-3 p-4 bg-slate-900/60 border-t border-slate-800/80">
        <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-1">
          <button onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))} className="p-2 text-slate-400 hover:text-slate-200 transition-colors" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-300 px-3 min-w-[56px] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="p-2 text-slate-400 hover:text-slate-200 transition-colors" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        <button onClick={() => { setZoom(1); setPan({ x: -500, y: 500 }); }} className="p-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors" title="Reset View">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}