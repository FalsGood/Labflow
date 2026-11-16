import { JWTPayload } from "@/lib/auth";

export type SessionUser = JWTPayload;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type UserRole = "admin" | "siswa";
export type BorrowStatus = "pending" | "approved" | "rejected" | "borrowed" | "returned" | "overdue";
export type ItemCondition = "baik" | "rusak_ringan" | "rusak_berat";

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  nisnNip: string;
  role: UserRole;
  phoneNumber: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryPublic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { items: number };
}

export interface ItemPublic {
  id: string;
  itemCode: string;
  name: string;
  totalStock: number;
  availableStock: number;
  condition: ItemCondition;
  location: string;
  imageUrl: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  category: CategoryPublic;
}

export interface BorrowingPublic {
  id: string;
  transactionCode: string;
  quantity: number;
  borrowDate: string;
  returnExpectedDate: string;
  returnActualDate: string | null;
  status: BorrowStatus;
  notes: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  user: Pick<UserPublic, "id" | "name" | "email" | "nisnNip">;
  item: Pick<ItemPublic, "id" | "name" | "itemCode" | "imageUrl"> & { category: Pick<CategoryPublic, "name"> };
  admin: Pick<UserPublic, "id" | "name"> | null;
}

export interface ActivityLogPublic {
  id: string;
  action: string;
  context: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: Pick<UserPublic, "id" | "name" | "email" | "role"> | null;
}
