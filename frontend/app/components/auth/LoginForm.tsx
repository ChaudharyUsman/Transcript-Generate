"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "../../../src/utils/api";
import {
  Mail,
  Lock,
  Loader2,
  LogIn,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login({ email: form.username, password: form.password });
    setLoading(false);

    if (res.access) {
      localStorage.setItem("access_token", res.access);
      localStorage.setItem("refresh_token", res.refresh);
      toast.success("Login successful!");
      router.push("/public-feed");
    } else {
      toast.error(res.error || "Login failed.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full from-gray-950 to-gray-900 px-4">
      <div className="flex flex-col md:flex-row items-stretch w-full max-w-5xl bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* LEFT SIDE - LOGIN FORM */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <LogIn className="w-6 h-6 text-blue-500" /> Login to Your Account
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Access your video transcript dashboard
              </p>
            </div>

            {/* Username Field */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Email address"
                className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> Login
                </>
              )}
            </button>

            {/* Links */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-400 gap-2">
              <Link href="/auth/forgot" className="hover:text-blue-400 transition">
                Forgot password?
              </Link>
              <span>
                Not registered?{" "}
                <Link href="/auth/signup" className="text-blue-400 hover:underline">
                  Sign up
                </Link>
              </span>
            </div>
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
