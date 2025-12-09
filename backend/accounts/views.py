from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    UserDetailSerializer,
)
from .models import UserProfile, Follow
from . import messages


class AuthViewSet(viewsets.ViewSet):
    """Authentication endpoints (register and login)."""
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        """
        Register a new user.
        Expected fields: username, email, password, password_confirm, cpf
        """
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        Login user.
        Expected fields: username (can be username or email), password
        """
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username_or_email = serializer.validated_data['username']
            password = serializer.validated_data['password']

            # Try to authenticate with username first
            user = authenticate(username=username_or_email, password=password)
            
            # If that fails, try to find user by email and authenticate
            if user is None:
                try:
                    user_obj = User.objects.get(email=username_or_email)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass

            if user is None:
                return Response(
                    {'detail': messages.INVALID_CREDENTIALS},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current authenticated user info with follow data."""
        serializer = UserDetailSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def profile(self, request):
        """
        Get user profile by username with follow info.
        Query param: username
        Returns: username, email, cpf, profile_picture, followers_count, following_count, is_following
        """
        username = request.query_params.get('username')
        if not username:
            return Response(
                {'detail': 'username query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(username=username)
            serializer = UserDetailSerializer(user, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def follow(self, request):
        """
        Follow a user.
        Expected fields: username (username of user to follow)
        """
        target_username = request.data.get('username')
        if not target_username:
            return Response(
                {'detail': 'username is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            target_user = User.objects.get(username=target_username)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Can't follow yourself
        if target_user == request.user:
            return Response(
                {'detail': 'You cannot follow yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create follow relationship
        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            followed=target_user
        )

        if created:
            return Response(
                {'detail': f'You are now following {target_username}'},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {'detail': f'You are already following {target_username}'},
                status=status.HTTP_200_OK
            )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def unfollow(self, request):
        """
        Unfollow a user.
        Expected fields: username (username of user to unfollow)
        """
        target_username = request.data.get('username')
        if not target_username:
            return Response(
                {'detail': 'username is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            target_user = User.objects.get(username=target_username)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Delete follow relationship
        deleted_count, _ = Follow.objects.filter(
            follower=request.user,
            followed=target_user
        ).delete()

        if deleted_count > 0:
            return Response(
                {'detail': f'You unfollowed {target_username}'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'detail': f'You were not following {target_username}'},
                status=status.HTTP_200_OK
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def following(self, request):
        """
        Get list of usernames that the current user is following.
        Returns: list of usernames
        """
        following_users = Follow.objects.filter(
            follower=request.user
        ).values_list('followed__username', flat=True)
        return Response(
            {'following': list(following_users)},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='user-followers')
    def user_followers(self, request):
        """
        Get list of users who follow a specific user.
        Query params: username
        Returns: list of follower usernames
        """
        username = request.query_params.get('username')
        if not username:
            return Response(
                {'detail': 'username query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        followers = Follow.objects.filter(
            followed=user
        ).values_list('follower__username', flat=True)
        
        return Response(
            {'followers': list(followers)},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='user-following')
    def user_following(self, request):
        """
        Get list of users that a specific user is following.
        Query params: username
        Returns: list of following usernames
        """
        username = request.query_params.get('username')
        if not username:
            return Response(
                {'detail': 'username query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        following = Follow.objects.filter(
            follower=user
        ).values_list('followed__username', flat=True)
        
        return Response(
            {'following': list(following)},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], url_path='update-profile-picture')
    def update_profile_picture(self, request):
        """
        Update user profile picture.
        Expected fields: profile_picture (file)
        """
        print(f"[DEBUG] update_profile_picture called by user: {request.user.username}")
        print(f"[DEBUG] FILES in request: {list(request.FILES.keys())}")
        
        if 'profile_picture' not in request.FILES:
            return Response(
                {'detail': 'profile_picture file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile_picture = request.FILES['profile_picture']
        print(f"[DEBUG] File received: {profile_picture.name}, size: {profile_picture.size}, type: {profile_picture.content_type}")

        # Validate file size (max 5MB)
        if profile_picture.size > 5 * 1024 * 1024:
            return Response(
                {'detail': 'File size cannot exceed 5MB'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if profile_picture.content_type not in allowed_types:
            return Response(
                {'detail': 'Only JPEG, PNG, GIF, and WebP images are allowed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file extension
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        file_extension = profile_picture.name.lower().split('.')[-1]
        if f'.{file_extension}' not in allowed_extensions:
            return Response(
                {'detail': 'Invalid file extension'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)

        print(f"[DEBUG] Saving new profile_picture to profile...")
        profile.profile_picture = profile_picture
        profile.save()
        
        print(f"[DEBUG] Profile saved. URL: {profile.profile_picture.url if profile.profile_picture else 'None'}")

        return Response(
            {
                'detail': 'Profile picture updated successfully',
                'url': profile.profile_picture.url if profile.profile_picture else None
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], url_path='update-username')
    def update_username(self, request):
        """
        Update user username.
        Expected fields: username
        """
        username = request.data.get('username', '').strip()
        if not username:
            return Response(
                {'detail': 'username is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exclude(pk=request.user.pk).exists():
            return Response(
                {'detail': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        request.user.username = username
        request.user.save()

        return Response(
            {'detail': 'Username updated successfully', 'username': username},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated], url_path='update-email-password')
    def update_email_password(self, request):
        """
        Update user email and/or password.
        Expected fields: current_password (required), email (optional), new_password (optional)
        """
        current_password = request.data.get('current_password', '').strip()
        email = request.data.get('email', '').strip()
        new_password = request.data.get('new_password', '').strip()

        if not current_password:
            return Response(
                {'detail': 'current_password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify current password
        if not request.user.check_password(current_password):
            return Response(
                {'detail': 'Current password is incorrect'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Update email if provided
        if email:
            if User.objects.filter(email=email).exclude(pk=request.user.pk).exists():
                return Response(
                    {'detail': 'Email already in use'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            request.user.email = email

        # Update password if provided
        if new_password:
            if len(new_password) < 6:
                return Response(
                    {'detail': 'Password must be at least 6 characters'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            request.user.set_password(new_password)

        request.user.save()

        return Response(
            {'detail': 'Email and/or password updated successfully'},
            status=status.HTTP_200_OK
        )
