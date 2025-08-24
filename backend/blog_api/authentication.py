from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class EmailOrUsernameModelBackend(ModelBackend):
    """
    Custom authentication backend that allows users to log in with either
    their username or email address.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            return None
        
        # Check if the input is an email address
        try:
            user = User.objects.get(Q(username=username) | Q(email=username))
        except User.DoesNotExist:
            return None
        
        if user.check_password(password):
            return user
        
        return None