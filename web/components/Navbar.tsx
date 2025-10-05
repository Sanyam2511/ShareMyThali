// web/components/Navbar.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  // Use a state/context to determine if the user is logged in
  const isLoggedIn = false; 

  return (
    <header className="absolute top-0 left-0 w-full z-10 py-4 bg-transparent text-thali-light">
      <div className="container flex items-center justify-between">
        <Link href="/" className="text-2xl font-serif font-bold text-thali-gold">
          ShareMyThali
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/donations" className="hover:text-thali-gold transition-colors">
            Find Food
          </Link>
          <Link href="/about" className="hover:text-thali-gold transition-colors">
            About Us
          </Link>
          {/* Use the Button component here, styled with your custom colors */}
          <Button 
            asChild 
            variant="default"
            className="bg-thali-gold hover:bg-thali-gold/90 text-thali-green font-bold px-6 py-2 transform skew-x-[-15deg] transition-all duration-300"
          >
            <Link href={isLoggedIn ? "/profile" : "/auth/register"}>
              {isLoggedIn ? "Profile" : "Sign Up"}
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}