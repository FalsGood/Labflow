import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const RegisterSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  nisnNip: z.string().min(5, "NISN/NIP minimal 5 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
  phoneNumber: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export const BorrowRequestSchema = z.object({
  itemId: z.string().uuid("Item tidak valid"),
  quantity: z.coerce.number().int().min(1, "Minimal 1 unit"),
  borrowDate: z.string().min(1, "Tanggal pinjam wajib diisi"),
  returnExpectedDate: z.string().min(1, "Tanggal kembali wajib diisi"),
  notes: z.string().optional(),
}).refine(
  (d) => new Date(d.returnExpectedDate) >= new Date(d.borrowDate),
  { message: "Tanggal kembali harus setelah tanggal pinjam", path: ["returnExpectedDate"] }
);

export const ApproveSchema = z.object({
  adminNotes: z.string().optional(),
});

export const RejectSchema = z.object({
  adminNotes: z.string().min(5, "Alasan penolakan wajib diisi (min 5 karakter)"),
});

export const ReturnSchema = z.object({
  condition: z.enum(["baik", "rusak_ringan", "rusak_berat"]),
  adminNotes: z.string().optional(),
});

export const ItemSchema = z.object({
  categoryId: z.string().uuid("Kategori tidak valid"),
  itemCode: z.string().min(3, "Kode item minimal 3 karakter"),
  name: z.string().min(3, "Nama item minimal 3 karakter"),
  totalStock: z.coerce.number().int().min(1, "Stok minimal 1"),
  availableStock: z.coerce.number().int().min(0, "Stok tersedia tidak boleh negatif"),
  condition: z.enum(["baik", "rusak_ringan", "rusak_berat"]),
  location: z.string().min(3, "Lokasi wajib diisi"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const CategorySchema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter"),
  slug: z.string().min(3, "Slug minimal 3 karakter").regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  description: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type BorrowRequestInput = z.infer<typeof BorrowRequestSchema>;
export type ApproveInput = z.infer<typeof ApproveSchema>;
export type RejectInput = z.infer<typeof RejectSchema>;
export type ReturnInput = z.infer<typeof ReturnSchema>;
export type ItemInput = z.infer<typeof ItemSchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
