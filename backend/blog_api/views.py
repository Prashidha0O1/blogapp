from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib.auth import authenticate
from .models import User, Post
from .utils import generate_token, jwt_required
import json

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return JsonResponse({'error': 'Username and password are required'}, status=400)
            
            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already exists'}, status=400)
            
            user = User.objects.create_user(username=username, password=password)
            return JsonResponse({'message': 'User created successfully'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return JsonResponse({'error': 'Username and password are required'}, status=400)
            
            user = authenticate(username=username, password=password)
            if not user:
                return JsonResponse({'error': 'Invalid credentials'}, status=401)
            
            token = generate_token(user.id)
            return JsonResponse({'token': token}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

class PostListView(View):
    def get(self, request):
        posts = Post.objects.all().values('id', 'title', 'content', 'author__username', 'created_at')
        return JsonResponse(list(posts), safe=False)
    
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
