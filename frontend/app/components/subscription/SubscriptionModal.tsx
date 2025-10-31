'use client';
import { useState, useEffect, useRef } from 'react';
import { X, CreditCard, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '../../../src/utils/stripe';
import { createSubscription, getSubscriptionStatus, cancelSubscription } from '../../../src/utils/api';
import ConfirmationModal from './ConfirmationModal';

const SubscriptionForm = ({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Create payment method
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: formData.name,
          email: formData.email,
        },
      });

      if (error) {
        toast.error(error.message || 'Payment method creation failed');
        setLoading(false);
        return;
      }

      // Call backend to create subscription
      const response = await createSubscription(paymentMethod.id);

      if (response.error) {
        toast.error(response.error);
        setLoading(false);
        return;
      }

      // If there's a client_secret, confirm the payment
      if (response.client_secret) {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(response.client_secret);
        if (confirmError) {
          toast.error(confirmError.message || 'Payment confirmation failed');
          setLoading(false);
          return;
        }
        // Check if payment was successful
        if (paymentIntent && paymentIntent.status !== 'succeeded') {
          toast.error('Payment was not successful');
          setLoading(false);
          return;
        }
      }

      toast.success('Subscription created successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('An error occurred during subscription creation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400"
          placeholder="Enter your full name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400"
          placeholder="Enter your email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Card Details</label>
        <div className="p-3 border border-gray-600 rounded-lg bg-gray-800">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
              },
            }}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
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
  );
};

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubscriptionModal({ isOpen, onClose, onSuccess }: SubscriptionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      loadSubscriptionStatus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  const loadSubscriptionStatus = async () => {
    try {
      const statusRes = await getSubscriptionStatus();
      setSubscriptionStatus(statusRes);
    } catch (error) {
      console.error('Error loading subscription status:', error);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const response = await cancelSubscription();
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Subscription will be canceled at the end of the current period.');
        loadSubscriptionStatus(); // Refresh status
        onSuccess(); // Notify parent component
      }
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isSubscribed = subscriptionStatus?.is_active;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscription-modal-title"
      onKeyDown={handleKeyDown}
      inert={!isOpen ? true : undefined}
    >
      <div
        ref={modalRef}
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-xl p-6 max-w-md w-full mx-4"
        tabIndex={-1}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id="subscription-modal-title" className="text-xl font-semibold text-white">
            Premium Subscription
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Upgrade Plan Dropdown */}
        <div className="mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition flex items-center justify-between"
          >
            <span>Upgrade Plan</span>
            {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {showDetails && (
            <div className="mt-3 bg-gray-800 p-4 rounded-lg space-y-4">
              {/* Current Plan */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Current Plan</h4>
                <p className="text-lg font-semibold text-white">
                  {isSubscribed ? 'Premium' : 'Free'}
                </p>
              </div>

              {/* Subscription Status */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Subscription Status</h4>
                <p className={`text-lg font-semibold ${isSubscribed ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isSubscribed ? 'Active' : 'Expired'}
                </p>
              </div>

              {/* Expiry Date */}
              {isSubscribed && subscriptionStatus?.current_period_end && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white">Expiry Date</h4>
                  <p className="text-white">
                    {new Date(subscriptionStatus.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Previous Subscription Records */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Previous Subscription Records</h4>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">No previous subscription history available</p>
                </div>
              </div>

              {/* Cancel Subscription */}
              {isSubscribed && (
                <div className="border-t border-gray-700 pt-4 space-y-4">
                  <h4 className="text-lg font-medium text-white">Manage Subscription</h4>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelLoading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    {cancelLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Canceling...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Cancel Subscription
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Card Details Entry */}
              {!isSubscribed && (
                <div className="border-t border-gray-700 pt-4 space-y-4">
                  <h4 className="text-lg font-medium text-white">Enter Card Details to Subscribe</h4>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">$20/month</div>
                    <p className="text-gray-300 text-sm">Unlimited transcript generations</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Generate unlimited transcripts</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Access to all premium features</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Cancel anytime</span>
                    </div>
                  </div>

                  <Elements stripe={stripePromise}>
                    <SubscriptionForm onSuccess={onSuccess} onClose={onClose} />
                  </Elements>
                </div>
              )}
            </div>
          )}
        </div>

        {isSubscribed && (
          <div className="text-center border-t border-gray-700 pt-4">
            <p className="text-gray-300 mb-4">You are already subscribed to Premium</p>
            <button
              onClick={onClose}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Close
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment processing
        </p>
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
