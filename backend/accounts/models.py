from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver


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


# Signal to delete old profile picture from Cloudinary when updating
@receiver(pre_save, sender=UserProfile)
def delete_old_profile_picture_on_update(sender, instance, **kwargs):
    """Delete old profile picture from Cloudinary when updating to a new one."""
    if not instance.pk:
        return  # New instance, no old picture to delete

    try:
        old_profile = UserProfile.objects.get(pk=instance.pk)
        if old_profile.profile_picture and old_profile.profile_picture != instance.profile_picture:
            # Delete the old file from Cloudinary
            old_profile.profile_picture.delete(save=False)
    except UserProfile.DoesNotExist:
        pass  # Profile doesn't exist yet


# Signal to delete profile picture from Cloudinary when profile is deleted
@receiver(pre_delete, sender=UserProfile)
def delete_profile_picture_on_profile_delete(sender, instance, **kwargs):
    """Delete profile picture from Cloudinary when UserProfile is deleted."""
    if instance.profile_picture:
        instance.profile_picture.delete(save=False)