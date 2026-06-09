import { z } from "zod";

const emailField = z.email("Format email tidak valid");
const passwordField = z.string().min(8, "Kata sandi minimal 8 karakter");

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});
export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z.string().min(5, "Nama minimal 5 karakter").max(20),
    email: emailField,
    password: passwordField,
    confirmPassword: passwordField,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Kata sandi dan konfirmasi tidak sama",
    path: ["confirmPassword"],
  });
export type RegisterForm = z.infer<typeof registerSchema>;
