"use client";

import React, { useMemo } from "react";
import type { PlotData } from "@/types";
import { getPlotByVillaNumber } from "@/data/plots";

interface PlotPosition {
  villaNumber: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PlotMapRightSplitProps {
  selectedPlot: PlotData | null;
  showOccupiedOnly: boolean;
}

export default function PlotMapRightSplit({
  selectedPlot,
  showOccupiedOnly,
}: PlotMapRightSplitProps) {
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

  // Reactive calculations based on the image data
  const calculations = useMemo(() => {
    // Get all plots data
    const allPlots = plotPositions.map((pos) => ({
      position: pos,
      data: getPlotByVillaNumber(parseInt(pos.villaNumber)),
    }));

    // Filter based on toggle
    const filteredPlots = showOccupiedOnly
      ? allPlots.filter((p) => p.data && p.data.ownerName)
      : allPlots;

    // Total plots count
    const totalPlots = filteredPlots.length;

    // Standard plots (100x100)
    const standardPlots = filteredPlots.filter(
      (p) => p.position.width === 100 && p.position.height === 100,
    );

    // Odd/Corner sites as per image
    const oddSites = ["1", "16", "28", "29", "42", "44", "45", "49", "50"];
    const oddSitesPlots = filteredPlots.filter((p) =>
      oddSites.includes(p.position.villaNumber),
    );

    // Calculate total residential area (sum of all plot areas in Sq.m)
    const totalResidentialAreaSqM = filteredPlots.reduce((sum, p) => {
      return sum + (p.data?.areaInSqM || 0);
    }, 0);

    // Calculate total residential area in Sq.ft
    const totalResidentialAreaSqFt = filteredPlots.reduce((sum, p) => {
      return sum + (p.data?.areaInSqFt || 0);
    }, 0);

    // Excluded plots (as per image: 1, 47, 52, 53, 54, 55)
    const excludedPlots = ["1", "47", "52", "53", "54", "55"];
    const excludedPlotsData = filteredPlots.filter((p) =>
      excludedPlots.includes(p.position.villaNumber),
    );

    const totalExcludedAreaSqM = excludedPlotsData.reduce((sum, p) => {
      return sum + (p.data?.areaInSqM || 0);
    }, 0);

    const totalExcludedAreaSqFt = excludedPlotsData.reduce((sum, p) => {
      return sum + (p.data?.areaInSqFt || 0);
    }, 0);

    // Actual residential area after exclusions
    const actualResidentialAreaSqM =
      totalResidentialAreaSqM - totalExcludedAreaSqM;
    const actualResidentialAreaSqFt =
      totalResidentialAreaSqFt - totalExcludedAreaSqFt;

    // Calculate percentage of total
    const actualResidentialPercentage =
      totalResidentialAreaSqM > 0
        ? ((actualResidentialAreaSqM / totalResidentialAreaSqM) * 100).toFixed(
            2,
          )
        : "0.00";

    // Land use breakdown (as per image)
    const landUse = {
      residential: { areaSqM: 6061.37, areaSqFt: 65244.04, percentage: 53.97 },
      park: { areaSqM: 1130.72, areaSqFt: 12170.97, percentage: 10.07 },
      civicAmenities: { areaSqM: 561.5, areaSqFt: 6043.94, percentage: 5.0 },
      roads: { areaSqM: 3476.28, areaSqFt: 37418.37, percentage: 30.96 },
      plots: { areaSqM: 399.61, areaSqFt: 4301.37, percentage: 5.54 },
      actualResidentialArea: { areaSqM: 5661.76, areaSqFt: 60942.68 },
      total: { areaSqM: 11229.87, areaSqFt: 120877.31, percentage: 100 },
    };

    return {
      totalPlots,
      standardPlots: standardPlots.length,
      oddSites: oddSitesPlots.length,
      totalResidentialAreaSqM,
      totalResidentialAreaSqFt,
      totalExcludedAreaSqM,
      totalExcludedAreaSqFt,
      actualResidentialAreaSqM,
      actualResidentialAreaSqFt,
      actualResidentialPercentage,
      landUse,
      excludedPlots: excludedPlotsData.length,
    };
  }, [showOccupiedOnly]);

  return (
    <div className="h-full bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-y-auto shadow-2xl scroll-smooth scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/50 hover:scrollbar-thumb-slate-600 w-full lg:w-[70%]">
      <div className="p-6 space-y-6">
        {/* Selected Plot Details */}
        {selectedPlot && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <div className="w-1 h-5 bg-violet-500 rounded-full"></div>
              Selected Plot Details
            </h3>
            <div className="bg-violet-900/20 border border-violet-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-violet-500/30 pb-2">
                <span className="text-lg font-bold text-violet-300">
                  Villa #{selectedPlot.villaNo}
                </span>
                <span className="text-xs bg-violet-800/40 px-2 py-1 rounded text-violet-200">
                  {selectedPlot.type}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Owner:</span>
                  <span className="text-slate-200 font-medium">
                    {selectedPlot.ownerName || "Unassigned"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Area (Sq.m):</span>
                  <span className="text-violet-300 font-bold font-mono">
                    {selectedPlot.areaInSqM?.toLocaleString()} Sq.m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Area (Sq.ft):</span>
                  <span className="text-violet-300 font-bold font-mono">
                    {selectedPlot.areaInSqFt?.toLocaleString()} Sq.ft
                  </span>
                </div>
                {plotPositions.find(
                  (p) => p.villaNumber === selectedPlot.villaNo.toString(),
                ) && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dimensions:</span>
                    <span className="text-slate-200 font-mono">
                      {
                        plotPositions.find(
                          (p) =>
                            p.villaNumber === selectedPlot.villaNo.toString(),
                        )?.width
                      }{" "}
                      ×{" "}
                      {
                        plotPositions.find(
                          (p) =>
                            p.villaNumber === selectedPlot.villaNo.toString(),
                        )?.height
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            Layout Specifications
          </h2>
          <p className="text-sm text-slate-400">
            Comprehensive dimensional details and plot information (Reactive
            Calculations)
          </p>
        </div>

        {/* Land Use Summary - As per Image */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
            Land Use Summary
          </h3>
          <div className="bg-slate-800/40 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-700/40">
                <tr className="border-b border-slate-600">
                  <th className="text-left p-3 text-slate-300 font-semibold">
                    Land Use
                  </th>
                  <th className="text-right p-3 text-slate-300 font-semibold">
                    Area (Sq.m)
                  </th>
                  <th className="text-right p-3 text-slate-300 font-semibold">
                    Area (Sq.ft)
                  </th>
                  <th className="text-right p-3 text-slate-300 font-semibold">
                    % Share
                  </th>
                  <th className="text-left p-3 text-slate-300 font-semibold">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <tr className="hover:bg-slate-700/20">
                  <td className="p-3 text-slate-200">Residential</td>
                  <td className="p-3 text-right text-violet-400 font-mono">
                    {calculations.landUse.residential.areaSqM.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-violet-400 font-mono">
                    {calculations.landUse.residential.areaSqFt.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-emerald-400 font-semibold">
                    {calculations.landUse.residential.percentage}%
                  </td>
                  <td className="p-3 text-slate-400">
                    42 standard + odd sites
                  </td>
                </tr>
                <tr className="hover:bg-slate-700/20">
                  <td className="p-3 text-slate-200">Park (Green Space)</td>
                  <td className="p-3 text-right text-violet-400 font-mono">
                    {calculations.landUse.park.areaSqM.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-violet-400 font-mono">
                    {calculations.landUse.park.areaSqFt.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-emerald-400 font-semibold">
                    {calculations.landUse.park.percentage}%
                  </td>
                  <td className="p-3 text-slate-400">Park-1: 562.01 sqm</td>
                </tr>
                <tr className="hover:bg-slate-700/20">
                  <td className="p-3 text-slate-200">Civic Amenities (C.A)</td>
                  <td className="p-3 text-right text-violet-400 font-mono">
                    {calculations.landUse.civicAmenities.areaSqM.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-violet-400 font-mono">
                    {calculations.landUse.civicAmenities.areaSqFt.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-emerald-400 font-semibold">
                    {calculations.landUse.civicAmenities.percentage}%
                  </td>
                  <td className="p-3 text-slate-400">C.A block – irregular</td>
                </tr>
                <tr className="hover:bg-slate-700/20">
                  <td className="p-3 text-slate-200">Roads</td>
                  <td className="p-3 text-right text-violet-400 font-mono">
                    {calculations.landUse.roads.areaSqM.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-violet-400 font-mono">
                    {calculations.landUse.roads.areaSqFt.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-emerald-400 font-semibold">
                    {calculations.landUse.roads.percentage}%
                  </td>
                  <td className="p-3 text-slate-400">
                    9m, 12m, 15m, 9.14m, 8.14m
                  </td>
                </tr>
                <tr className="hover:bg-slate-700/20 bg-orange-950/20">
                  <td className="p-3 text-orange-300 font-semibold italic">
                    Less: Plots
                  </td>
                  <td className="p-3 text-right text-orange-400 font-mono">
                    {calculations.landUse.plots.areaSqM.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-orange-400 font-mono">
                    {calculations.landUse.plots.areaSqFt.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-orange-400 font-semibold">
                    {calculations.landUse.plots.percentage}%
                  </td>
                  <td className="p-3 text-orange-400">
                    Plot 1(137.75) + 47(111.41) + 52(111.41) + 53(91.71) +
                    54(91.71) + 55(78.41)
                  </td>
                </tr>
                <tr className="hover:bg-slate-700/20 bg-emerald-950/30">
                  <td className="p-3 text-emerald-300 font-bold">
                    Actual Residential Area
                  </td>
                  <td className="p-3 text-right text-emerald-400 font-mono font-bold">
                    {calculations.landUse.actualResidentialArea.areaSqM.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-emerald-400 font-mono font-bold">
                    {calculations.landUse.actualResidentialArea.areaSqFt.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-emerald-400 font-bold">
                    {calculations.actualResidentialPercentage}%
                  </td>
                  <td className="p-3 text-emerald-400">
                    Net area after exclusions
                  </td>
                </tr>
                <tr className="bg-slate-700/40 font-bold">
                  <td className="p-3 text-slate-100">TOTAL</td>
                  <td className="p-3 text-right text-violet-300 font-mono">
                    {calculations.landUse.total.areaSqM.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-violet-300 font-mono">
                    {calculations.landUse.total.areaSqFt.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-emerald-300">
                    {calculations.landUse.total.percentage}%
                  </td>
                  <td className="p-3 text-slate-300">55 total plots</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Actual Net Residential Area Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <div className="w-1 h-5 bg-violet-500 rounded-full"></div>
            Actual Net Residential Area
          </h3>
          <div className="bg-slate-800/40 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-blue-900/30">
                <tr className="border-b border-blue-700/50">
                  <th className="text-left p-3 text-blue-300 font-semibold">
                    Component
                  </th>
                  <th className="text-right p-3 text-blue-300 font-semibold">
                    Sq.m
                  </th>
                  <th className="text-right p-3 text-blue-300 font-semibold">
                    Sq.ft
                  </th>
                  <th className="text-right p-3 text-blue-300 font-semibold">
                    % of Total
                  </th>
                  <th className="text-left p-3 text-blue-300 font-semibold">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <tr className="hover:bg-slate-700/20">
                  <td className="p-3 text-slate-200 font-semibold">
                    Total Residential Area (55 plots)
                  </td>
                  <td className="p-3 text-right text-violet-400 font-mono">
                    6,061.37
                  </td>
                  <td className="p-3 text-right text-violet-400 font-mono">
                    65,211.87
                  </td>
                  <td className="p-3 text-right text-emerald-400 font-semibold">
                    100.00%
                  </td>
                  <td className="p-3 text-slate-400">
                    Sum of all 55 plot areas
                  </td>
                </tr>
                <tr className="bg-orange-950/20">
                  <td className="p-3 text-orange-300 font-semibold italic">
                    Less: Excluded Plots
                  </td>
                  <td className="p-3 text-right text-orange-400 font-mono"></td>
                  <td className="p-3 text-right text-orange-400 font-mono"></td>
                  <td className="p-3 text-right text-orange-400 font-mono"></td>
                  <td className="p-3 text-orange-400">
                    Plots 1, 47, 52, 53, 54, 55
                  </td>
                </tr>
                <tr className="hover:bg-slate-700/20">
                  <td className="p-3 text-slate-300 pl-8">Plot 1</td>
                  <td className="p-3 text-right text-slate-400 font-mono">
                    137.78
                  </td>
                  <td className="p-3 text-right text-slate-400 font-mono">
                    1,483.05
                  </td>
                  <td className="p-3 text-right text-slate-500">0</td>
                  <td className="p-3 text-slate-500"></td>
                </tr>
                <tr className="hover:bg-slate-700/20">
                  <td className="p-3 text-slate-300 pl-8">Plot 47</td>
                  <td className="p-3 text-right text-slate-400 font-mono">
                    111.41
                  </td>
                  <td className="p-3 text-right text-slate-400 font-mono">
                    1,199.21
                  </td>
                  <td className="p-3 text-right text-slate-500">0</td>
                  <td className="p-3 text-slate-500">
                    Need to include them for
                  </td>
                </tr>
                <tr className="hover:bg-slate-700/20">
                  <td className="p-3 text-slate-300 pl-8">Plot 52</td>
                  <td className="p-3 text-right text-slate-400 font-mono">
                    111.41
                  </td>
                  <td className="p-3 text-right text-slate-400 font-mono">
                    1,199.21
                  </td>
                  <td className="p-3 text-right text-slate-500">0</td>
                  <td className="p-3 text-slate-500">
                    Need to include them for
                  </td>
                </tr>
                <tr className="hover:bg-slate-700/20">
                  <td className="p-3 text-slate-300 pl-8">Plot 53</td>
                  <td className="p-3 text-right text-slate-400 font-mono">
                    91.71
                  </td>
                  <td className="p-3 text-right text-slate-400 font-mono">
                    987.16
                  </td>
                  <td className="p-3 text-right text-slate-500">0</td>
                  <td className="p-3 text-slate-500"></td>
                </tr>
                <tr className="hover:bg-slate-700/20">
                  <td className="p-3 text-slate-300 pl-8">Plot 54</td>
                  <td className="p-3 text-right text-slate-400 font-mono">
                    91.71
                  </td>
                  <td className="p-3 text-right text-slate-400 font-mono">
                    987.16
                  </td>
                  <td className="p-3 text-right text-slate-500">0</td>
                  <td className="p-3 text-slate-500"></td>
                </tr>
                <tr className="hover:bg-slate-700/20">
                  <td className="p-3 text-slate-300 pl-8">Plot 55</td>
                  <td className="p-3 text-right text-slate-400 font-mono">
                    78.41
                  </td>
                  <td className="p-3 text-right text-slate-400 font-mono">
                    844.00
                  </td>
                  <td className="p-3 text-right text-slate-500">0</td>
                  <td className="p-3 text-slate-500"></td>
                </tr>
                <tr className="bg-orange-950/30">
                  <td className="p-3 text-orange-300 font-bold">
                    Total Excluded Area
                  </td>
                  <td className="p-3 text-right text-orange-400 font-mono font-bold">
                    399.61
                  </td>
                  <td className="p-3 text-right text-orange-400 font-mono font-bold">
                    4,301.37
                  </td>
                  <td className="p-3 text-right text-orange-400"></td>
                  <td className="p-3 text-orange-400"></td>
                </tr>
                <tr className="bg-emerald-950/40 font-bold">
                  <td className="p-3 text-emerald-300 text-base">
                    ✓ ACTUAL RESIDENTIAL AREA
                  </td>
                  <td className="p-3 text-right text-emerald-400 font-mono text-base">
                    5,661.76
                  </td>
                  <td className="p-3 text-right text-emerald-400 font-mono text-base">
                    60,910.50
                  </td>
                  <td className="p-3 text-right text-emerald-400 text-base">
                    19.62%
                  </td>
                  <td className="p-3 text-emerald-400">
                    Net area after exclusions
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Reactive Statistics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <div className="w-1 h-5 bg-cyan-500 rounded-full"></div>
            Live Statistics{" "}
            {showOccupiedOnly && (
              <span className="text-xs bg-cyan-900/40 px-2 py-1 rounded text-cyan-300">
                (Occupied Only)
              </span>
            )}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-violet-900/20 to-violet-950/40 border border-violet-500/30 rounded-xl p-4">
              <p className="text-xs text-violet-300 mb-1">Total Villas</p>
              <p className="text-3xl font-bold text-violet-400 font-mono">
                {calculations.totalPlots}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/20 to-blue-950/40 border border-blue-500/30 rounded-xl p-4">
              <p className="text-xs text-blue-300 mb-1">Standard Villas</p>
              <p className="text-3xl font-bold text-blue-400 font-mono">
                {calculations.standardPlots}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-900/20 to-orange-950/40 border border-orange-500/30 rounded-xl p-4">
              <p className="text-xs text-orange-300 mb-1">Odd Villas</p>
              <p className="text-3xl font-bold text-orange-400 font-mono">
                {calculations.oddSites}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/40 border border-emerald-500/30 rounded-xl p-4">
              <p className="text-xs text-emerald-300 mb-1">Excluded Villas</p>
              <p className="text-3xl font-bold text-emerald-400 font-mono">
                {calculations.excludedPlots}
              </p>
            </div>
          </div>
        </div>

        {/* Color Legend */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
            Plot Type Legend
          </h3>
          <div className="bg-slate-800/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-950 border-2 border-blue-500 rounded"></div>
              <span className="text-xs text-slate-300">
                Standard Plots (100×100)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-orange-950 border-2 border-orange-500 rounded"></div>
              <span className="text-xs text-slate-300">
                Odd Sites (1, 16, 28, 29, 42, 44, 45, 49, 50)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-purple-950 border-2 border-purple-500 rounded"></div>
              <span className="text-xs text-slate-300">
                Merged/Irregular Plots (100×210)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-violet-600 border-2 border-violet-400 rounded"></div>
              <span className="text-xs text-slate-300">
                Selected/Hovered Plot
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
