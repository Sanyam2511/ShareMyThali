// web/app/page.tsx (Landing Page)
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-thali-light">
      {/* Hero Section - Matching the Dark Green Background */}
      <section className="relative h-[80vh] bg-thali-green text-white pt-24">
        <Navbar />
        <div className="container grid md:grid-cols-2 gap-10 h-full items-center">
          {/* Left: Heading and Call to Action */}
          <div className="z-10 pt-16 md:pt-0">
            <p className="text-lg font-serif italic text-thali-gold mb-2">Your Daily</p>
            <h1 className="text-6xl font-serif font-extrabold leading-tight mb-6">
              Healthy Food <br/> Partner
            </h1>
            <p className="text-thali-light/80 text-xl mb-8 max-w-md">
              Connecting surplus food from donors to organizations that feed the community.
            </p>
            <div className="flex space-x-4">
              <Button size="lg" className="bg-thali-gold text-thali-green hover:bg-thali-gold/90 font-bold">
                Donor: Share Food
              </Button>
              <Button size="lg" variant="outline" className="text-thali-gold border-thali-gold/50 hover:bg-thali-gold/10">
                NGO: Find Food
              </Button>
            </div>
          </div>
          
          {/* Right: Food Image Overlay */}
          <div className="absolute inset-0 z-0 opacity-20">
             {/* Replace with a background texture or pattern similar to the inspiration image */}
          </div>
          <div className="hidden md:block absolute bottom-0 right-0 w-1/2 h-1/2">
             {/* Placeholder for the large food image visual */}
             {/*  */}
          </div>
        </div>
      </section>

      {/* Continuation of the page will go here, styled with the warm brown and light backgrounds */}
    </div>
  );
}