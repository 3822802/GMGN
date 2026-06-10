import { GmApp } from "@/components/GmApp";

export default function Home() {
  return (
    <main className="cyber-page flex min-h-[100dvh] flex-col items-center justify-center px-4 py-6">
      <div className="cyber-scanline" aria-hidden />
      <div className="cyber-content w-full max-w-md">
        <GmApp />
      </div>
    </main>
  );
}
