let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
while (/\/api(\/)?$/.test(API_BASE_URL)) {
  API_BASE_URL = API_BASE_URL.replace(/\/api(\/)?$/, '');
}
API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + '/';

interface SignupData {
  username: string;
  email: string;
  password: string;
}

export async function signup(data: SignupData) {
  return fetch(`${API_BASE_URL}api/users/signup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.json());
}

export async function login(data: { email: string; password: string }) {
  return fetch(`${API_BASE_URL}api/users/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.json());
}

export async function verifyEmail(token: string) {
  return fetch(`${API_BASE_URL}api/users/verify-email/?token=${token}`)
    .then(res => res.json());
}

export async function forgotPassword(email: string) {
  return fetch(`${API_BASE_URL}api/users/forgot-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  }).then(res => res.json());
}

export async function resetPassword(token: string, password: string) {
  return fetch(`${API_BASE_URL}api/users/reset-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  }).then(res => res.json());
}

export async function summarize(youtubeUrl: string, visibility: string = 'PRIVATE'): Promise<{
  id: number;
  video_id?: string;
  title?: string;
  channel_name?: string;
  thumbnail_url?: string;
  duration?: string;
  publish_date?: string;
  transcript: string;
  summary: string;
  highlights?: string[];
  key_moments?: { timestamp: string; moment: string }[];
  topics?: string[];
  quotes?: string[];
  sentiment?: string;
  host_name?: string;
  guest_name?: string;
  error?: string;
}> {
  const token = localStorage.getItem('access_token');
  return fetch(`${API_BASE_URL}api/transcript/summarize/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ youtube_url: youtubeUrl, visibility }),
  }).then(res => res.json());
}

export async function fetchHistory(): Promise<{
  id: number;
  video_id?: string;
  title?: string;
  channel_name?: string;
  thumbnail_url?: string;
  duration?: string;
  publish_date?: string;
  transcript: string;
  summary: string;
  highlights?: string[];
  key_moments?: { timestamp: string; moment: string }[];
  topics?: string[];
  quotes?: string[];
  sentiment?: string;
  host_name?: string;
  guest_name?: string;
  created_at: string;
}[]> {
  const token = localStorage.getItem('access_token');
  return fetch(`${API_BASE_URL}api/transcript/history/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }).then(res => res.json());
}

export async function deleteHistory(transcriptId: number): Promise<{ message?: string; error?: string }> {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE_URL}api/transcript/history/${transcriptId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.ok) {
    return { message: 'Transcript deleted successfully' };
  } else {
    const errorData = await response.json().catch(() => ({ error: 'Failed to delete transcript' }));
    return errorData;
  }
}

export async function fetchPublicFeed(): Promise<{
  id: number;
  video_id?: string;
  title?: string;
  channel_name?: string;
  thumbnail_url?: string;
  duration?: string;
  publish_date?: string;
  transcript: string;
  summary: string;
  highlights?: string[];
  key_moments?: { timestamp: string; moment: string }[];
  topics?: string[];
  quotes?: string[];
  sentiment?: string;
  host_name?: string;
  guest_name?: string;
  visibility?: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  favorites_count?: number;
  is_liked?: boolean;
  is_favorited?: boolean;
}[]> {
  const token = localStorage.getItem('access_token');
  return fetch(`${API_BASE_URL}api/transcript/public-feed/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }).then(res => res.json());
}

export async function fetchPublicFeedWithoutAuth(): Promise<{
  id: number;
  video_id?: string;
  title?: string;
  channel_name?: string;
  thumbnail_url?: string;
  duration?: string;
  publish_date?: string;
  transcript: string;
  summary: string;
  highlights?: string[];
  key_moments?: { timestamp: string; moment: string }[];
  topics?: string[];
  quotes?: string[];
  sentiment?: string;
  host_name?: string;
  guest_name?: string;
  visibility?: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  favorites_count?: number;
  is_liked?: boolean;
  is_favorited?: boolean;
}[]> {
  return fetch(`${API_BASE_URL}api/transcript/public-feed/`, {
    method: 'GET',
  }).then(res => res.json());
}

export async function likeTranscript(transcriptId: number): Promise<{ message?: string; error?: string }> {
  const token = localStorage.getItem('access_token');
  try {
    const response = await fetch(`${API_BASE_URL}api/transcript/${transcriptId}/like/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return await response.json();
    } else {
      return { error: 'Failed to like transcript' };
    }
  } catch (error) {
    return { error: 'Network error' };
  }
}

export async function unlikeTranscript(transcriptId: number): Promise<{ message?: string; error?: string }> {
  const token = localStorage.getItem('access_token');
  try {
    const response = await fetch(`${API_BASE_URL}api/transcript/${transcriptId}/unlike/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      if (response.status === 204) {
        return { message: 'Unliked successfully' };
      }
      return await response.json();
    } else {
      return { error: 'Failed to unlike transcript' };
    }
  } catch (error) {
    return { error: 'Network error' };
  }
}

export async function favoriteTranscript(transcriptId: number): Promise<{ message?: string; error?: string }> {
  const token = localStorage.getItem('access_token');
  try {
    const response = await fetch(`${API_BASE_URL}api/transcript/${transcriptId}/favorite/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return await response.json();
    } else {
      return { error: 'Failed to favorite transcript' };
    }
  } catch (error) {
    return { error: 'Network error' };
  }
}

export async function unfavoriteTranscript(transcriptId: number): Promise<{ message?: string; error?: string }> {
  const token = localStorage.getItem('access_token');
  try {
    const response = await fetch(`${API_BASE_URL}api/transcript/${transcriptId}/unfavorite/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      if (response.status === 204) {
        return { message: 'Unfavorited successfully' };
      }
      return await response.json();
    } else {
      return { error: 'Failed to unfavorite transcript' };
    }
  } catch (error) {
    return { error: 'Network error' };
  }
}

export async function shareTranscript(transcriptId: number): Promise<{ message?: string; error?: string }> {
  const token = localStorage.getItem('access_token');
  try {
    const response = await fetch(`${API_BASE_URL}api/transcript/${transcriptId}/share/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return await response.json();
    } else {
      return { error: 'Failed to share transcript' };
    }
  } catch (error) {
    return { error: 'Network error' };
  }
}

export async function addComment(transcriptId: number, text: string): Promise<{ message?: string; error?: string }> {
  const token = localStorage.getItem('access_token');
  try {
    const response = await fetch(`${API_BASE_URL}api/transcript/${transcriptId}/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
    if (response.ok) {
      return await response.json();
    } else {
      return { error: 'Failed to add comment' };
    }
  } catch (error) {
    return { error: 'Network error' };
  }
}

export async function fetchComments(transcriptId: number): Promise<{
  id: number;
  user_username: string;
  text: string;
  created_at: string;
}[]> {
  const token = localStorage.getItem('access_token');
  try {
    const response = await fetch(`${API_BASE_URL}api/transcript/${transcriptId}/comments/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return await response.json();
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}

export async function fetchFavorites(): Promise<{
  id: number;
  video_id?: string;
  title?: string;
  channel_name?: string;
  thumbnail_url?: string;
  duration?: string;
  publish_date?: string;
  transcript: string;
  summary: string;
  highlights?: string[];
  key_moments?: { timestamp: string; moment: string }[];
  topics?: string[];
  quotes?: string[];
  sentiment?: string;
  host_name?: string;
  guest_name?: string;
  visibility?: string;
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  favorites_count?: number;
  is_liked?: boolean;
  is_favorited?: boolean;
}[]> {
  const token = localStorage.getItem('access_token');
  return fetch(`${API_BASE_URL}api/transcript/favorites/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }).then(res => res.json());
}

export async function updateTranscriptVisibility(transcriptId: number, visibility: string): Promise<{ message?: string; error?: string }> {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE_URL}api/transcript/history/${transcriptId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ visibility }),
  });
  return response.json();
}

export async function createSubscription(paymentMethodId?: string): Promise<{ client_secret?: string; subscription_id?: string; status?: string; error?: string }> {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE_URL}api/users/create-subscription/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ payment_method_id: paymentMethodId }),
  });
  return response.json();
}



export async function addPaymentMethod(paymentMethodId: string): Promise<{ message?: string; error?: string }> {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE_URL}api/users/add-payment-method/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ payment_method_id: paymentMethodId }),
  });
  return response.json();
}

export async function listPaymentMethods(): Promise<{
  id: number;
  stripe_payment_method_id: string;
  card_brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  created_at: string;
}[]> {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE_URL}api/users/payment-methods/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
}

export async function getSubscriptionStatus(): Promise<{
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  canceled_at?: string;
  is_active: boolean;
  error?: string;
}> {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE_URL}api/users/subscription-status/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
}

export async function cancelSubscription(): Promise<{ message?: string; error?: string }> {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE_URL}api/users/cancel-subscription/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
}

