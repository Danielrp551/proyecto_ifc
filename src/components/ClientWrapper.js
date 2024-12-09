"use client"; // Este archivo debe ser un componente cliente

import { usePathname } from "next/navigation";
import Layout from "@/components/Layout";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const excludedRoutes = ["/login", "/register"]; // Rutas donde no se aplicará el Layout

  // Verifica si la ruta actual está en las rutas excluidas
  const isExcluded = excludedRoutes.includes(pathname);

  return isExcluded ? children : <Layout>{children}</Layout>;
}
