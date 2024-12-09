import "./globals.css"; // Importa los estilos globales aquí
import ClientWrapper from "@/components/ClientWrapper";

export const metadata = {
  title: "Tu App",
  description: "Descripción de tu aplicación",
};

export default function RootLayout({ children }) {

  return (
    <html lang="es">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
