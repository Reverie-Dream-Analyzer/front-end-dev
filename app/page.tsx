import LandingWrapper from "../components/landing-page-wrapper";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-black">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <LandingWrapper />
      </main>
    </div>
  );
}
