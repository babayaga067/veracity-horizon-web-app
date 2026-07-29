"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAuctionSchema, CreateAuctionFormData } from "@/app/(auth)/_components/schema";
import { handleCreateAuction, handleUploadAuctionImage } from "@/app/lib/actions/auth-actions";
import { imageUrl } from "@/app/lib/api/config";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { useToast } from "@/app/(auth)/_components/Toast";

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
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const { addToast } = useToast();

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
      addToast("Auction created successfully!", "success");
      reset();
      setImagePreviews([]);
      onSuccess?.();
    } else {
      setStatus({ message: result.message || "Failed to create auction", type: "error" });
      addToast(result.message || "Failed to create auction", "error");
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-white/50 p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Create New Auction</h2>
      <p className="text-slate-500 text-sm mb-6">Fill in the details below to list your item for auction.</p>

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
            <label htmlFor="startingPrice" className="block text-sm font-bold text-slate-800 mb-2">Starting Price (रु)</label>
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
              <option value="Art">Art</option>
              <option value="Electronics">Electronics</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Collectibles">Collectibles</option>
              <option value="Fashion">Fashion</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Textiles">Textiles</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Antiques">Antiques</option>
              <option value="Food & Spices">Food & Spices</option>
              <option value="Handicrafts">Handicrafts</option>
              <option value="Musical Instruments">Musical Instruments</option>
              <option value="Books & Manuscripts">Books & Manuscripts</option>
              <option value="Furniture">Furniture</option>
              <option value="Sports & Gear">Sports & Gear</option>
              <option value="Home & Living">Home & Living</option>
              <option value="Industrial Equipment">Industrial Equipment</option>
              <option value="Luxury Goods">Luxury Goods</option>
              <option value="Agriculture & Livestock">Agriculture & Livestock</option>
              <option value="Tools & Hardware">Tools & Hardware</option>
              <option value="Ceramics & Pottery">Ceramics & Pottery</option>
              <option value="Carpets & Rugs">Carpets & Rugs</option>
              <option value="Coins & Currency">Coins & Currency</option>
              <option value="Watches & Timepieces">Watches & Timepieces</option>
              <option value="Photography">Photography</option>
              <option value="Sculptures">Sculptures</option>
              <option value="Paintings">Paintings</option>
              <option value="Textbooks & Academic">Textbooks & Academic</option>
              <option value="Outdoor & Adventure">Outdoor & Adventure</option>
              <option value="Health & Wellness">Health & Wellness</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Children & Toys">Children & Toys</option>
              <option value="Cultural Heritage">Cultural Heritage</option>
              <option value="Religious Items">Religious Items</option>
              <option value="Digital Assets">Digital Assets</option>

            </select>
            {errors.category && <span className="text-xs text-red-600 mt-1.5 font-medium">{errors.category.message}</span>}
          </div>
        </div>

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
                  <Image src={imageUrl(url)!} alt={`Image ${idx + 1}`} width={200} height={96} className="w-full h-24 object-cover rounded-xl border border-white/50" />
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
            {isSubmitting ? "Creating..." : "Create Auction"}
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
