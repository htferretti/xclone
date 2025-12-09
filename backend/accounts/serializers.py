from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.validators import UniqueValidator
from .models import UserProfile, Follow
from . import messages
from .cpf_validator import validate_cpf_external, validate_cpf_format


class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['cpf', 'profile_picture', 'created_at']

    def get_profile_picture(self, obj):
        """Return absolute URL for profile picture if it exists"""
        if obj.profile_picture:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']


class UserDetailSerializer(serializers.ModelSerializer):
    """Extended user serializer with follow counts and follow status"""
    profile = UserProfileSerializer(read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile', 'followers_count', 'following_count', 'is_following']

    def get_followers_count(self, obj):
        """Count of users following this user"""
        return obj.followers.count()

    def get_following_count(self, obj):
        """Count of users this user is following"""
        return obj.following.count()

    def get_is_following(self, obj):
        """Check if current user follows this user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.followers.filter(follower=request.user).exists()
        return False


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message=messages.EMAIL_EXISTS)],
        error_messages={
            'invalid': messages.EMAIL_INVALID,
        }
    )
    username = serializers.RegexField(
        regex=r'^[a-zA-Z0-9_]{4,15}$',
        required=True,
        error_messages={
            'invalid': messages.USERNAME_INVALID,
        },
        validators=[UniqueValidator(queryset=User.objects.all(), message=messages.USERNAME_EXISTS)]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    cpf = serializers.RegexField(
        regex=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$',
        required=True,
        error_messages={'invalid': messages.CPF_INVALID},
        validators=[UniqueValidator(queryset=UserProfile.objects.all(), message=messages.CPF_EXISTS)]
    )
    profile_picture = serializers.ImageField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'cpf', 'profile_picture']

    def validate(self, attrs):
        # Password match
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": messages.PASSWORD_MISMATCH})

        # Password strength
        try:
            validate_password(attrs['password'])
        except DjangoValidationError:
            raise serializers.ValidationError({"password": messages.PASSWORD_WEAK})

        # CPF external validation
        cpf = attrs.get('cpf')
        if cpf and not validate_cpf_external(cpf):
            raise serializers.ValidationError({"cpf": messages.CPF_INVALID_EXTERNAL})

        return attrs

    def create(self, validated_data):
        cpf = validated_data.pop('cpf')
        profile_picture = validated_data.pop('profile_picture', None)
        validated_data.pop('password_confirm')
        
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(
            user=user,
            cpf=cpf,
            profile_picture=profile_picture
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if not username or not password:
            raise serializers.ValidationError(messages.LOGIN_REQUIRED)

        return attrs
