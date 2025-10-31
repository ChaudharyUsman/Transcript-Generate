"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  CreditCard,
  CheckCircle,
  X,
  Mail,
  User,
  Sparkles,
  Clock,
  Calendar,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import stripePromise from "../../src/utils/stripe";
import {
  createSubscription,
  getSubscriptionStatus,
  cancelSubscription,
} from "../../src/utils/api";
import ConfirmationModal from "../components/subscription/ConfirmationModal";
import NaveBar from "../components/navebar/NaveBar";

const SubscriptionForm = ({
  onSuccess,
  onRefresh,
}: {
  onSuccess: () => void;
  onRefresh: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: formData.name,
          email: formData.email,
        },
      });

      if (error) {
        toast.error(error.message || "Payment method creation failed");
        setLoading(false);
        return;
      }

      const response = await createSubscription(paymentMethod.id);

      if (response.error) {
        toast.error(response.error);
        setLoading(false);
        return;
      }

      toast.success("Subscription created successfully!");
      onRefresh();
      onSuccess();
    } catch (err) {
      toast.error("An error occurred during subscription creation");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-6 md:p-8 rounded-xl shadow-lg border border-gray-800">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-yellow-400 w-6 h-6" />
          <h3 className="text-xl font-semibold">Plan Benefits</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Generate unlimited transcripts",
            "Access all premium features",
            "Priority support",
          ].map((benefit, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-gray-300 text-sm"
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg px-3">
            <User className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className="w-full p-3 bg-transparent text-white outline-none placeholder-gray-500"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg px-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="w-full p-3 bg-transparent text-white outline-none placeholder-gray-500"
            />
          </div>
        </div>

        {/* Card Details */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Card Details
          </label>
          <div className="p-3 border border-gray-700 rounded-lg bg-gray-800">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#ffffff",
                    "::placeholder": { color: "#9ca3af" },
                  },
                },
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !stripe}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Subscribe Now - $20/month
            </>
          )}
        </button>
      </form>
    </div>
  );
};
export default function SubscriptionPage() {
  const router = useRouter();
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCustomExpires, setShowCustomExpires] = useState(false);
  const [customExpires, setCustomExpires] = useState<Date | null>(null);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const statusRes = await getSubscriptionStatus();
      setSubscriptionStatus(statusRes);
    } catch (error) {
      console.error("Error loading subscription status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const response = await cancelSubscription();
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success(
          "Subscription will be canceled at the end of the current period."
        );
        loadSubscriptionStatus();
      }
    } catch (error) {
      toast.error("Failed to cancel subscription");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSubscriptionSuccess = () => {
    loadSubscriptionStatus();
    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + 1);
    setCustomExpires(expires);
    setShowCustomExpires(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    );
  }

  const isSubscribed = subscriptionStatus?.is_active;

  return (
    <div className="min-h-screen  from-gray-950 to-gray-900 text-white">
      <NaveBar />
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Crown className="text-yellow-500 w-8 h-8" /> Subscription Management
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Manage your premium plan and view your billing details.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {isSubscribed ? (
            // Active Subscription
            <div className="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-xl shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  <h2 className="text-2xl font-semibold">Premium Plan</h2>
                </div>
                <div className="flex items-center gap-2">
                  {subscriptionStatus?.status === "active" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subscriptionStatus?.status === "active"
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {subscriptionStatus?.status === "active"
                      ? "Active"
                      : "Canceled"}
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 text-gray-300">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" /> Current Plan
                  </h3>
                  <p>Premium Plan - $20/month</p>
                </div>
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" /> Started On
                  </h3>
                  <p>
                    {subscriptionStatus?.current_period_start
                      ? new Date(
                          subscriptionStatus.current_period_start
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-400" /> Expires On
                  </h3>
                  <p>
                    {showCustomExpires && customExpires
                      ? customExpires.toLocaleDateString()
                      : subscriptionStatus?.current_period_end
                      ? new Date(
                          subscriptionStatus.current_period_end
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={cancelLoading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl mx-auto"
                >
                  {cancelLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Canceling...
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5" />
                      Cancel Subscription
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Inactive Subscription
            <div className="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-xl shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
                  <X className="w-6 h-6 text-red-500" />
                  No Active Subscription
                </h2>
                <p className="text-gray-300">
                  Subscribe to access premium features and generate unlimited
                  transcripts.
                </p>
                {subscriptionStatus?.status === "canceled" && (
                  <p className="text-yellow-400 text-sm mt-2 flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    Your previous subscription has expired. You can now
                    subscribe again.
                  </p>
                )}
              </div>

              <Elements stripe={stripePromise}>
                <SubscriptionForm
                  onSuccess={handleSubscriptionSuccess}
                  onRefresh={loadSubscriptionStatus}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period."
        confirmText="Yes, Cancel"
        cancelText="No, Keep Subscription"
      />
    </div>
  );
}
