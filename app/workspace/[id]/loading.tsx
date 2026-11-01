// Suspense fallback for the dynamic workspace route (enables immediate,
// partial-prefetch navigation while the server resolves the route).
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
      <div className="h-8 w-48 animate-pulse rounded bg-mist" />
      <div className="mt-8 h-6 w-full max-w-sm animate-pulse rounded bg-mist" />
      <div className="mt-4 h-4 w-full animate-pulse rounded bg-mist" />
    </main>
  );
}