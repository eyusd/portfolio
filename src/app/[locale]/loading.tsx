export default function Loading() {
  return (
    <div className="mx-auto min-h-screen max-w-screen-xl px-6 py-12 md:px-12 md:py-20 lg:px-24 lg:py-0">
      <div className="lg:flex lg:justify-between lg:gap-4">
        <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-1/2 lg:flex-col lg:justify-between lg:py-24">
          <div className="space-y-4">
            <div className="h-10 w-64 animate-pulse rounded-md bg-muted" />
            <div className="h-6 w-32 animate-pulse rounded-md bg-muted" />
            <div className="h-20 w-80 animate-pulse rounded-md bg-muted" />
          </div>
        </header>
        <main className="pt-24 lg:w-1/2 lg:py-24 space-y-12">
          <div className="h-64 w-full animate-pulse rounded-xl bg-muted" />
          <div className="h-64 w-full animate-pulse rounded-xl bg-muted" />
        </main>
      </div>
    </div>
  );
}
