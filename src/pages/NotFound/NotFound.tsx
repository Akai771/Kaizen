// src/pages/NotFound/NotFound.tsx
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* 404 Number */}
            <div className="text-6xl font-bold text-primary/20">404</div>
            
            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Page Not Found</h1>
              <p className="text-muted-foreground">
                Sorry, we couldn't find the page you're looking for. 
                It might have been moved, deleted, or you entered the wrong URL.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/">Go Home</Link>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Or try one of these pages:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link 
                  to="/about" 
                  className="text-sm text-primary hover:underline"
                >
                  About Us
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link 
                  to="/contact" 
                  className="text-sm text-primary hover:underline"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotFound