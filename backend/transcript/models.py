from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Transcript(models.Model):
    VISIBILITY_CHOICES = [
        ('PRIVATE', 'Private'),
        ('PUBLIC', 'Public'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    youtube_url = models.URLField()
    video_id = models.CharField(max_length=100, blank=True, null=True)
    title = models.CharField(max_length=500, blank=True, null=True)
    channel_name = models.CharField(max_length=500, blank=True, null=True)
    thumbnail_url = models.URLField(blank=True, null=True)
    duration = models.CharField(max_length=20, blank=True, null=True)
    publish_date = models.DateField(blank=True, null=True)
    transcript = models.TextField()
    summary = models.TextField()
    highlights = models.JSONField(blank=True, null=True)
    key_moments = models.JSONField(blank=True, null=True)
    topics = models.JSONField(blank=True, null=True)
    quotes = models.JSONField(blank=True, null=True)
    sentiment = models.CharField(max_length=100, blank=True, null=True)
    host_name = models.CharField(max_length=500, blank=True, null=True)
    guest_name = models.CharField(max_length=500, blank=True, null=True)
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='PRIVATE')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transcript for {self.youtube_url}"

    @property
    def likes_count(self):
        return self.likes.count()

    @property
    def comments_count(self):
        return self.comments.count()

    @property
    def shares_count(self):
        return self.shares.count()

    @property
    def favorites_count(self):
        return self.favorites.count()


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    transcript = models.ForeignKey(Transcript, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'transcript')

    def __str__(self):
        return f"{self.user.username} liked {self.transcript.title}"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    transcript = models.ForeignKey(Transcript, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.transcript.title}"


class Share(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    transcript = models.ForeignKey(Transcript, on_delete=models.CASCADE, related_name='shares')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} shared {self.transcript.title}"


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    transcript = models.ForeignKey(Transcript, on_delete=models.CASCADE, related_name='favorites')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'transcript')

    def __str__(self):
        return f"{self.user.username} favorited {self.transcript.title}"
