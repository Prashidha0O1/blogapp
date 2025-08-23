'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { blogAPI } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { redirect } from 'next/navigation';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { id } = params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      redirect('/login');
    }
  }, [user, isLoading]);

  // Fetch post data for editing
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await blogAPI.getPost(id);
        const postData: Post = response.data;
        
        // Check if user is the author
        if (user && user.username !== postData.author) {
          toast.error('You can only edit your own posts');
          router.push('/post');
          return;
        }
        
        setTitle(postData.title);
        setContent(postData.content);
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || 'Failed to load post';
        toast.error(errorMsg);
        router.push('/post');
      } finally {
        setLoading(false);
      }
    };

    if (user && !isLoading) {
      fetchPost();
    }
  }, [id, user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await blogAPI.updatePost(id, { title, content });
      toast.success('Post updated successfully!');
      setTimeout(() => router.push(`/post/${id}`), 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to update post';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Post</CardTitle>
            <CardDescription>Update your post content</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-foreground">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="content" className="text-sm font-medium text-foreground">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                  placeholder="Write your post content here..."
                  className="mt-1 min-h-[200px]"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/post/${id}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Post"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}