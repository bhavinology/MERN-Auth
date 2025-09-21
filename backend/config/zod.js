import { email, z } from "zod";

const registerUserSchema = z.object({
  name: z.string().min(3, "name must be atleast 3 chars"),
  email: z.string().email("invalid email"),
  password: z.string().min(8, "password must be atleast 8 Chars"),
});

export default registerUserSchema;
