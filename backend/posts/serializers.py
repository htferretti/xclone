from rest_framework import serializers
from .models import Post, Comment
class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    post = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'author_username', 'content', 'created_at']
        read_only_fields = ['id', 'author', 'author_username', 'created_at', 'post']


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_profile_picture = serializers.SerializerMethodField(read_only=True)
    like_count = serializers.SerializerMethodField(read_only=True)
    is_liked = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'author', 'author_username', 'author_profile_picture', 'content', 'created_at', 'published_at', 'like_count', 'is_liked']
        read_only_fields = ['author', 'created_at', 'published_at']

    def get_author_profile_picture(self, obj):
        """Get the profile picture URL of the author."""
        try:
            profile_picture = obj.author.profile.profile_picture
            if profile_picture:
                request = self.context.get('request')
                if request is not None:
                    return request.build_absolute_uri(profile_picture.url)
                return profile_picture.url
        except:
            pass
        return None

    def get_like_count(self, obj):
        """Get the total number of likes for this post."""
        return obj.likes.count()

    def get_is_liked(self, obj):
        """Check if the current user has liked this post."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
