"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useBlog } from "@/contexts/blog-context"
import { CreatePostForm } from "@/components/create-post-form"
import { PostsList } from "@/components/posts-list"
import { PlusCircle, LogOut, BookOpen, Edit } from "lucide-react"

type View = "dashboard" | "create-post" | "my-posts"

export function WelcomeDashboard() {
  const { user, logout } = useAuth()
  const { getPostsByAuthor } = useBlog()
  const [currentView, setCurrentView] = useState<View>("dashboard")

  const userPosts = user ? getPostsByAuthor(user.id) : []

  if (currentView === "create-post") {
    return <CreatePostForm onBack={() => setCurrentView("dashboard")} />
  }

  if (currentView === "my-posts") {
    return <PostsList onBack={() => setCurrentView("dashboard")} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-slate-900" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              BlogSpace
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-slate-600 hover:text-slate-900">
              <a href="/blogs">All Blogs</a>
            </Button>
            <Button
              variant="outline"
              onClick={logout}
              className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Welcome, {user?.name}!</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Ready to share your thoughts with the world? Start writing your next blog post.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <PlusCircle className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-slate-900">Create New Post</CardTitle>
              <CardDescription className="text-slate-600">Start writing your next blog post</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium"
                onClick={() => setCurrentView("create-post")}
              >
                New Post
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-slate-900" />
              </div>
              <CardTitle className="text-slate-900">My Posts</CardTitle>
              <CardDescription className="text-slate-600">
                View and manage your {userPosts.length} blog {userPosts.length === 1 ? "post" : "posts"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-slate-200 hover:bg-slate-50 bg-transparent"
                onClick={() => setCurrentView("my-posts")}
              >
                View Posts
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-slate-900" />
              </div>
              <CardTitle className="text-slate-900">All Blogs</CardTitle>
              <CardDescription className="text-slate-600">Discover posts from other writers</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 bg-transparent" asChild>
                <a href="/blogs">Browse Blogs</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Recent Activity</CardTitle>
            <CardDescription className="text-slate-600">Your latest blog posts and activity</CardDescription>
          </CardHeader>
          <CardContent>
            {userPosts.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No posts yet</p>
                <p className="text-sm">Create your first blog post to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <Edit className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 mb-1">{post.title}</h4>
                      <p className="text-sm text-slate-600 mb-2">{post.excerpt}</p>
                      <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {userPosts.length > 3 && (
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentView("my-posts")}
                    className="w-full text-slate-600 hover:text-slate-900"
                  >
                    View all {userPosts.length} posts
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
