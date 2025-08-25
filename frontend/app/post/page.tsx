import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import axios from 'axios';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

interface BlogListPageProps {
  posts: Post[];
  error?: string;
}

export default function BlogListPage({ posts, error }: BlogListPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blog Posts</h1>
            <p className="text-muted-foreground">Discover amazing content from our community</p>
          </div>
          <Button asChild>
            <Link href="/post/create">Create Post</Link>
          </Button>
        </div>

        {error && (
          <div className="mb-6">
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {posts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to share your thoughts with the community!</p>
              <Button asChild>
                <Link href="/login">Login to Create Post</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription>
                    by {post.author} on {new Date(post.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {post.content}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/post/${post.id}`}>Read More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Server-side rendering
export async function getServerSideProps() {
  try {
    // Determine the base URL
    const baseURL = process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NEXT_PUBLIC_RUNNING_IN_DOCKER === 'true' ? 'http://backend:8000/api' : 'http://localhost:8000/api');
    
    // Fetch posts from the API
    const response = await axios.get(`${baseURL}/posts/`);
    
    return {
      props: {
        posts: response.data,
      },
    };
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return {
      props: {
        posts: [],
        error: 'Failed to load posts',
      },
    };
  }
}