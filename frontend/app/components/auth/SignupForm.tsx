"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "../../../src/utils/api";
import {
  User,
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";

export default function SignupForm() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signup(form);
    setLoading(false);
    if (res.success) {
      setShowVerificationMessage(true);
      toast.success("Registration successful! Check your email for verification.");
    } else {
      toast.error(res.detail || "Registration failed.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full from-gray-950 to-gray-900 px-4">
      <div className="flex flex-col md:flex-row items-stretch w-full max-w-5xl bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* LEFT SIDE - SIGNUP FORM */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <User className="w-6 h-6 text-blue-500" /> Create Your Account
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Join us to access your transcript dashboard
          </p>
        </div>

        {showVerificationMessage ? (
          <div className="text-center space-y-6">
            <CheckCircle2 className="mx-auto text-green-400 w-12 h-12" />
            <p className="text-green-300 text-sm">
              Please check your email and click the verification link to activate your account.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-lg font-medium transition duration-200"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Username */}
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
            </div>

            {/* Password with Eye Toggle */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-blue-400 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Signing up...
                </>
              ) : (
                "Sign Up"
              )}
            </button>



            {/* Login Link */}
            <p className="text-center text-gray-400 text-sm mt-4">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-blue-400 hover:underline font-medium"
              >
                Login
              </Link>
            </p>
          </>
        )}
          </form>
        </div>

        {/* RIGHT SIDE - BENEFITS */}
        <div className="hidden md:flex w-full md:w-1/2 flex-col justify-center bg-gradient-to-br from-blue-700/10 via-purple-700/10 to-indigo-800/10 border-l border-gray-800 p-8 text-left">
          <h2 className="text-2xl font-bold text-blue-400 mb-5">
            Why Use Transcript Generator?
          </h2>
          <ul className="space-y-4 text-gray-300">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
              <span>AI-powered YouTube video summaries in seconds.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
              <span>Secure and private transcript storage.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
              <span>Download summaries as PDF or Word files.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
              <span>Powered by Gemini and YouTube Data APIs.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
              <span>Share and explore public transcripts.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
