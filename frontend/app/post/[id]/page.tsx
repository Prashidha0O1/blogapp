import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import axios from 'axios';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { blogAPI } from '@/lib/api';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

interface PostDetailPageProps {
  post: Post | null;
  error?: string;
  id: string;
}

export default function PostDetailPage({ post, error, id }: PostDetailPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [postState, setPostState] = useState<Post | null>(post);

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="text-center">
          <p className="text-destructive text-xl">{error}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/post">← Back to Posts</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!postState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Post not found</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/post">← Back to Posts</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isAuthor = user && user.username === postState.author;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl mb-2">{postState.title}</CardTitle>
                <CardDescription>
                  By {postState.author} on {new Date(postState.created_at).toLocaleDateString()}
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
              <p className="text-foreground whitespace-pre-wrap">{postState.content}</p>
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

// Server-side rendering
export async function getServerSideProps(context: any) {
  const { id } = context.params;
  
  try {
    // Determine the base URL
    const baseURL = process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NEXT_PUBLIC_RUNNING_IN_DOCKER === 'true' ? 'http://backend:8000/api' : 'http://localhost:8000/api');
    
    // Fetch post from the API
    const response = await axios.get(`${baseURL}/posts/${id}/`);
    
    return {
      props: {
        post: response.data,
        id,
      },
    };
  } catch (error: any) {
    console.error('Failed to fetch post:', error);
    
    // Handle 404 case
    if (error.response?.status === 404) {
      return {
        props: {
          post: null,
          error: 'Post not found',
          id,
        },
      };
    }
    
    return {
      props: {
        post: null,
        error: 'Failed to load post',
        id,
      },
    };
  }
}