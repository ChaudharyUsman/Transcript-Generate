from django.urls import path
from .views import RegisterView, VerifyEmailView, LoginView, ForgotPasswordView, ResetPasswordView, CreateSubscriptionView, StripeWebhookView, AddPaymentMethodView, ListPaymentMethodsView, SubscriptionStatusView, CancelSubscriptionView

urlpatterns = [
    path("signup/", RegisterView.as_view(), name="signup"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("login/", LoginView.as_view(), name="login"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path("create-subscription/", CreateSubscriptionView.as_view(), name="create-subscription"),

    path("add-payment-method/", AddPaymentMethodView.as_view(), name="add-payment-method"),
    path("payment-methods/", ListPaymentMethodsView.as_view(), name="list-payment-methods"),
    path("subscription-status/", SubscriptionStatusView.as_view(), name="subscription-status"),
    path("cancel-subscription/", CancelSubscriptionView.as_view(), name="cancel-subscription"),
    path("stripe-webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
