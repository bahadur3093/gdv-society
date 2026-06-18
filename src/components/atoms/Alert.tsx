"use client";

import { Info, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

type AlertType = "info" | "warning" | "error" | "success";

interface AlertProps {
  message: string;
  type?: AlertType;
}

const alertConfig: Record<AlertType, { icon: React.ReactNode; className: string }> = {
  info: { icon: <Info className="w-8 h-8 text-violet-400" />, className: "bg-blue-500/10 border-blue-500/20" },
  warning: { icon: <AlertCircle className="w-8 h-8 text-yellow-400" />, className: "bg-yellow-500/10 border-yellow-500/20" },
  error: { icon: <XCircle className="w-8 h-8 text-red-400" />, className: "bg-red-500/10 border-red-500/20" },
  success: { icon: <CheckCircle2 className="w-8 h-8 text-green-400" />, className: "bg-emerald-500/10 border-emerald-500/20" },
};

export default function Alert({ message, type = "info" }: AlertProps) {
  const config = alertConfig[type] || alertConfig.info;

  return (
    <div className={`border rounded-lg p-4 ${config.className}`}>
      <div className="flex justify-start items-center gap-4">
        {config.icon}
        <span className={`${type === "error" ? "text-red-300" : type === "warning" ? "text-yellow-200" : type === "success" ? "text-green-300" : "text-slate-400"} text-md`}>{message}</span>
      </div>
    </div>
  );
}
