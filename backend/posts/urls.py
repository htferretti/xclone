from django.urls import path
from .views import PostListCreate, PostDetail, PostsByUser, LikePost, UnlikePost, LikedPosts, CommentListCreateView

urlpatterns = [
    path('', PostListCreate.as_view()),
    path('<int:pk>/', PostDetail.as_view()),
    path('user/<str:username>/', PostsByUser.as_view()),
    path('<int:pk>/like/', LikePost.as_view()),
    path('<int:pk>/unlike/', UnlikePost.as_view()),
    path('liked/', LikedPosts.as_view()),
    path('<int:post_id>/comments/', CommentListCreateView.as_view(), name='post-comments'),
]
