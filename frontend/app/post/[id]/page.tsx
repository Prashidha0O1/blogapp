'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStore } from '@/store/useStore'; 

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, token, setUser } = useStore(); // Auth state from Zustand

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/posts/${id}/`);
        setPost(response.data);
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || 'Failed to load post';
        toast.error(errorMsg);
        if (error.response?.status === 404) {
          router.push('/posts'); // Redirect to posts list on 404
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, router]);

  const handleDelete = async () => {
    if (!token) {
      toast.error('You must be logged in to delete a post');
      return;
    }
    try {
      await axios.delete(`http://localhost:8000/posts/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Post deleted successfully');
      setTimeout(() => router.push('/posts'), 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to delete post';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!post) {
    return null; // Handled by redirect in useEffect
  }

  const isAuthor = user && user.username === post.author;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-600 mb-2">
          By {post.author} on{' '}
          {new Date(post.created_at).toLocaleDateString()}
        </p>
        <p className="text-gray-800 mb-6">{post.content}</p>
        {isAuthor && (
          <div className="flex space-x-4">
            <Link
              href={`/posts/edit/${id}`}
              className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Post
            </Link>
            <button
              onClick={handleDelete}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Post
            </button>
          </div>
        )}
        <Link
          href="/posts"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Back to Posts
        </Link>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}