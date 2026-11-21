import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">aspieByte</h1>
      <p className="text-gray-600">
        Rebuilt foundation: Next.js, a typed database, and a real login that
        actually blocks pages until you&apos;re signed in.
      </p>
      <div className="flex justify-center gap-3">
        <Link href="/login" className="rounded border px-4 py-2">
          Log in
        </Link>
        <Link href="/signup" className="rounded bg-black px-4 py-2 text-white">
          Sign up
        </Link>
      </div>
    </main>
  );
}
