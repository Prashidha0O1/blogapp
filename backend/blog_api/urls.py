from django.urls import path
from .views import RegisterView, LoginView, LogoutView, PostListView, PostDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('posts/', PostListView.as_view(), name='post_list'),
    path('posts/<int:post_id>/', PostDetailView.as_view(), name='post_detail'),
]