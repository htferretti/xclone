from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import UserProfile, Follow


class UserProfileInline(admin.StackedInline):
    """Inline admin for UserProfile"""
    model = UserProfile
    fields = ['cpf', 'profile_picture', 'created_at']
    readonly_fields = ['created_at']
    extra = 0


# Unregister the default User admin first
admin.site.unregister(User)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Enhanced User admin with profile information"""
    list_display = ['username', 'email', 'get_cpf', 'is_staff']
    search_fields = ['username', 'email', 'userprofile__cpf']
    inlines = [UserProfileInline]
    
    def get_cpf(self, obj):
        """Display CPF from related UserProfile"""
        if hasattr(obj, 'userprofile'):
            return obj.userprofile.cpf
        return '-'
    get_cpf.short_description = 'CPF'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'get_username', 'get_email', 'cpf', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'user__email', 'cpf']
    readonly_fields = ['created_at', 'user']
    
    def get_username(self, obj):
        """Display username from related User"""
        return obj.user.username
    get_username.short_description = 'Username'
    
    def get_email(self, obj):
        """Display email from related User"""
        return obj.user.email
    get_email.short_description = 'Email'


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ['follower', 'followed', 'created_at']
    list_filter = ['created_at']
    search_fields = ['follower__username', 'followed__username']
    readonly_fields = ['created_at']
