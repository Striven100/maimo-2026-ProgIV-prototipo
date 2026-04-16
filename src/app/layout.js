import "./globals.css";

export const metadata = {
  title: "ProgIV - Organizador Académico",
  description: "Organizador académico colaborativo y gamificado",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
