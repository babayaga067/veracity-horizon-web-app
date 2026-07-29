"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAuctionSchema, CreateAuctionFormData } from "@/app/(auth)/_components/schema";
import { handleCreateAuction, handleUploadAuctionImage } from "@/app/lib/actions/auth-actions";
import { imageUrl } from "@/app/lib/api/config";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";

const ALL_CATEGORIES = [
  "Art",
  "Electronics",
  "Vehicles",
  "Collectibles",
  "Fashion",
  "Real Estate",
  "Textiles",
  "Jewelry",
  "Antiques",
  "Food & Spices",
  "Handicrafts",
  "Musical Instruments",
  "Books & Manuscripts",
  "Furniture",
  "Sports & Gear",
  "Home & Living",
  "Industrial Equipment",
  "Luxury Goods",
  "Agriculture & Livestock",
  "Tools & Hardware",
  "Ceramics & Pottery",
  "Carpets & Rugs",
  "Coins & Currency",
  "Watches & Timepieces",
  "Photography",
  "Sculptures",
  "Paintings",
  "Textbooks & Academic",
  "Outdoor & Adventure",
  "Health & Wellness",
  "Office Supplies",
  "Children & Toys",
  "Cultural Heritage",
  "Religious Items",
  "Digital Assets",
];

interface AdminAuctionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: {
    title?: string;
    description?: string;
    startingPrice?: number;
    category?: string;
    endsAt?: string;
    status?: string;
    isFeatured?: boolean;
    imageUrls?: string[];
  };
  editMode?: boolean;
  auctionId?: string;
}

export default function AdminAuctionForm({
  onSuccess,
  onCancel,
  initialData,
  editMode = false,
  auctionId,
}: AdminAuctionFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAuctionFormData & { status?: string; isFeatured?: boolean }>({
    resolver: zodResolver(
      createAuctionSchema.extend({
        status: createAuctionSchema.shape.status.optional(),
        isFeatured: createAuctionSchema.shape.isFeatured.optional(),
      })
    ),
defaultValues: {
       title: initialData?.title || "",
       description: initialData?.description || "",
       startingPrice: initialData?.startingPrice || 1,
       category: (initialData?.category || "Art") as "Art",
       endsAt: initialData?.endsAt || "",
       status: (initialData?.status || "upcoming") as "upcoming",
       isFeatured: initialData?.isFeatured || false,
       imageUrls: initialData?.imageUrls || [],
     },
  });

  const [status, setStatus] = useState<{ message: string; type: "success" | "error" | null } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    (initialData?.imageUrls || []).map((url) => imageUrl(url))
  );
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

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
    setStatus(null);

    const result = await handleCreateAuction({
      title: data.title,
      description: data.description,
      startingPrice: data.startingPrice,
      category: data.category as "Art",
      endsAt: data.endsAt,
      imageUrls: imagePreviews.length > 0 ? imagePreviews : undefined,
      status: data.status as "upcoming",
      isFeatured: data.isFeatured,
    });

    if (result.success) {
      setStatus({ message: "Auction created successfully", type: "success" });
      reset();
      setImagePreviews([]);
      onSuccess?.();
      if (!editMode) {
        setTimeout(() => router.push("/admin/auctions"), 1000);
      }
    } else {
      setStatus({ message: result.message || "Failed to create auction", type: "error" });
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-white/50 p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
        {editMode ? "Edit Auction" : "Create New Auction"}
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        {editMode ? "Update auction details and settings" : "Fill in the details below to list your item for auction."}
      </p>

      {status && (
        <div className={`p-4 rounded-xl mb-6 border-2 ${
          status.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <p className="text-sm font-bold">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-slate-800 mb-2">Title</label>
          <input
            id="title"
            type="text"
            {...register("title")}
            placeholder="Auction title"
            disabled={isSubmitting || uploading}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
          {errors.title && <span className="text-xs text-red-600 mt-1.5 font-medium">{errors.title.message}</span>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-bold text-slate-800 mb-2">Description</label>
          <textarea
            id="description"
            {...register("description")}
            placeholder="Item description"
            rows={4}
            disabled={isSubmitting || uploading}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
          {errors.description && <span className="text-xs text-red-600 mt-1.5 font-medium">{errors.description.message}</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="startingPrice" className="block text-sm font-bold text-slate-800 mb-2">Starting Price (₹)</label>
            <input
              id="startingPrice"
              type="number"
              {...register("startingPrice", { valueAsNumber: true })}
              placeholder="0"
              step="1"
              min="1"
              disabled={isSubmitting || uploading}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
            {errors.startingPrice && <span className="text-xs text-red-600 mt-1.5 font-medium">{errors.startingPrice.message}</span>}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-bold text-slate-800 mb-2">Category</label>
            <select
              id="category"
              {...register("category")}
              disabled={isSubmitting || uploading}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">Select category</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="text-xs text-red-600 mt-1.5 font-medium">{errors.category.message}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="endsAt" className="block text-sm font-bold text-slate-800 mb-2">End Date (optional)</label>
            <input
              id="endsAt"
              type="datetime-local"
              {...register("endsAt")}
              disabled={isSubmitting || uploading}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
            {errors.endsAt && <span className="text-xs text-red-600 mt-1.5 font-medium">{errors.endsAt.message}</span>}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-bold text-slate-800 mb-2">Status</label>
            <select
              id="status"
              {...register("status")}
              disabled={isSubmitting || uploading}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="isFeatured"
            type="checkbox"
            {...register("isFeatured")}
            disabled={isSubmitting || uploading}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label htmlFor="isFeatured" className="text-sm font-bold text-slate-700">Featured listing</label>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={isSubmitting || uploading}
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:transition-all cursor-pointer"
          />
          {uploading && <span className="text-xs text-indigo-600 mt-1.5 font-medium">Uploading...</span>}
          {uploadError && <span className="text-xs text-red-600 mt-1.5 font-medium">{uploadError}</span>}
        </div>

        {[...imagePreviews, ...pendingFiles].length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {imagePreviews.map((url, idx) => (
              <div key={`uploaded-${idx}`} className="relative group">
                <Image src={url} alt={`Image ${idx + 1}`} width={200} height={96} className="w-full h-24 object-cover rounded-xl border border-white/50" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  aria-label="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            {pendingFiles.map((file, idx) => (
              <div key={`pending-${idx}`} className="relative">
                <div className="w-full h-24 rounded-xl border-2 border-dashed border-white/50 flex items-center justify-center bg-white/30">
                  <span className="text-xs text-slate-500 px-2 text-center truncate font-medium">{file.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="btn-primary flex-1 py-3.5 px-4 text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (editMode ? "Updating..." : "Creating...") : (editMode ? "Update Auction" : "Create Auction")}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || uploading}
              className="btn-outline px-6 py-3 rounded-xl"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}