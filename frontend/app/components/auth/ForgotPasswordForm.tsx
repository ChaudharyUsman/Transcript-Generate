"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "../../../src/utils/api";
import { Mail, Loader2, Key } from "lucide-react";
import { toast } from "react-toastify";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      toast.success("Reset link sent to your email! Note: This link can only be used once.");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <Key className="w-6 h-6 text-blue-500" /> Forgot Your Password?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-md transition duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" /> Sending...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" /> Send Reset Link
            </>
          )}
        </button>
        <div className="text-center mt-4">
          <Link href="/auth/login" className="text-blue-600 hover:underline text-sm">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
