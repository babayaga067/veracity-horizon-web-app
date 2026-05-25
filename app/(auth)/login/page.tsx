"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/app/lib/schemas/auth";


export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("collector");
  const [biometric, setBiometric] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const finalPayload = { ...data, role: activeTab, biometricEnabled: biometric };
    console.log("Logging in:", finalPayload);
    
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/dashboard"); 
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111827] flex flex-col justify-between font-sans antialiased">
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="font-bold text-xl tracking-tight">Veracity Horizon</div>
        <div className="flex items-center space-x-4 text-sm font-medium">
          <Link href="/login" className="text-gray-900">Log In</Link>
          <Link href="/register" className="bg-[#111827] text-white text-xs px-4 py-2 rounded font-semibold">Register</Link>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-xl p-8 md:p-10">
          <div className="mx-auto w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center mb-6">🛡️</div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Welcome Back</h2>
            <p className="mt-1 text-xs text-gray-400">Access the institutional portal of Veracity Horizon.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-gray-100 p-1 rounded-xl grid grid-cols-3 gap-1">
              {[
                { id: "collector", label: "Institutional Collector" },
                { id: "house", label: "Auction House" },
                { id: "appraiser", label: "Independent Appraiser" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 text-[10px] font-bold rounded-lg transition-all text-center leading-tight ${
                    activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">Email / Username</label>
              <input
                type="text"
                placeholder="Enter institutional ID"
                {...register("identifier")}
                className="mt-1.5 block w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
              />
              {errors.identifier && <p className="mt-1 text-xs text-red-500">{errors.identifier.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">Access Key</label>
                <span className="text-[10px] font-bold underline cursor-pointer">Lost Key?</span>
              </div>
              <input
                type="password"
                placeholder="••••••••••••"
                {...register("accessKey")}
                className="mt-1.5 block w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
              />
              {errors.accessKey && <p className="mt-1 text-xs text-red-500">{errors.accessKey.message}</p>}
            </div>

            <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-3">
              <span className="text-xs font-medium text-gray-600">🧬 Enable Biometric Verification</span>
              <button
                type="button"
                onClick={() => setBiometric(!biometric)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${biometric ? "bg-blue-600" : "bg-gray-200"}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${biometric ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#111827] text-white font-medium text-xs tracking-wider uppercase py-3.5 rounded-lg transition-all"
            >
              {isSubmitting ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-2">New institution?</p>
            <Link href="/register" className="inline-block border border-gray-200 bg-white px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
              📄 Request Onboarding
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}