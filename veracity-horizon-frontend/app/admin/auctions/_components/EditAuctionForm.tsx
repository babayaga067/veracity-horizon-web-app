"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createAuctionSchema, type CreateAuctionFormData } from "@/app/(auth)/_components/schema";
import { handleUpdateAuction, handleUploadAuctionImage } from "@/app/lib/actions/auth-actions";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

type EditAuctionFormProps = {
  auction: {
    _id: string;
    title: string;
    description?: string;
    startingPrice: number;
    category: string;
    status: string;
    isFeatured: boolean;
    imageUrls?: string[];
    endsAt?: string | Date;
  };
};

export default function EditAuctionForm({ auction }: EditAuctionFormProps) {
  const router = useRouter();
  const [statusMsg, setStatusMsg] = useState<{ message: string; type: "success" | "error" | null } | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>(auction.imageUrls || []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateAuctionFormData & { status?: string; isFeatured?: boolean }>({
    resolver: zodResolver(createAuctionSchema.extend({
      status: z.enum(["upcoming", "active", "closed", "open"]).optional(),
      isFeatured: z.boolean().optional(),
    })),
    defaultValues: {
      title: auction.title,
      description: auction.description || "",
      startingPrice: auction.startingPrice,
      category: auction.category as "Art" | "Electronics" | "Vehicles" | "Collectibles" | "Fashion" | "Real Estate",
      endsAt: auction.endsAt ? new Date(auction.endsAt).toISOString().slice(0, 16) : undefined,
      status: auction.status as "upcoming" | "active" | "closed" | "open",
      isFeatured: auction.isFeatured,
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    const fileArray = Array.from(files);
    setPendingFiles(fileArray);

    const uploadedUrls: string[] = [];
    for (const file of fileArray) {
      try {
        const compressedFile = await imageCompression(file, options);
        const result = await handleUploadAuctionImage(compressedFile);
        if (result.success && result.data?.url) {
          uploadedUrls.push(result.data.url);
        } else {
          setUploadError(result.message || `Failed to upload ${file.name}`);
        }
      } catch {
        setUploadError(`Failed to process ${file.name}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setImagePreviews((prev) => [...prev, ...uploadedUrls]);
    }
    setPendingFiles([]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateAuctionFormData & { status?: string; isFeatured?: boolean }) => {
    setStatusMsg(null);
    
    try {
      const result = await handleUpdateAuction(auction._id, {
        title: data.title,
        description: data.description,
        startingPrice: data.startingPrice,
        category: data.category,
        endsAt: data.endsAt,
        status: data.status,
        isFeatured: data.isFeatured ?? false,
        imageUrls: imagePreviews,
      });

      if (result.success) {
        setStatusMsg({ message: "Auction updated successfully!", type: "success" });
        setTimeout(() => router.push("/admin/auctions"), 1000);
      } else {
        setStatusMsg({ message: result.message || "Failed to update auction", type: "error" });
      }
    } catch (error) {
      setStatusMsg({ 
        message: error instanceof Error ? error.message : "Network error", 
        type: "error" 
      });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Auction</h2>

      {statusMsg && (
        <div className={`p-3 rounded-md mb-4 text-sm ${
          statusMsg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {statusMsg.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            id="title"
            type="text"
            {...register("title")}
            placeholder="Auction title"
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
          {errors.title && <span className="text-xs text-red-600">{errors.title.message}</span>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            {...register("description")}
            placeholder="Item description"
            rows={3}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
          {errors.description && <span className="text-xs text-red-600">{errors.description.message}</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700 mb-1">Starting Price (रु)</label>
            <input
              id="startingPrice"
              type="number"
              {...register("startingPrice", { valueAsNumber: true })}
              placeholder="0"
              step="1"
              min="1"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
            {errors.startingPrice && <span className="text-xs text-red-600">{errors.startingPrice.message}</span>}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              {...register("category")}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            >
              <option value="Art">Art</option>
              <option value="Electronics">Electronics</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Collectibles">Collectibles</option>
              <option value="Fashion">Fashion</option>
              <option value="Real Estate">Real Estate</option>
            </select>
            {errors.category && <span className="text-xs text-red-600">{errors.category.message}</span>}
          </div>
        </div>

        <div>
          <label htmlFor="endsAt" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            id="endsAt"
            type="datetime-local"
            {...register("endsAt")}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={isSubmitting || uploading}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          {uploading && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
          {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}

          {[...imagePreviews, ...pendingFiles].length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-3">
              {imagePreviews.map((url, idx) => (
                <div key={`uploaded-${idx}`} className="relative group">
                  <img src={url} alt={`Image ${idx + 1}`} className="w-full h-20 object-cover rounded-md border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {pendingFiles.map((file, idx) => (
                <div key={`pending-${idx}`} className="relative">
                  <div className="w-full h-20 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <span className="text-xs text-gray-500 px-2 text-center truncate">{file.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              {...register("status")}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center pt-6">
            <input
              id="isFeatured"
              type="checkbox"
              {...register("isFeatured")}
              disabled={isSubmitting}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">Featured listing</label>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            {isSubmitting ? "Updating..." : "Update Auction"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/auctions")}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}