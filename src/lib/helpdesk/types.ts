import type {
  ResidentRequest,
  RequestComment,
  RequestType,
  RequestStatus,
  User,
} from "@prisma/client";

export type RequestWithAuthor = ResidentRequest & {
  user: Pick<User, "id" | "name" | "email" | "plotNumber">;
};

export type CommentWithAuthor = RequestComment & {
  author: Pick<User, "id" | "name" | "role">;
};

export type RequestDetail = ResidentRequest & {
  user: Pick<User, "id" | "name" | "email" | "plotNumber">;
  comments: CommentWithAuthor[];
};

export type CreateRequestInput = {
  requestType: RequestType;
  description: string;
  newPlotSize?: number;
  familyMemberName?: string;
  familyMemberRelation?: string;
  familyMemberContact?: string;
};

export type RequestFilters = {
  status?: RequestStatus | "ALL";
  type?: RequestType | "ALL";
  search?: string;
};
