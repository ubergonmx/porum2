"use client";

import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { uploadAvatarForm } from "./actions";

export default function AvatarUploadChunk() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setError("");
    setSuccess("");
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      if (selectedFile.size > 1024 * 1024) {
        // If file size is greater than 1MB
        setError("File size is too large! Must be less than 1MB.");
      } else if (!["image/png", "image/jpeg"].includes(selectedFile.type)) {
        // If file type is not PNG or JPEG
        setError("File type not supported! Must be PNG or JPEG.");
      } else {
        // Set the file successfully
        setFile(selectedFile);
        setReady(true);
      }
    } else {
      setError("Please select a file to upload.");
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("handleUpload");
    setReady(false);

    event.preventDefault();

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("userID", "test");
      formData.append("avatarFile", file);

      const response = await uploadAvatarForm(formData);
      console.log(response);
      if (response.error) {
        setError(response.error);
      } else if (response.success) {
        setSuccess(response.success);
      }
    } catch (error) {
      setError("An error occurred while uploading the file.");
      console.error(error);
    } finally {
      setLoading(false);
      setReady(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <CardHeader>
        <CardTitle>Avatar</CardTitle>
        <CardDescription>
          Upload your avatar here! This is your user avatar shown to others in
          Porum.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          id="avatarFile"
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button disabled={!ready} type="submit">
          {!ready ? "Upload" : loading ? "Uploading..." : "Upload"}
        </Button>
        {success && (
          <p className="ml-4 mt-2 text-sm text-green-500">{success}</p>
        )}
      </CardFooter>
    </form>
  );
}
