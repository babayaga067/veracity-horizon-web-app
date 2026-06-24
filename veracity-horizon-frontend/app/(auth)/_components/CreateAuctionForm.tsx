"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAuctionSchema, CreateAuctionFormData } from "@/app/(auth)/_components/schema";
import { handleCreateAuction, handleUploadAuctionImage } from "@/app/lib/actions/auth-actions";

interface CreateAuctionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateAuctionForm({ onSuccess, onCancel }: CreateAuctionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAuctionFormData>({
    resolver: zodResolver(createAuctionSchema),
  });

  const [status, setStatus] = useState<{ message: string; type: "success" | "error" | null } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);
    const uploadPromises = Array.from(files).map(async (file) => {
      const result = await handleUploadAuctionImage(file);
      if (result.success && result.data?.url) {
        return result.data.url;
      }
      setUploadError(result.message || `Failed to upload ${file.name}`);
      return null;
    });
    const results = await Promise.all(uploadPromises);
    const uploadedUrls = results.filter((url): url is string => url !== null);
    if (uploadedUrls.length > 0) {
      setImagePreviews((prev) => [...prev, ...uploadedUrls]);
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateAuctionFormData) => {
    setStatus(null);

    const result = await handleCreateAuction({
      title: data.title,
      description: data.description,
      startingPrice: data.startingPrice,
      category: data.category,
      endsAt: data.endsAt,
      imageUrls: imagePreviews.length > 0 ? imagePreviews : undefined,
    });

    if (result.success) {
      setStatus({ message: "Auction created successfully", type: "success" });
      reset();
      setImagePreviews([]);
      onSuccess?.();
    } else {
      setStatus({ message: result.message || "Failed to create auction", type: "error" });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Create New Auction</h2>

      {status && (
        <div className={`p-4 rounded-xl mb-4 ${
          status.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
          <input
            id="title"
            type="text"
            {...register("title")}
            placeholder="Auction title"
            disabled={isSubmitting || uploading}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
          {errors.title && <span className="text-xs text-red-600 mt-1">{errors.title.message}</span>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <textarea
            id="description"
            {...register("description")}
            placeholder="Item description"
            rows={4}
            disabled={isSubmitting || uploading}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
          {errors.description && <span className="text-xs text-red-600 mt-1">{errors.description.message}</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="startingPrice" className="block text-sm font-semibold text-slate-700 mb-2">Starting Price (रु)</label>
            <input
              id="startingPrice"
              type="number"
              {...register("startingPrice", { valueAsNumber: true })}
              placeholder="0"
              step="1"
              min="1"
              disabled={isSubmitting || uploading}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            {errors.startingPrice && <span className="text-xs text-red-600 mt-1">{errors.startingPrice.message}</span>}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <select
              id="category"
              {...register("category")}
              disabled={isSubmitting || uploading}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="">Select category</option>
              <option value="Art">Art</option>
              <option value="Electronics">Electronics</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Collectibles">Collectibles</option>
              <option value="Fashion">Fashion</option>
              <option value="Real Estate">Real Estate</option>
            </select>
            {errors.category && <span className="text-xs text-red-600 mt-1">{errors.category.message}</span>}
          </div>
        </div>

        <div>
          <label htmlFor="endsAt" className="block text-sm font-semibold text-slate-700 mb-2">End Date (optional)</label>
          <input
            id="endsAt"
            type="datetime-local"
            {...register("endsAt")}
            disabled={isSubmitting || uploading}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={isSubmitting || uploading}
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          {uploading && <span className="text-xs text-blue-600 mt-1">Uploading...</span>}
          {uploadError && <span className="text-xs text-red-600 mt-1">{uploadError}</span>}
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {imagePreviews.map((url, idx) => (
              <div key={idx} className="relative group">
                <img src={url} alt={`Preview ${idx}`} className="w-full h-24 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="flex-1 py-3.5 px-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition-all"
          >
            {isSubmitting ? "Creating..." : "Create Auction"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || uploading}
              className="px-6 py-3 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}