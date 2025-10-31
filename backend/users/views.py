from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
import stripe
from django.utils import timezone

stripe.api_key = settings.STRIPE_SECRET_KEY

from .serializers import RegisterSerializer, LoginSerializer
from .models import User, Subscription, PaymentMethod


# USER REGISTRATION WITH EMAIL VERIFICATION
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save(is_active=False)
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        verify_url = f"http://localhost:3000/auth/verify?token={access_token}"

        # Send verification email
        send_mail(
            subject="Verify your email",
            message=f"Hello {user.username},\n\nPlease verify your account using the link below:\n{verify_url}\n\nThank you!",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            fail_silently=False,
        )
        headers = self.get_success_headers(serializer.data)
        return Response({"success": True, "detail": "Registration successful. Check your email for verification."}, status=status.HTTP_201_CREATED, headers=headers)


# EMAIL VERIFICATION
class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.GET.get("token")
        if not token:
            return Response({"detail": "Token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            access_token = AccessToken(token)
            user_id = access_token["user_id"]
            user = get_object_or_404(User, id=user_id)

            if not user.is_active:
                user.is_active = True
                user.save()
                return Response({"detail": "Email verified successfully. Go to the login page."}, status=status.HTTP_200_OK)
            else:
                return Response({"detail": "Email already verified."}, status=status.HTTP_200_OK)
        except Exception as e:
            print("Email verification error:", e)
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)


# LOGIN WITH JWT TOKENS
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

            user = authenticate(request, username=user.email, password=password)
            if user is None:
                return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

            if not user.is_active:
                return Response({"error": "Please verify your email before logging in."}, status=status.HTTP_403_FORBIDDEN)

            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "message": "Login successful",
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# FORGOT PASSWORD
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if user:
            token = get_random_string(32)
            user.reset_token = token
            user.save()

            reset_url = f"http://localhost:3000/auth/reset?token={token}"

            send_mail(
                subject="Password Reset Request",
                message=f"Hello {user.username},\n\nReset your password using this link:\n{reset_url}\n\nIf you didn't request this, please ignore.",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=False,
            )

        # Always return this to avoid revealing if email exists
        return Response({"detail": "If your email exists, a reset link has been sent."}, status=status.HTTP_200_OK)


# RESET PASSWORD
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        password = request.data.get("password")

        if not token or not password:
            return Response({"detail": "Token and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(reset_token=token).first()
        if not user:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.reset_token = ""
        user.save()

        return Response({"detail": "Password reset successful."}, status=status.HTTP_200_OK)


# CREATE STRIPE SUBSCRIPTION
class CreateSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            subscription = Subscription.objects.filter(user=user).first()

            # Check if user already has an active subscription
            if subscription and subscription.is_active:
                return Response({
                    'error': 'You already have an active subscription. You cannot create a new one until it expires or is canceled.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # If subscription exists but is not active, we can create a new one
            # If no subscription exists, create one
            subscription, created = Subscription.objects.get_or_create(user=user)

            if subscription.stripe_customer_id:
                customer = stripe.Customer.retrieve(subscription.stripe_customer_id)
            else:
                customer = stripe.Customer.create(
                    email=user.email,
                    name=user.username,
                )
                subscription.stripe_customer_id = customer.id
                subscription.save()

            # Get payment method ID from request
            payment_method_id = request.data.get('payment_method_id')

            if not payment_method_id:
                return Response({'error': 'Payment method ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Attach payment method to customer
            stripe.PaymentMethod.attach(payment_method_id, customer=customer.id)

            # Save payment method details to our database
            payment_method_obj = stripe.PaymentMethod.retrieve(payment_method_id)
            card = payment_method_obj.card

            # Set as default if no default exists
            is_default = not PaymentMethod.objects.filter(user=user, is_default=True).exists()

            PaymentMethod.objects.create(
                user=user,
                stripe_payment_method_id=payment_method_id,
                card_brand=card.brand,
                last4=card.last4,
                exp_month=card.exp_month,
                exp_year=card.exp_year,
                is_default=is_default,
            )

            # Set as default payment method in Stripe
            stripe.Customer.modify(customer.id, invoice_settings={'default_payment_method': payment_method_id})

            # Create a test price
            product = stripe.Product.create(name='Premium Subscription', type='service')
            stripe_price = stripe.Price.create(
                product=product.id,
                unit_amount=2000,  # $20.00
                currency='usd',
                recurring={'interval': 'month'},
            )
            price_id = stripe_price.id

            stripe_subscription = stripe.Subscription.create(
                customer=customer.id,
                items=[{
                    'price': price_id,
                }],
                default_payment_method=payment_method_id,
            )

            subscription.stripe_subscription_id = stripe_subscription.id
            subscription.status = stripe_subscription.status
            subscription.current_period_start = timezone.now()  # Will be updated by webhook
            subscription.current_period_end = timezone.now()  # Will be updated by webhook
            subscription.canceled_at = None  # Reset cancellation status for new subscription
            subscription.save()

            # For subscriptions with default payment method, payment is processed immediately
            response_data = {
                'subscription_id': stripe_subscription.id,
                'status': stripe_subscription.status
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)





# ADD PAYMENT METHOD
class AddPaymentMethodView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            payment_method_id = request.data.get('payment_method_id')

            if not payment_method_id:
                return Response({'error': 'Payment method ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Get or create subscription to ensure customer exists
            subscription, created = Subscription.objects.get_or_create(user=user)

            if not subscription.stripe_customer_id:
                customer = stripe.Customer.create(
                    email=user.email,
                    name=user.username,
                )
                subscription.stripe_customer_id = customer.id
                subscription.save()
            else:
                customer = stripe.Customer.retrieve(subscription.stripe_customer_id)

            # Attach payment method to customer
            stripe.PaymentMethod.attach(payment_method_id, customer=customer.id)

            # Save payment method details to our database
            payment_method_obj = stripe.PaymentMethod.retrieve(payment_method_id)
            card = payment_method_obj.card

            # Set as default if no default exists
            is_default = not PaymentMethod.objects.filter(user=user, is_default=True).exists()

            PaymentMethod.objects.create(
                user=user,
                stripe_payment_method_id=payment_method_id,
                card_brand=card.brand,
                last4=card.last4,
                exp_month=card.exp_month,
                exp_year=card.exp_year,
                is_default=is_default,
            )

            return Response({'message': 'Payment method added successfully'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# LIST PAYMENT METHODS
class ListPaymentMethodsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            payment_methods = PaymentMethod.objects.filter(user=user).order_by('-is_default', '-created_at')

            data = []
            for pm in payment_methods:
                data.append({
                    'id': pm.id,
                    'stripe_payment_method_id': pm.stripe_payment_method_id,
                    'card_brand': pm.card_brand,
                    'last4': pm.last4,
                    'exp_month': pm.exp_month,
                    'exp_year': pm.exp_year,
                    'is_default': pm.is_default,
                    'created_at': pm.created_at,
                })

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# GET SUBSCRIPTION STATUS
class SubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            subscription = Subscription.objects.filter(user=user).first()

            if not subscription:
                return Response({'status': 'inactive'}, status=status.HTTP_200_OK)

            data = {
                'status': subscription.status,
                'current_period_start': subscription.current_period_start,
                'current_period_end': subscription.current_period_end,
                'canceled_at': subscription.canceled_at,
                'is_active': subscription.is_active,
            }

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# CANCEL SUBSCRIPTION
class CancelSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            subscription = Subscription.objects.filter(user=user).first()

            if not subscription or not subscription.stripe_subscription_id:
                return Response({'error': 'No active subscription found'}, status=status.HTTP_400_BAD_REQUEST)

            # Cancel the subscription in Stripe
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                cancel_at_period_end=True
            )

            # Update local database
            subscription.canceled_at = timezone.now()
            subscription.save()

            return Response({'message': 'Subscription will be canceled at the end of the current period'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# STRIPE WEBHOOK HANDLER
class StripeWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

        # Handle the event
        if event['type'] == 'customer.subscription.created':
            subscription_data = event['data']['object']
            self.handle_subscription_created(subscription_data)
        elif event['type'] == 'customer.subscription.updated':
            subscription_data = event['data']['object']
            self.handle_subscription_updated(subscription_data)
        elif event['type'] == 'customer.subscription.deleted':
            subscription_data = event['data']['object']
            self.handle_subscription_deleted(subscription_data)

        return Response({'status': 'success'}, status=status.HTTP_200_OK)

    def handle_subscription_created(self, subscription_data):
        stripe_subscription_id = subscription_data['id']
        customer_id = subscription_data['customer']

        try:
            subscription = Subscription.objects.get(stripe_customer_id=customer_id)
            subscription.stripe_subscription_id = stripe_subscription_id
            subscription.status = subscription_data['status']
            subscription.current_period_start = timezone.make_aware(timezone.datetime.fromtimestamp(subscription_data['current_period_start']))
            subscription.current_period_end = timezone.make_aware(timezone.datetime.fromtimestamp(subscription_data['current_period_end']))
            subscription.save()
        except Subscription.DoesNotExist:
            pass  # Handle case where subscription doesn't exist yet

    def handle_subscription_updated(self, subscription_data):
        stripe_subscription_id = subscription_data['id']

        try:
            subscription = Subscription.objects.get(stripe_subscription_id=stripe_subscription_id)
            subscription.status = subscription_data['status']
            subscription.current_period_start = timezone.make_aware(timezone.datetime.fromtimestamp(subscription_data['current_period_start']))
            subscription.current_period_end = timezone.make_aware(timezone.datetime.fromtimestamp(subscription_data['current_period_end']))

            # Handle cancellation
            if subscription_data.get('cancel_at_period_end'):
                subscription.canceled_at = timezone.now()
            else:
                subscription.canceled_at = None

            subscription.save()
        except Subscription.DoesNotExist:
            pass

    def handle_subscription_deleted(self, subscription_data):
        stripe_subscription_id = subscription_data['id']

        try:
            subscription = Subscription.objects.get(stripe_subscription_id=stripe_subscription_id)
            subscription.status = 'canceled'
            subscription.save()
        except Subscription.DoesNotExist:
            pass
