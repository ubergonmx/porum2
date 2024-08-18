"use server";

/**
 * Checks if file is a valid image by checking the magic number
 * @param file image file to check
 * @returns true if the file is a valid image file
 */
async function checkMagicNumber(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);

  // JPEG magic numbers: [0xFF, 0xD8, 0xFF]
  const jpgMagicNumbers = [0xff, 0xd8, 0xff];
  // PNG magic numbers: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
  const pngMagicNumbers = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

  const isJPEG = jpgMagicNumbers.every(
    (byte, index) => byteArray[index] === byte,
  );
  const isPNG = pngMagicNumbers.every(
    (byte, index) => byteArray[index] === byte,
  );

  return isJPEG || isPNG;
}

export async function addImage(file: File) {}

export interface UploadAvatarInput {
  userID: string;
  file: File;
}

export async function uploadAvatarForm(formData: FormData) {
  // Upload the image to local storage
  console.log(formData);

  const rawFormData = {
    userID: formData.get("userID"),
    file: formData.get("avatarFile"),
  };

  if (!rawFormData.file) {
    console.log("Please select a file to upload.");
    return { error: "Please select a file to upload." };
  }

  const avatarFile = rawFormData.file as File;

  // Verify the file is a valid image
  const isValidImage = await checkMagicNumber(avatarFile);

  if (!isValidImage) {
    console.log("Invalid image file.");
    return { error: "Invalid image file." };
  } else {
    // Upload the image to local storage
    console.log("Uploading image...");
    return { success: "Image uploaded successfully." };
  }
}
