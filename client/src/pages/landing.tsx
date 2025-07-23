import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Clock, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-library-neutral">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <BookOpen className="text-library-primary text-2xl" />
              <h1 className="text-xl font-bold text-library-primary">LibraryHub</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-library-accent hover:bg-library-accent/90 text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div 
            className="relative h-64 rounded-xl overflow-hidden shadow-lg bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=640')`
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative z-10 flex items-center justify-center h-full text-center text-white">
              <div>
                <h2 className="text-4xl font-bold mb-4">Discover Your Next Great Read</h2>
                <p className="text-xl mb-6">Browse, borrow, or buy from our extensive digital collection</p>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-library-accent hover:bg-library-accent/90 text-white px-6 py-3 text-lg"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="text-library-primary text-3xl mb-3 mx-auto" />
              <h3 className="text-2xl font-bold text-gray-800">15,247</h3>
              <p className="text-gray-600">Books Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="text-library-secondary text-3xl mb-3 mx-auto" />
              <h3 className="text-2xl font-bold text-gray-800">2,841</h3>
              <p className="text-gray-600">Active Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="text-library-accent text-3xl mb-3 mx-auto" />
              <h3 className="text-2xl font-bold text-gray-800">3,296</h3>
              <p className="text-gray-600">Currently Borrowed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="text-library-warning text-3xl mb-3 mx-auto" />
              <h3 className="text-2xl font-bold text-gray-800">4.8</h3>
              <p className="text-gray-600">Average Rating</p>
            </CardContent>
          </Card>
        </section>

        {/* Features */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Why Choose LibraryHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <BookOpen className="text-library-primary text-4xl mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Vast Collection</h3>
              <p className="text-gray-600">Access thousands of books across all genres and categories</p>
            </div>
            <div>
              <Users className="text-library-secondary text-4xl mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600">Join a community of readers and book enthusiasts</p>
            </div>
            <div>
              <Clock className="text-library-accent text-4xl mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">24/7 Access</h3>
              <p className="text-gray-600">Browse and manage your library anytime, anywhere</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-library-primary text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="text-2xl" />
                <h3 className="text-xl font-bold">LibraryHub</h3>
              </div>
              <p className="text-green-100">Your digital gateway to knowledge and learning.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-green-100">
                <li>Book Borrowing</li>
                <li>Digital Purchase</li>
                <li>Study Spaces</li>
                <li>Research Help</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-green-100">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Library Hours</li>
                <li>Policies</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <p className="text-green-100">Follow us on social media for updates and news</p>
            </div>
          </div>
          <div className="border-t border-green-700 mt-8 pt-8 text-center text-green-100">
            <p>&copy; 2024 LibraryHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
