from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator


class UserProfile(models.Model):
    """Extended user profile with CPF and profile picture."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    cpf = models.CharField(
        max_length=14,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$',
                message='CPF must be in format: XXX.XXX.XXX-XX',
                code='invalid_cpf'
            )
        ]
    )
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        default='default/default_profile.jpg',
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username}"


class Follow(models.Model):
    """Track follow relationships between users."""
    follower = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='following'
    )
    followed = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='followers'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'followed')
        indexes = [
            models.Index(fields=['follower', '-created_at']),
            models.Index(fields=['followed']),
        ]

    def __str__(self):
        return f"{self.follower.username} → {self.followed.username}"