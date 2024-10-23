import { z } from "zod";

const signUpUserSchema = z
  .object({
    fullName: z.string(),
    userName: z.string(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    gender: z.enum(["male", "female"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default signUpUserSchema;
// Compare this snippet from backend/controllers/auth.controller.js:
