"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { BookOpen, PlusCircle, LogOut } from "lucide-react"
import Link from "next/link"

export function WelcomeDashboard() {
  const { user, logout } = useAuth()

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
              <Link href="/post">All Blogs</Link>
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
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Welcome, {user?.username || user?.email}!</h2>
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
                asChild
              >
                <Link href="/post/create">New Post</Link>
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
                View and manage your blog posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-slate-200 hover:bg-slate-50 bg-transparent"
                asChild
              >
                <Link href="/post">View Posts</Link>
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
                <Link href="/post">Browse Blogs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Getting Started</CardTitle>
            <CardDescription className="text-slate-600">Here are some things you can do</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                  <PlusCircle className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 mb-1">Create Your First Post</h4>
                  <p className="text-sm text-slate-600">Share your thoughts with the community</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 mb-1">Explore Other Posts</h4>
                  <p className="text-sm text-slate-600">Read what others in the community are writing</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
