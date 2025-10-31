# Transcript-Generate

# YouTube Transcript Generator

A comprehensive web application that generates transcripts from YouTube videos, provides AI-powered summaries, highlights, key moments, topics, quotes, and sentiment analysis. Users can create accounts, manage subscriptions, and share transcripts publicly with social features like likes, comments, and favorites.

## Problem Solved

Many YouTube videos lack transcripts or have inaccurate auto-generated ones. Content creators, researchers, and viewers need accurate transcripts for accessibility, content analysis, and quick reference. This application solves this by:

- Automatically generating transcripts from YouTube videos
- Providing AI-powered analysis including summaries, highlights, and key insights
- Offering a platform for users to share and discover transcripts
- Implementing subscription-based access for unlimited usage
- Ensuring privacy with user authentication and visibility controls

## Features

### Core Functionality
- **Transcript Generation**: Extracts transcripts from YouTube videos using official APIs or AI transcription
- **AI Analysis**: Uses Google Gemini AI to generate:
  - Concise summaries
  - Key highlights as bullet points
  - Key moments with timestamps
  - Main topics discussed
  - Notable quotes
  - Overall sentiment analysis
  - Host and guest identification
- **Video Metadata**: Fetches title, channel name, thumbnail, duration, and publish date

### User Management
- **Authentication**: JWT-based authentication with email verification
- **Password Management**: Forgot/reset password functionality
- **User Profiles**: Custom user model with email and username

### Social Features
- **Public Feed**: Share transcripts publicly or keep them private
- **Interactions**: Like, comment, share, and favorite public transcripts
- **Search**: Search through public transcripts by title

### Subscription System
- **Free Tier**: Limited to 2 transcripts
- **Premium Access**: Unlimited transcripts via Stripe subscriptions
- **Payment Methods**: Manage payment methods with Stripe integration

### Technical Features
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Updates**: Dynamic UI updates for interactions
- **Error Handling**: Comprehensive error handling for API failures
- **Security**: CORS, CSRF protection, and secure API keys

## Technologies Used

### Backend
- **Django**: Web framework for Python
- **Django REST Framework**: API development
- **PostgreSQL**: Database
- **JWT**: Authentication
- **Stripe**: Payment processing
- **Google Gemini AI**: AI analysis
- **YouTube Data API**: Video metadata
- **YouTube Transcript API**: Transcript extraction
- **yt-dlp**: Audio download for transcription fallback

### Frontend
- **Next.js**: React framework
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Framer Motion**: Animations
- **React Toastify**: Notifications
- **Stripe React SDK**: Payment integration

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Python Decouple**: Environment variable management
- **Django CORS Headers**: CORS handling

## APIs Used

- **YouTube Data API v3**: Fetches video metadata (title, channel, thumbnail, duration, publish date)
- **YouTube Transcript API**: Extracts available transcripts from videos
- **Google Gemini AI API**: Powers all AI analysis features (summarization, highlights, topics, etc.)
- **Stripe API**: Handles subscriptions, payment methods, and billing

## Folder Structure

```
transcript-generator/
├── .gitignore
├── README.md
├── backend/
│   ├── .gitignore
│   ├── manage.py
│   ├── transcript_api/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── users/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   │   └── migrations/
│   └── transcript/
│       ├── __init__.py
│       ├── admin.py
│       ├── apps.py
│       ├── models.py
│       ├── serializers.py
│       ├── tests.py
│       ├── urls.py
│       └── views.py
│       └── migrations/
├── frontend/
│   ├── .gitignore
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── auth/
│   │   │   ├── forgot/
│   │   │   │   └── page.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── reset/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   │   └── verify/
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── ForgotPasswordForm.tsx
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── ResetPasswordForm.tsx
│   │   │   │   └── SignupForm.tsx
│   │   │   ├── Favorites/
│   │   │   │   └── ShowAllFavorite.tsx
│   │   │   ├── history/
│   │   │   │   └── HistoryList.tsx
│   │   │   ├── navebar/
│   │   │   │   └── NaveBar.tsx
│   │   │   ├── public-feed/
│   │   │   │   └── PublicTranscriptCard.tsx
│   │   │   ├── searching/
│   │   │   │   └── SearchField.tsx
│   │   │   ├── subscription/
│   │   │   │   ├── ConfirmationModal.tsx
│   │   │   │   ├── SubscriptionButton.tsx
│   │   │   │   └── SubscriptionModal.tsx
│   │   │   ├── summrize/
│   │   │   │   ├── DownloadButtons.tsx
│   │   │   │   ├── Page.tsx
│   │   │   │   ├── TranscriptDisplay.tsx
│   │   │   │   └── TranscriptForm.tsx
│   │   │   └── transcriptExpandedDetails/
│   │   │       └── TranscriptExpandedView.tsx
│   │   ├── favorite/
│   │   │   └── page.tsx
│   │   ├── history/
│   │   │   └── page.tsx
│   │   ├── public-feed/
│   │   │   └── page.tsx
│   │   ├── subscription/
│   │   │   └── page.tsx
│   │   └── summarizer/
│       │   └── page.tsx
│   ├── public/
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   └── src/
│       └── utils/
│           ├── api.ts
│           └── stripe.ts
```

## Installation and Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd transcript-generator/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```
   SECRET_KEY=your-secret-key
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   DATABASE_URL=postgresql://user:password@localhost:5432/transcript_generate
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   GEMINI_API_KEY=your-gemini-api-key
   YOUTUBE_API_KEY=your-youtube-api-key
   STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## Usage

1. **Access the application** at `http://localhost:3000`
2. **Sign up** for a new account or **log in** if you have one
3. **Generate transcripts** by pasting a YouTube URL and selecting visibility
4. **View results** including transcript, summary, highlights, and analysis
5. **Explore public feed** to discover and interact with other transcripts
6. **Manage subscriptions** for unlimited access via the subscription page

### API Endpoints

- `POST /api/users/signup/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/transcript/summarize/` - Generate transcript and analysis
- `GET /api/transcript/history/` - Get user's transcript history
- `GET /api/transcript/public-feed/` - Get public transcripts
- `POST /api/transcript/{id}/like/` - Like a transcript
- `POST /api/users/create-subscription/` - Create subscription

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@transcriptgenerator.com or create an issue in the repository.

<img width="1338" height="638" alt="image" src="https://github.com/user-attachments/assets/16cf333a-d4cf-4bd5-a7ee-52eed02e71ab" />
