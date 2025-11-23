export default function Head() {
  // Use iOS/system emoji via the SVG served from /favicon.svg
  const path = '/favicon.svg';

  return (
    <>
      <link rel="icon" href={path} type="image/svg+xml" />
      <link rel="shortcut icon" href={path} />
      <link rel="apple-touch-icon" href={path} />
      <meta name="theme-color" content="#0ea5a4" />
    </>
  );
}
