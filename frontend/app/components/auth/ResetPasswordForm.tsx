"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "../../../src/utils/api";
import { Lock, Loader2, Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "react-toastify";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or expired token.");
      return;
    }
    setLoading(true);
    const res = await resetPassword(token, password);
    setLoading(false);
    if (res.detail && res.detail.toLowerCase().includes("success")) {
      toast.success("Password reset successfully!");
      setIsResetSuccessful(true);
    } else {
      toast.error(res.detail || "Password reset failed.");
    }
  };

  if (isResetSuccessful) {
    return (
      <div className="flex items-center justify-center min-h-screen  from-blue-600 via-indigo-700 to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-black px-4">
        <div className="w-full max-w-md bg-white/10 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-300/20 dark:border-gray-700/30 p-8 rounded-2xl shadow-2xl space-y-6 text-center">
          <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
            <KeyRound className="w-7 h-7 text-green-400" /> Password Reset Successful
          </h2>
          <p className="text-gray-300 text-sm">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen from-blue-600 via-indigo-700 to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-black px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/10 dark:bg-gray-800/60 backdrop-blur-lg border border-gray-300/20 dark:border-gray-700/30 p-8 rounded-2xl shadow-2xl space-y-6"
      >
        {/* Title */}
        <div className="text-center mb-2">
          <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
            <KeyRound className="w-7 h-7 text-blue-400" /> Reset Password
          </h2>
          <p className="text-gray-300 text-sm mt-2">
            Enter your new password to regain access
          </p>
        </div>

        {/* Password Field with Eye Toggle */}
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-300" size={18} />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-transparent border border-gray-400/30 focus:ring-2 focus:ring-blue-400 focus:outline-none text-white placeholder-gray-300"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-300 hover:text-blue-400 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-all duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}
