import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="p-4 border-b border-slate-800 flex gap-4 text-sm">
          <Link href="/">Home</Link>
          <Link href="/auth/signup">Sign up</Link>
          <Link href="/auth/signin">Sign in</Link>
          <Link href="/organizer/campaigns/new">New Campaign</Link>
          <Link href="/organizer/events/new">New Event</Link>
          <Link href="/staff/checkin">Check-in</Link>
          <Link href="/ref/incidents">Incidents</Link>
        </header>
        <main className="p-6 max-w-4xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
