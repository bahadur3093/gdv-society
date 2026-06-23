"use client";

import { useState } from "react";
import {
  Edit,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Shield,
} from "lucide-react";
import Card from "@/components/atoms/Card";
import Avatar from "@/components/atoms/Avatar";
import { cn, formatDate } from "@/lib/utils/utils";
import Button from "@/components/atoms/Button";
import EditAdminProfileSheet from "./EditAdminProfileSheet";
import Badge from "@/components/atoms/Badge";

interface Admin {
  id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  createdAt: Date;
}

interface Props {
  admin: Admin;
}

export default function AdminInfoCard({ admin }: Props) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <Card
        padding="lg"
        variant="gradient"
        className="relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar + name block */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Avatar size="xl" name={admin.name} ring="brand" />
            <div className="flex-1 min-w-0">
              {/* Name + verification */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-h2 text-text-primary truncate">
                  {admin.name}
                </h1>
                {admin.emailVerified ? (
                  <span title="Email verified">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  </span>
                ) : (
                  <span title="Email not verified">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                  </span>
                )}
              </div>

              {/* Email */}
              <p className="text-body text-text-secondary mt-1 truncate">
                {admin.email}
              </p>

              {/* Role badge */}
              <div className="mt-3">
                <Badge variant="brand" outline icon={<Shield />}>
                  Administrator
                </Badge>
              </div>

              {/* Joined date */}
              <p
                className={cn(
                  "flex items-center gap-1.5 mt-4",
                  "text-body-sm text-text-muted",
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                Admin since {formatDate(admin.createdAt, "long")}
              </p>
            </div>
          </div>

          {/* Edit button */}
          <div className="shrink-0">
            <Button
              variant="primary"
              size="md"
              icon={<Edit />}
              onClick={() => setEditOpen(true)}
            >
              Edit name
            </Button>
          </div>
        </div>
      </Card>

      <EditAdminProfileSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        admin={admin}
      />
    </>
  );
}
