import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-xl font-bold mb-4">404 — Entry missing</h1>
      <p className="text-zinc-500 text-sm max-w-xs mb-8">
        L'entrée demandée n'existe pas dans mes archives personnelles.
      </p>
      <Link 
        href="/" 
        className="text-xs font-mono underline underline-offset-4 hover:opacity-70"
      >
        BACK_TO_INDEX
      </Link>
    </div>
  );
}
