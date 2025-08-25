from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib.auth import authenticate
from django.core.paginator import Paginator
from .models import User, Post
from .utils import generate_token, jwt_required, verify_refresh_token
import json

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(View):
    def post(self, request):
        try:
            print("Registration request received")
            data = json.loads(request.body)
            print(f"Request data: {data}")
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            
            print(f"Extracted data - username: {username}, email: {email}")
            
            if not username or not password:
                print("Missing username or password")
                return JsonResponse({'error': 'Username and password are required'}, status=400)
            
            if User.objects.filter(username=username).exists():
                print("Username already exists")
                return JsonResponse({'error': 'Username already exists'}, status=400)
            
            print("Creating user...")
            # Create user with all provided fields
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            print(f"User created successfully: {user.username}")
            
            # Generate token for the new user
            access_token, refresh_token = generate_token(user.id)
            print("Token generated")
            
            # Return token and user data to match frontend expectations
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
            
            print("Sending success response")
            return JsonResponse({
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user_data
            }, status=201)
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return JsonResponse({'error': str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request):
        try:
            print("Login request received")
            data = json.loads(request.body)
            print(f"Login data: {data}")
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                print("Missing username or password")
                return JsonResponse({'error': 'Username and password are required'}, status=400)
            
            user = authenticate(username=username, password=password)
            if not user:
                print("Invalid credentials")
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
            
            print(f"User authenticated: {user.username}")
            access_token, refresh_token = generate_token(user.id)
            print("Token generated")
            
            # Return token and user data to match frontend expectations
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
            
            print("Sending success response")
            return JsonResponse({
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user_data
            }, status=200)
        except Exception as e:
            print(f"Login error: {str(e)}")
            return JsonResponse({'error': str(e)}, status=400)

class PostListView(View):
    def get(self, request):
        page_number = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 10)
        
        posts = Post.objects.all().values('id', 'title', 'content', 'author__username', 'created_at').order_by('-created_at')
        paginator = Paginator(posts, page_size)
        
        try:
            page_obj = paginator.page(page_number)
        except Exception:
            page_obj = paginator.page(1) # Fallback to first page if page_number is invalid
            
        return JsonResponse({
            'posts': list(page_obj.object_list),
            'page': page_obj.number,
            'pages': paginator.num_pages,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'total_posts': paginator.count,
        }, safe=False)
    
    @jwt_required
    def post(self, request):
        try:
            data = json.loads(request.body)
            title = data.get('title')
            content = data.get('content')
            
            if not title or not content:
                return JsonResponse({'error': 'Title and content are required'}, status=400)
            
            post = Post.objects.create(title=title, content=content, author=request.user)
            return JsonResponse({
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'author': post.author.username,
                'created_at': post.created_at.isoformat()
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

class PostDetailView(View):
    def get(self, request, post_id):
        try:
            post = Post.objects.select_related('author').get(id=post_id)
            return JsonResponse({
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'author': post.author.username,
                'created_at': post.created_at.isoformat()
            })
        except Post.DoesNotExist:
            return JsonResponse({'error': 'Post not found'}, status=404)
    
    @jwt_required
    def put(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
            
            # Check if the user is the author of the post
            if post.author != request.user:
                return JsonResponse({'error': 'Unauthorized'}, status=403)
            
            data = json.loads(request.body)
            post.title = data.get('title', post.title)
            post.content = data.get('content', post.content)
            post.save()
            
            return JsonResponse({
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'author': post.author.username,
                'created_at': post.created_at.isoformat()
            })
        except Post.DoesNotExist:
            return JsonResponse({'error': 'Post not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    @jwt_required
    def delete(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
            
            # Check if the user is the author of the post
            if post.author != request.user:
                return JsonResponse({'error': 'Unauthorized'}, status=403)
            
            post.delete()
            return JsonResponse({'message': 'Post deleted successfully'})
        except Post.DoesNotExist:
            return JsonResponse({'error': 'Post not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(View):
    def post(self, request):
        # For JWT authentication, logout is typically handled client-side
        # by deleting the token. Server-side we just return a success response.
        return JsonResponse({'message': 'Logged out successfully'}, status=200)

@method_decorator(csrf_exempt, name='dispatch')
class RefreshTokenView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            refresh_token = data.get('refresh_token')

            if not refresh_token:
                return JsonResponse({'error': 'Refresh token is required'}, status=400)

            user = verify_refresh_token(refresh_token)

            if not user:
                return JsonResponse({'error': 'Invalid or expired refresh token'}, status=401)

            access_token, new_refresh_token = generate_token(user.id)

            return JsonResponse({
                'access_token': access_token,
                'refresh_token': new_refresh_token,
            }, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

