import { z } from "zod";

export const MAX_FILE_SIZE = 4; // 4MB, should be in power of 2 and MB
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];

// const EMAIL_REGEX =
//   /^(?!\.)("([^"\r\\]|\\["\r\\])*"|([-a-z0-9!#$%&'*+/=?^_`{|}~]|(?<!\.)\.)*)(?<!\.)@[a-z0-9][\w\\.-]*[a-z0-9]\.[a-z][a-z\\.]*[a-z]$/;
const OWASP_EMAIL_REGEX =
  /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

const checkEmailLength = (email: string) => {
  const [localPart, domainPart] = email.split("@");
  if (!localPart || !domainPart) return false;

  const getByteLength = (str: string | undefined) =>
    new TextEncoder().encode(str).length;

  // Check the byte length of the local part and the domain part
  return getByteLength(localPart) <= 64 && getByteLength(domainPart) <= 255;
};

export const signupSchema = z.object({
  firstName: z
    .string({ required_error: "First name is required" })
    .trim()
    .min(1, "First name must be at least 1 character")
    .max(255, "First name must not be more than 255 characters long")
    .regex(/^[a-zA-Z\s]*$/, "First name must only contain letters and spaces"),
  lastName: z
    .string({ required_error: "Last name is required" })
    .trim()
    .min(1, "Last name must be at least 1 character")
    .max(255, "Last name must not be more than 255 characters long")
    .regex(/^[a-zA-Z\s]*$/, "First name must only contain letters and spaces"),
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(255, "Username must not be more than 255 characters long")
    .regex(/^[a-zA-Z0-9]*$/, "Username must only contain letters and numbers"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(3, "Email must be at least 3 characters")
    .regex(OWASP_EMAIL_REGEX, "Invalid email address")
    .refine(
      checkEmailLength,
      "Local part and domain part must be 64 and 255 bytes or less",
    ),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  phone: z.string().refine(
    async (phone) => {
      // Used dynamic import because it causes the following error in server-side:
      // TypeError: Super expression must either be null or a function
      const isValidPhoneNumber = (await import("react-phone-number-input"))
        .isValidPhoneNumber;
      return isValidPhoneNumber(phone);
    },
    { message: "Invalid phone number" },
  ),
  avatar: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE * 1024 * 1024,
      `Max image size is ${MAX_FILE_SIZE}MB`,
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Must be PNG or JPEG",
    )
    .refine(async (file) => {
      if (!file) return true;
      // Check Magic Number
      const arrayBuffer = await file.arrayBuffer();
      const byteArray = new Uint8Array(arrayBuffer);

      const jpgMagicNumbers = [0xff, 0xd8, 0xff];
      const pngMagicNumbers = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

      const isJPEG = jpgMagicNumbers.every(
        (byte, index) => byteArray[index] === byte,
      );
      const isPNG = pngMagicNumbers.every(
        (byte, index) => byteArray[index] === byte,
      );
      return isJPEG || isPNG;
    }, "Must be PNG or JPEG"),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(3, "Email must be at least 3 characters")
    .regex(OWASP_EMAIL_REGEX, "Invalid email address")
    .refine(
      checkEmailLength,
      "Local part and domain part must be 64 and 255 bytes or less",
    ),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = // z.object({
  // email: z
  z
    .string({ required_error: "Email is required" })
    .trim()
    .min(3, "Email must be at least 3 characters")
    .regex(OWASP_EMAIL_REGEX, "Invalid email address")
    .refine(
      checkEmailLength,
      "Local part and domain part must be 64 and 255 bytes or less",
    );
// });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Invalid token"),
  password: z.string().min(8, "Password is too short").max(255),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
