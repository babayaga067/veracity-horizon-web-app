"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { handleRequestPasswordReset } from "@/app/lib/actions/auth-actions";
import { useToast } from "@/app/(auth)/_components/Toast";

export const RequestPasswordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type RequestPasswordResetDTO = z.infer<typeof RequestPasswordResetSchema>;

export default function ForgetForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RequestPasswordResetDTO>({
    resolver: zodResolver(RequestPasswordResetSchema)
  });
  const { addToast } = useToast();

  const onSubmit = async (data: RequestPasswordResetDTO) => {
    try {
      const response = await handleRequestPasswordReset(data.email);
      if (response.success) {
        addToast(response.message || "Password reset link sent to your email.", "success");
        if (onSuccess) onSuccess();
      } else {
        addToast(response.message || "Failed to request password reset.", "error");
      }
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to request password reset.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-bold text-slate-800 mb-2">Email Address</label>
        <input id="email" type="email" {...register("email")} placeholder="you@example.com" disabled={isSubmitting} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed" />
        {errors.email && <span className="text-xs text-red-600 mt-1.5 font-medium">{errors.email.message}</span>}
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center py-3.5 px-4 text-base font-bold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-4">
        {isSubmitting ? "Sending..." : "Send Reset Link"}
      </button>
    </form>
  );
}
