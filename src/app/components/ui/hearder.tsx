export default function Header() {
  return (
    <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-[var(--background)] text-[var(--foreground)]">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] bg-clip-text text-transparent mb-6">
          Welcome to RMS
        </h2>
        <p className="text-xl font-medium text-[var(--foreground)] max-w-2xl mx-auto leading-relaxed">
          Your modern resource management system with beautiful design and powerful features.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <button className="px-5 py-2 rounded-xl font-semibold shadow transition-colors duration-200 bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2">
            Get Started
          </button>
          <button className="px-5 py-2 rounded-xl font-semibold shadow transition-colors duration-200 bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2">
            Learn More
          </button>
        </div>
      </div>
    </main>
  );
}

