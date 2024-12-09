"use client";

import { useState, useEffect } from "react";
import ClientesTable from "@/components/ClientesTable";
import CitasTable from "@/components/CitasTable";
import PagosTable from "@/components/PagosTable";

export default function DashboardPage() {
  const [clientes, setClientes] = useState([]);
  const [totalClientes, setTotalClientes] = useState(0);
  const [citas, setCitas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [selectedClientes, setSelectedClientes] = useState([]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    // Fetch inicial: clientes, citas y pagos completos
    async function fetchClientes() {
      try {
        console.log("Fetching clientes...");
        const res = await fetch(
            `/api/dashboard?page=${currentPage}&pageSize=${pageSize}`
          );
        const data = await res.json();
        setClientes(data.clientes);
        setTotalClientes(data.totalClientes);
      } catch (error) {
        console.error("Error fetching clientes:", error);
      }
    }
    fetchClientes();
  }, [currentPage, pageSize]);

  useEffect(() => {
    async function fetchCitasYPagos() {
      try {
        console.log("Selected clientes",selectedClientes);
        const endpoint =
          selectedClientes.length > 0
            ? `/api/dashboard?cliente_ids=${selectedClientes.join(
                ","
              )}&page=${currentPage}&pageSize=${pageSize}`
            : `/api/dashboard?page=${currentPage}&pageSize=${pageSize}`;
  
        const res = await fetch(endpoint);
        const data = await res.json();
  
        // Si no hay clientes seleccionados, traer todo
        setCitas(data.citas || []);
        setPagos(data.pagos || []);
      } catch (error) {
        console.error("Error fetching citas y pagos:", error);
        setCitas([]);
        setPagos([]);
      }
    }
  
    fetchCitasYPagos();
  }, [selectedClientes, pageSize, currentPage]);

  return (
    <main style={{ padding: "1rem", maxWidth: "100%" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Dashboard</h1>
      <section style={{ marginTop: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Clientes</h2>
        <ClientesTable
          data={clientes}
          totalClientes={totalClientes}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newPageSize) => {
            console.log("New page size:", newPageSize);
            setPageSize(newPageSize);
            //setCurrentPage(1); // Reinicia a la página 1 si cambia el tamaño
          }}
          setSelectedClientes={setSelectedClientes}        
        />
      </section>

      <section style={{ marginTop: "2rem", display: "flex", gap: "2rem" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Citas</h2>
          <CitasTable data={citas} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Pagos</h2>
          <PagosTable data={pagos} />
        </div>
      </section>
    </main>
  );
}
