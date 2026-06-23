"use client";

import { useState } from "react";
import {
  Edit,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Hash,
} from "lucide-react";
import type { ResidentProfileData } from "@/lib/users/getResidentProfile";
import Card from "@/components/atoms/Card";
import Avatar from "@/components/atoms/Avatar";
import { cn, formatDate } from "@/lib/utils/utils";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import EditProfileSheet from "./EditProfileSheet";

interface Props {
  user: ResidentProfileData["user"];
}

export default function ProfileInfoCard({ user }: Props) {
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
            <Avatar
              size="xl"
              name={user.name}
              ring={user.emailVerified ? "success" : "subtle"}
            />
            <div className="flex-1 min-w-0">
              {/* Name + verification */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-h2 text-text-primary truncate">
                  {user.name}
                </h1>
                {user.emailVerified ? (
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
                {user.email}
              </p>

              {/* Plot number badge */}
              {user.plotNumber && (
                <div className="mt-3">
                  <Badge variant="info" outline icon={<Hash />}>
                    Plot {user.plotNumber}
                  </Badge>
                </div>
              )}

              {/* Joined date */}
              <p
                className={cn(
                  "flex items-center gap-1.5 mt-4",
                  "text-body-sm text-text-muted",
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                Member since {formatDate(user.createdAt, "long")}
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
              Edit
            </Button>
          </div>
        </div>
      </Card>

      <EditProfileSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user}
      />
    </>
  );
}
