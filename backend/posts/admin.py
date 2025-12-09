from django.contrib import admin
from .models import Post, Like, Comment

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
	list_display = ('id', 'post', 'author', 'content', 'created_at')
	search_fields = ('author__username', 'content')
	list_filter = ('created_at',)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
	list_display = ('id', 'title', 'author', 'published_at')
	search_fields = ('title', 'content', 'author__username')
	list_filter = ('published_at',)


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
	list_display = ('id', 'user', 'post', 'created_at')
	search_fields = ('user__username', 'post__title')
	list_filter = ('created_at',)
