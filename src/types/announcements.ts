export type AnnouncementCategory = "General" | "Maintenance" | "Event";

export type AnnouncementPriority = "low" | "medium" | "high" | "critical";

export interface Announcement {
    id: string;
    title: string;
    content: string;
    category: AnnouncementCategory;
    priority: AnnouncementPriority;
    isActive: boolean;
    publishDate: string;
    createdAt: string;
    updatedAt: string;
}