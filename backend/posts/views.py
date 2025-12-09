from rest_framework import generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import Post, Like, Comment
from .serializers import PostSerializer, CommentSerializer
class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post_id=post_id).order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, post_id=self.kwargs['post_id'])


class PostListCreate(generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by('-published_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class PostDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        # ensure author is preserved
        serializer.save(author=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class PostsByUser(generics.ListAPIView):
    """Fetch all posts by a specific user (by username)."""
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        username = self.kwargs['username']
        user = get_object_or_404(User, username=username)
        return Post.objects.filter(author=user).order_by('-published_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class LikePost(generics.CreateAPIView):
    """Like a post."""
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, pk=None):
        post = get_object_or_404(Post, pk=pk)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        
        if created:
            return Response({'detail': f'You liked this post'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'detail': 'You already liked this post'}, status=status.HTTP_200_OK)


class UnlikePost(generics.CreateAPIView):
    """Unlike a post."""
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, pk=None):
        post = get_object_or_404(Post, pk=pk)
        deleted_count, _ = Like.objects.filter(user=request.user, post=post).delete()
        
        if deleted_count > 0:
            return Response({'detail': 'You unliked this post'}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'You had not liked this post'}, status=status.HTTP_200_OK)


class LikedPosts(generics.ListAPIView):
    """Fetch all posts liked by the current user, ordered by when they were liked."""
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Order by when the user liked the post (Like.created_at), most recent first
        liked_posts = Like.objects.filter(user=self.request.user).order_by('-created_at')
        post_ids = liked_posts.values_list('post_id', flat=True)
        # Return posts in the same order as they appear in the likes
        posts = Post.objects.filter(id__in=post_ids)
        # Preserve the order from likes queryset
        from django.db.models import Case, When
        preserved_order = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(post_ids)])
        return posts.annotate(order=preserved_order).order_by('order')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
