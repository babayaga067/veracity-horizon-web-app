"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "@/app/lib/schemas/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState("collector");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    const finalPayload = { ...data, role: activeRole };
    console.log("Registering:", finalPayload);
    
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827] flex flex-col justify-between font-sans antialiased">
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="font-bold text-xl tracking-tight">Veracity Horizon</div>
        <div className="flex items-center space-x-4 text-sm font-medium">
          <Link href="/login" className="text-gray-500 hover:text-gray-900">Log In</Link>
          <Link href="/register" className="bg-[#111827] text-white text-xs px-4 py-2 rounded font-semibold">Register</Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 flex flex-col items-center">
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12">
          
          <div className="text-center max-w-xl mx-auto mb-10">
            <h1 className="text-3xl font-semibold tracking-tight">Create Institutional Account</h1>
            <p className="mt-2 text-sm text-gray-400">Begin your journey into the worlds most transparent asset ecosystem.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-4">Select Your Professional Role</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "collector", label: "Collector", desc: "Manage your private or corporate portfolio.", icon: "💼" },
                  { id: "auction_house", label: "Auction House", desc: "List assets with built-in provenance.", icon: "🔨" },
                  { id: "appraiser", label: "Appraiser", desc: "Provide high-fidelity valuations.", icon: "🛡️" }
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setActiveRole(role.id)}
                    className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      activeRole === role.id ? "border-blue-600 bg-blue-50/20 ring-1 ring-blue-600" : "border-gray-100 bg-white"
                    }`}
                  >
                    <span className="text-lg mb-3 block">{role.icon}</span>
                    <div>
                      <h4 className="font-semibold text-sm">{role.label}</h4>
                      <p className="text-xs text-gray-400 mt-1">{role.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <label className="block text-xs uppercase tracking-wider font-bold text-gray-400">Step 1: Entity Details</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Full Name</label>
                  <input
                    type="text"
                    placeholder="Authorized Representative"
                    {...register("fullName")}
                    className="mt-1 block w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                  />
                  {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500">Institutional Email</label>
                  <input
                    type="email"
                    placeholder="name@organization.com"
                    {...register("email")}
                    className="mt-1 block w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500">Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  {...register("password")}
                  className="mt-1 block w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-gray-900 transition-colors"
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-start">
                <input
                  id="agreeToTerms"
                  type="checkbox"
                  {...register("agreeToTerms")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="agreeToTerms" className="ml-3 text-xs leading-relaxed text-gray-500">
                  I agree to the <Link href="#" className="text-gray-900 underline">Provenance Protocol</Link>, ensuring all asset listings meet transparency standards.
                </label>
              </div>
              {errors.agreeToTerms && <p className="mt-2 text-xs text-red-500">{errors.agreeToTerms.message}</p>}
            </div>

            <div className="text-center space-y-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-black hover:bg-gray-900 text-white font-medium text-xs tracking-wider uppercase px-8 py-3.5 rounded transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Account →"}
              </button>
              
              <p className="text-xs text-gray-400">
                Already an institutional member?{" "}
                <Link href="/login" className="font-semibold text-blue-600 hover:underline">Sign In</Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}