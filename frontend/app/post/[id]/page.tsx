'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { blogAPI } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await blogAPI.getPost(id);
        setPost(response.data);
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || 'Failed to load post';
        toast.error(errorMsg);
        if (error.response?.status === 404) {
          router.push('/post'); // Redirect to posts list on 404
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, router]);

  const handleDelete = async () => {
    if (!user) {
      toast.error('You must be logged in to delete a post');
      return;
    }
    try {
      await blogAPI.deletePost(id);
      toast.success('Post deleted successfully');
      setTimeout(() => router.push('/post'), 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to delete post';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return null; // Handled by redirect in useEffect
  }

  const isAuthor = user && user.username === post.author;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl mb-2">{post.title}</CardTitle>
                <CardDescription>
                  By {post.author} on {new Date(post.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              {isAuthor && (
                <div className="flex space-x-2">
                  <Button asChild variant="outline">
                    <Link href={`/post/edit/${id}`}>Edit</Link>
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none mb-6">
              <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/post">← Back to Posts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}