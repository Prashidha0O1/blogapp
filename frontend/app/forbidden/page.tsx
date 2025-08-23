"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldX, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">403</h1>
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Access Forbidden</h2>
          </div>

          <div className="mb-8">
            <p className="text-slate-600 leading-relaxed">
              Sorry, you don't have permission to access this resource. This could be due to insufficient privileges or
              restricted content.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>

            <Button
              variant="outline"
              className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              If you believe this is an error, please contact support or try logging in with appropriate credentials.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
