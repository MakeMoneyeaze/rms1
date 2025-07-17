"use client";
import "../css/button.css";
import { useRouter } from "next/navigation";
import "../css/hero.css"; // Import the hero CSS file

import { useMemo } from 'react';

export default function Hero() {
  // Use useRouter at the top level (not inside useMemo)
  const router = useRouter();

  return (
    <div>
      {/* Hero Section */}
      <section className="Hero bg-[var(--background)] text-[var(--foreground)]">
        <div className="Hero-content">
          <h1 className="text-5xl font-extrabold mb-6 text-[var(--primary)]">Welcome to FoodHub</h1>
          <p className="text-xl mb-8 text-[var(--foreground)]">Experience the finest cuisine delivered right to your doorstep. Fresh ingredients, authentic flavors, and exceptional service.</p>
          <button onClick={() => router.push('/components/menu')} className="px-5 py-2 rounded-xl font-semibold shadow transition-colors duration-200 bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2" aria-label="Browse Menu">Browse Menu</button>
        </div>
      </section>
    </div>
  );
}