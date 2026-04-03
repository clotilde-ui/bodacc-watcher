import "./globals.css";

export const metadata = {
  title: "BODACC Watcher — Transferts de siège",
  description: "Veille automatique des changements d'adresse publiés au BODACC",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
