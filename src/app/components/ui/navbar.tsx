"use client";
import "../css/button.css";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  cartCount?: number;
  isAuthenticated?: boolean;
  onCartClick?: () => void;
}

export default function Navbar({ cartCount = 0, isAuthenticated = false, onCartClick }: NavbarProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    console.log("Login button clicked - redirecting to /login");
    router.push('/login');
  };

  const handleSignup = () => {
    console.log("Signup button clicked - redirecting to /signup");
    router.push('/signup');
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      // If not authenticated, trigger the alert callback
      if (onCartClick) {
        onCartClick();
      }
      return;
    }
    
    // If authenticated, navigate to cart page
    router.push('/cart');
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar bg-[var(--background)] text-[var(--foreground)] shadow" style={{background: 'var(--background)', color: 'var(--foreground)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">🍽️</span>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--foreground)] to-[var(--primary-dark)] bg-clip-text text-transparent">
                    FoodHub
                  </h1>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                <a
                  href="#"
                  className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"
                >
                  <span className="relative z-10">Home</span>
                </a>
                <a
                  href="#menu"
                  className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"
                >
                  <span className="relative z-10">Menu</span>
                </a>
                <a
                  href="#about"
                  className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"
                >
                  <span className="relative z-10">About</span>
                </a>
                <a
                  href="#contact"
                  className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"
                >
                  <span className="relative z-10">Contact</span>
                </a>
                <button className="px-5 py-2 rounded-xl font-semibold shadow transition-colors duration-200 bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ml-4" onClick={handleLogin}>
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Login</span>
                  </span>
                </button>
                <button className="px-5 py-2 rounded-xl font-semibold shadow transition-colors duration-200 bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ml-4" onClick={handleSignup}>
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Signup</span>
                  </span>
                </button>
                <button className="px-5 py-2 rounded-xl font-semibold shadow transition-colors duration-200 bg-[var(--accent)] text-white hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ml-4" onClick={() => router.push('/admin/login')}>
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Admin</span>
                  </span>
                </button>
              </div>
            </div>

            {/* User Menu */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-4">
                {/* Cart */}
                <button 
                  onClick={handleCartClick}
                  className={`relative p-2 transition-colors duration-200 ${
                    isAuthenticated 
                      ? 'text-gray-600 hover:text-orange-600' 
                      : 'text-gray-400 hover:text-orange-600 cursor-pointer'
                  }`}
                  title={isAuthenticated ? "View cart" : "Please login to access cart"}
                >
                  <span className="sr-only">View cart</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartCount > 0 && isAuthenticated && (
                    <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-orange-500 text-white text-xs font-medium flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>

                
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-200"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-sm rounded-b-xl shadow-lg">
              <a
                href="#"
                className="text-gray-900 block px-4 py-3 rounded-lg text-base font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200"
              >
                Home
              </a>
              <a
                href="#menu"
                className="text-gray-600 hover:text-orange-600 block px-4 py-3 rounded-lg text-base font-medium hover:bg-orange-50 transition-colors duration-200"
              >
                Menu
              </a>
              <button
                className="text-gray-600 hover:text-orange-600 block px-4 py-3 rounded-lg text-base font-medium hover:bg-orange-50 transition-colors duration-200 w-full text-left"
                onClick={() => { setIsMobileMenuOpen(false); router.push('/components/Orders'); }}
                type="button"
              >
                Your order's
              </button>
              <a
                href="#about"
                className="text-gray-600 hover:text-orange-600 block px-4 py-3 rounded-lg text-base font-medium hover:bg-orange-50 transition-colors duration-200"
              >
                About
              </a>
              <a
                href="#contact"
                className="text-gray-600 hover:text-orange-600 block px-4 py-3 rounded-lg text-base font-medium hover:bg-orange-50 transition-colors duration-200"
              >
                Contact
              </a>
              <div className="px-4 py-3 space-y-3">
                <button className="button w-full" onClick={handleLogin}>
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Login</span>
                  </span>
                </button>
                <button className="button button-secondary w-full" onClick={handleSignup}>
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Signup</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}