"use client";

import { useForm } from "react-hook-form";
import { registerSchema, RegisterFormData } from "@/app/(auth)/_components/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { handleRegisterUser } from "@/app/lib/actions/auth-actions";
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "@/app/(auth)/_components/EyeIcon";

export default function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    setError("");
    startTransition(async () => {
      try {
        const result = await handleRegisterUser(data);
        if (result.success) {
          router.push("/login");
        } else {
          setError(result.message || "Registration failed. Please review your information.");
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected network error occurred. Please try again.");
        }
      }
    });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="firstName" className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
            <input
              id="firstName"
              type="text"
              {...register("firstName")}
              placeholder="Legal first name"
              disabled={isPending || isSubmitting}
              className={`w-full px-4 py-3.5 rounded-xl border ${errors.firstName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} bg-white/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed`}
            />
            {errors.firstName && <span className="text-xs text-red-600 font-medium mt-1.5 block">{errors.firstName.message}</span>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
            <input
              id="lastName"
              type="text"
              {...register("lastName")}
              placeholder="Legal last name"
              disabled={isPending || isSubmitting}
              className={`w-full px-4 py-3.5 rounded-xl border ${errors.lastName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} bg-white/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed`}
            />
            {errors.lastName && <span className="text-xs text-red-600 font-medium mt-1.5 block">{errors.lastName.message}</span>}
          </div>
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-bold text-slate-700 mb-2">Bidder Username</label>
          <input
            id="username"
            type="text"
            {...register("username")}
            placeholder="Unique username"
            disabled={isPending || isSubmitting}
            className={`w-full px-4 py-3.5 rounded-xl border ${errors.username ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} bg-white/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed`}
          />
          {errors.username && <span className="text-xs text-red-600 font-medium mt-1.5 block">{errors.username.message}</span>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
          <input
            id="email"
            type="email"
            {...register("email")}
            placeholder="you@example.com"
            disabled={isPending || isSubmitting}
            className={`w-full px-4 py-3.5 rounded-xl border ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} bg-white/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed`}
          />
          {errors.email && <span className="text-xs text-red-600 font-medium mt-1.5 block">{errors.email.message}</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
                disabled={isPending || isSubmitting}
                className={`w-full pl-4 pr-10 py-3.5 rounded-xl border ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} bg-white/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <span className="text-xs text-red-600 font-medium mt-1.5 block">{errors.password.message}</span>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="••••••••"
                disabled={isPending || isSubmitting}
                className={`w-full pl-4 pr-10 py-3.5 rounded-xl border ${errors.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} bg-white/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirmPassword && <span className="text-xs text-red-600 font-medium mt-1.5 block">{errors.confirmPassword.message}</span>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className="btn-primary w-full flex items-center justify-center py-3.5 px-4 text-base font-bold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-6"
        >
          {isPending || isSubmitting ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating Profile...</span>
            </div>
          ) : (
            <span>Complete Registration</span>
          )}
        </button>

        <div className="pt-4 text-center text-slate-600">
          Already have a bidder account?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
            Sign in here
          </Link>
        </div>

      </form>
    </div>
  );
}
