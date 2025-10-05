import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-thali-light">
      <div className="hidden lg:flex flex-col justify-center p-10 bg-thali-green text-thali-light relative overflow-hidden">
        <Link href="/" className="absolute top-10 left-10 text-3xl font-serif font-bold text-thali-gold z-10">
          ShareMyThali
        </Link>
        <div className="z-10 max-w-lg mx-auto">
          <h2 className="text-5xl font-serif font-extrabold mb-4 leading-snug">
            Your bridge to local food sharing.
          </h2>
          <p className="text-thali-light/80 text-lg">
            Join our community of donors and organizations fighting food waste together.
          </p>
        </div>
        <div className="absolute inset-0 opacity-20 bg-repeat" style={{ 
            backgroundImage: 'url(/path/to/subtle-food-pattern.svg)' 
        }} />
      </div>

      <div className="flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-lg shadow-xl border border-gray-100">
          <h1 className="text-3xl font-serif font-bold text-thali-green mb-2">{title}</h1>
          <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
};