import jwt
import datetime
from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from functools import wraps

User = get_user_model()

def generate_token(user_id):
    """Generate JWT token for a user"""
    access_token_payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=15), # Access token valid for 15 minutes
        'iat': datetime.datetime.utcnow()
    }
    access_token = jwt.encode(access_token_payload, settings.SECRET_KEY, algorithm='HS256')

    refresh_token_payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7), # Refresh token valid for 7 days
        'iat': datetime.datetime.utcnow()
    }
    refresh_token = jwt.encode(refresh_token_payload, settings.SECRET_KEY, algorithm='HS256')

    return access_token, refresh_token

def verify_token(token):
    """Verify JWT token and return user"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user = User.objects.get(id=user_id)
        return user
    except jwt.ExpiredSignatureError:
        print("Token has expired")
        return None
    except jwt.InvalidTokenError:
        print("Invalid token")
        return None
    except User.DoesNotExist:
        print("User not found")
        return None

def verify_refresh_token(token):
    """Verify JWT refresh token and return user"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user = User.objects.get(id=user_id)
        return user
    except jwt.ExpiredSignatureError:
        print("Refresh token has expired")
        return None
    except jwt.InvalidTokenError:
        print("Invalid refresh token")
        return None
    except User.DoesNotExist:
        print("User not found for refresh token")
        return None

def jwt_required(view_func):
    """Decorator to require JWT authentication for views"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        
        if not user:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)
        
        request.user = user
        return view_func(request, *args, **kwargs)
    
    return wrapper