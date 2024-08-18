import { validateRequest } from "@/lib/auth/validate-request";
import { MAX_FILE_SIZE } from "@/lib/validators/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  avatar: f({ image: { maxFileSize: `${MAX_FILE_SIZE}MB` } })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(
        "[UPLOADTHING_AVATAR] Upload complete for userId:",
        metadata.userId,
      );
      console.log("file url", file.url);
      return { fileUrl: file.url };
    }),
  attachment: f({ image: { maxFileSize: `${MAX_FILE_SIZE}MB` } })
    .middleware(async () => {
      // This code runs on your server before upload
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log(
        "[UPLOADTHING_ATTACHMENT] Upload complete for userId:",
        metadata.userId,
      );
      console.log("file url", file.url);
      return { fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
