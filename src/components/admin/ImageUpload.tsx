"use client";

import React, { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Camera, Loader2, Upload, X, FileImage, Check } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  label?: string;
  aspectRatio?: "square" | "video" | "auto";
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket = "content",
  folder = "uploads",
  label = "Upload Image",
  aspectRatio = "video",
  className = "",
}: ImageUploadProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;
      console.log(`[Storage] Attempting upload to bucket: "${bucket}", path: "${filePath}"`);

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        console.error(`[Storage Error] Bucket: "${bucket}", Error:`, uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const ratioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "h-48",
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">
          {label}
        </label>
      )}

      <div
        className={`relative group rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
          dragActive ? "border-[#41cc00] bg-[#41cc00]/5" : "border-black/5 bg-black/[0.02] hover:bg-black/[0.04]"
        } ${ratioClasses[aspectRatio]}`}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-white rounded-full text-[#1d1d1f] hover:bg-[#41cc00] hover:text-white transition-all shadow-lg"
                title="Change Image"
              >
                <Upload className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="p-3 bg-white rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                title="Remove Image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute top-4 right-4 p-1 bg-[#41cc00] rounded-full shadow-sm">
                <Check className="w-3 h-3 text-white" />
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center gap-3 p-8 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center text-[#1d1d1f]/40 group-hover:text-[#41cc00] transition-colors">
              {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileImage className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-sm font-bold text-[#1d1d1f]">
                {uploading ? "Uploading..." : "Click to upload or drag & drop"}
              </p>
              <p className="text-[11px] text-[#1d1d1f]/40 font-medium uppercase tracking-widest mt-1">
                Supports JPG, PNG, WEBP (Max 5MB)
              </p>
            </div>
          </button>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
