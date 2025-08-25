from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Post

User = get_user_model()

class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
        
        # Test user data
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123',
            'first_name': 'Test',
            'last_name': 'User'
        }
    
    def test_user_registration(self):
        """Test user registration with valid data"""
        response = self.client.post(
            self.register_url,
            self.user_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], self.user_data['username'])
        self.assertEqual(response.data['user']['email'], self.user_data['email'])
        
        # Verify user was created in database
        self.assertTrue(User.objects.filter(username=self.user_data['username']).exists())
    
    def test_user_registration_with_existing_username(self):
        """Test user registration with existing username"""
        # Create user first
        User.objects.create_user(**self.user_data)
        
        # Try to create another user with same username
        response = self.client.post(
            self.register_url,
            self.user_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_user_login_with_username(self):
        """Test user login with username"""
        # Create user first
        user = User.objects.create_user(**self.user_data)
        
        # Login with username
        login_data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        
        response = self.client.post(
            self.login_url,
            login_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], user.username)
    
    def test_user_login_with_email(self):
        """Test user login with email"""
        # Create user first
        user = User.objects.create_user(**self.user_data)
        
        # Login with email
        login_data = {
            'username': self.user_data['email'],
            'password': self.user_data['password']
        }
        
        response = self.client.post(
            self.login_url,
            login_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], user.username)
    
    def test_user_login_with_invalid_credentials(self):
        """Test user login with invalid credentials"""
        # Create user first
        User.objects.create_user(**self.user_data)
        
        # Login with wrong password
        login_data = {
            'username': self.user_data['username'],
            'password': 'wrongpassword'
        }
        
        response = self.client.post(
            self.login_url,
            login_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

class PostAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.post_list_url = reverse('post_list')
        
        # Create test user
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123'
        }
        self.user = User.objects.create_user(**self.user_data)
        
        # Create test post
        self.post_data = {
            'title': 'Test Post',
            'content': 'This is a test post content.'
        }
        self.post = Post.objects.create(
            title=self.post_data['title'],
            content=self.post_data['content'],
            author=self.user
        )
    
    def test_get_all_posts(self):
        """Test retrieving all posts"""
        response = self.client.get(self.post_list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], self.post_data['title'])
        self.assertEqual(response.data[0]['content'], self.post_data['content'])
        self.assertEqual(response.data[0]['author__username'], self.user.username)
    
    def test_create_post_unauthenticated(self):
        """Test creating a post without authentication"""
        response = self.client.post(
            self.post_list_url,
            self.post_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_post_authenticated(self):
        """Test creating a post with authentication"""
        # Login first
        login_data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        login_response = self.client.post(
            reverse('login'),
            login_data,
            format='json'
        )
        
        # Set token in header
        token = login_response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Create post
        new_post_data = {
            'title': 'New Test Post',
            'content': 'This is a new test post.'
        }
        response = self.client.post(
            self.post_list_url,
            new_post_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], new_post_data['title'])
        self.assertEqual(response.data['content'], new_post_data['content'])
        self.assertEqual(response.data['author'], self.user.username)
        
        # Verify post was created in database
        self.assertTrue(Post.objects.filter(title=new_post_data['title']).exists())
    
    def test_get_post_detail(self):
        """Test retrieving a specific post"""
        post_detail_url = reverse('post_detail', kwargs={'post_id': self.post.id})
        response = self.client.get(post_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.post_data['title'])
        self.assertEqual(response.data['content'], self.post_data['content'])
        self.assertEqual(response.data['author'], self.user.username)
    
    def test_get_nonexistent_post(self):
        """Test retrieving a non-existent post"""
        post_detail_url = reverse('post_detail', kwargs={'post_id': 9999})
        response = self.client.get(post_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

class PostModificationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create test user
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123'
        }
        self.user = User.objects.create_user(**self.user_data)
        
        # Create another user
        self.other_user_data = {
            'username': 'otheruser',
            'email': 'other@example.com',
            'password': 'otherpassword123'
        }
        self.other_user = User.objects.create_user(**self.other_user_data)
        
        # Create test post
        self.post_data = {
            'title': 'Test Post',
            'content': 'This is a test post content.'
        }
        self.post = Post.objects.create(
            title=self.post_data['title'],
            content=self.post_data['content'],
            author=self.user
        )
    
    def authenticate_user(self, user_data):
        """Helper method to authenticate a user"""
        login_data = {
            'username': user_data['username'],
            'password': user_data['password']
        }
        login_response = self.client.post(
            reverse('login'),
            login_data,
            format='json'
        )
        token = login_response.data['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return login_response
    
    def test_update_post_owner(self):
        """Test updating a post by its owner"""
        # Authenticate as post owner
        self.authenticate_user(self.user_data)
        
        # Update post
        post_detail_url = reverse('post_detail', kwargs={'post_id': self.post.id})
        updated_data = {
            'title': 'Updated Test Post',
            'content': 'This is updated content.'
        }
        response = self.client.put(
            post_detail_url,
            updated_data,
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], updated_data['title'])
        self.assertEqual(response.data['content'], updated_data['content'])
        
        # Verify update in database
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, updated_data['title'])
        self.assertEqual(self.post.content, updated_data['content'])
    
    def test_update_post_non_owner(self):
        """Test updating a post by a non-owner"""
        # Authenticate as different user
        self.authenticate_user(self.other_user_data)
        
        # Try to update post
        post_detail_url = reverse('post_detail', kwargs={'post_id': self.post.id})
        updated_data = {
            'title': 'Updated Test Post',
            'content': 'This is updated content.'
        }
        response = self.client.put(
            post_detail_url,
            updated_data,
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('error', response.data)
    
    def test_delete_post_owner(self):
        """Test deleting a post by its owner"""
        # Authenticate as post owner
        self.authenticate_user(self.user_data)
        
        # Delete post
        post_detail_url = reverse('post_detail', kwargs={'post_id': self.post.id})
        response = self.client.delete(post_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        # Verify deletion from database
        self.assertFalse(Post.objects.filter(id=self.post.id).exists())
    
    def test_delete_post_non_owner(self):
        """Test deleting a post by a non-owner"""
        # Authenticate as different user
        self.authenticate_user(self.other_user_data)
        
        # Try to delete post
        post_detail_url = reverse('post_detail', kwargs={'post_id': self.post.id})
        response = self.client.delete(post_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('error', response.data)
        
        # Verify post still exists in database
        self.assertTrue(Post.objects.filter(id=self.post.id).exists())
