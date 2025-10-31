from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SummarizeView, HistoryView, PublicFeedView, LikeView, CommentView, ShareView, FavoriteView, FavoritesListView

router = DefaultRouter()
router.register(r'history', HistoryView, basename='history')
router.register(r'public-feed', PublicFeedView, basename='public-feed')

urlpatterns = [
    path('summarize/', SummarizeView.as_view(), name='summarize'),
    path('<int:transcript_id>/like/', LikeView.as_view(), name='like'),
    path('<int:transcript_id>/unlike/', LikeView.as_view(), name='unlike'),
    path('<int:transcript_id>/share/', ShareView.as_view(), name='share'),
    path('<int:transcript_id>/favorite/', FavoriteView.as_view(), name='favorite'),
    path('<int:transcript_id>/unfavorite/', FavoriteView.as_view(), name='unfavorite'),
    path('<int:transcript_id>/comments/', CommentView.as_view({'get': 'list', 'post': 'create'}), name='comments'),
    path('favorites/', FavoritesListView.as_view(), name='favorites'),
    path('', include(router.urls)),
]
