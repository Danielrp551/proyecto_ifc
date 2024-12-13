"use client";

import { useState, useEffect } from "react";
import ClientesTable from "@/components/ClientesTable";
import CitasTable from "@/components/CitasTable";
import PagosTable from "@/components/PagosTable";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormControl, Box, InputLabel, Select, MenuItem as SelectItem, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function DashboardPage() {
  const [clientes, setClientes] = useState([]);
  const [totalClientes, setTotalClientes] = useState(0);
  const [citas, setCitas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [selectedClientes, setSelectedClientes] = useState([]);
  const [refresh, setRefresh] = useState(false); // Actualiza la tabla de clientes

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // filtros
  const [filtros, setFiltros] = useState({ estado_cliente: "vacio", bound: "vacio",search: "" });

  const { data: session, status } = useSession();
  //console.log("Session: ",session);
  if (session) {
    const asesor = session.user?.asesor;
    console.log("Asesor: ", asesor);
  }

  useEffect(() => {
    // Restablecer la página a 1 cuando los filtros cambien
    setCurrentPage(1);
  }, [filtros]);

  useEffect(() => {
    // Fetch inicial: clientes, citas y pagos completos
    async function fetchClientes() {
      try {
        console.log("Fetching clientes...");
        const bound = (filtros.bound !== "" && filtros.bound !=="vacio") ? `&bound=${filtros.bound}` : "";
        const search = (filtros.search !== "" && filtros.search !=="vacio") ? `&search=${filtros.search}` : "";
        const res = await fetch(
          `/api/dashboard?page=${currentPage}&pageSize=${pageSize}${(filtros.estado_cliente !== "" && filtros.estado_cliente !=="vacio") ? `&estado=${filtros.estado_cliente}` : ""}${bound}${search}`
        );
        const data = await res.json();
        setClientes(data.clientes);
        setTotalClientes(data.totalClientes);
      } catch (error) {
        console.error("Error fetching clientes:", error);
      }
    }
    fetchClientes();
  }, [currentPage, pageSize, refresh, filtros.estado_cliente, filtros.bound]);

  useEffect(() => {
    async function fetchCitasYPagos() {
      try {
        console.log("Selected clientes", selectedClientes);
        const estado = (filtros.estado_cliente !== "" && filtros.estado_cliente !=="vacio") ? `&estado=${filtros.estado_cliente}` : "";
        const bound = (filtros.bound !== "" && filtros.bound !=="vacio") ? `&bound=${filtros.bound}` : "";
        const search = (filtros.search !== "" && filtros.search !=="vacio") ? `&search=${filtros.search}` : "";
        const endpoint =
          selectedClientes.length > 0
            ? `/api/dashboard?cliente_ids=${selectedClientes.join(
              ","
            )}&page=${currentPage}&pageSize=${pageSize}${estado}`
            : `/api/dashboard?page=${currentPage}&pageSize=${pageSize}${estado}${bound}${search}`;

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
  }, [selectedClientes, pageSize, currentPage, refresh, filtros.estado_cliente, filtros.bound]);

  const handleInputChange = (field, value) => {
    setFiltros((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    useRouter().push("/login"); // Redirige al usuario a la página de login
    return null; // Evita renderizar contenido adicional
  }

  if (!session.user?.asesor) {
    return <div>Error: No se encontró la información del asesor.</div>;
  }

  return (
    <main style={{ padding: "1rem", maxWidth: "100%" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Dashboard</h1>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start", // Alinea los elementos al final
          gap: 2, // Espaciado entre los elementos
          padding: 1, // Opcional: Añade un poco de espacio alrededor del contenedor
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250, backgroundColor: "#ffffff", }}
          onChange={(e) => handleInputChange("search", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setRefresh((prev) => !prev); // Dispara la consulta solo al presionar Enter
            }
          }}
        />
        <FormControl variant="outlined" size="small">
          <InputLabel htmlFor="estado_cliente">Estado del cliente</InputLabel>
          <Select
            margin="normal"
            label="Estado del cliente"
            value={filtros.estado_cliente}
            onChange={(e) => handleInputChange("estado_cliente", e.target.value)}
            sx={{backgroundColor: "#ffffff",}}
          >
            <SelectItem value="vacio">Todos</SelectItem>
            <SelectItem value="no interesado">No interesado</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="seguimiento">Seguimiento</SelectItem>
            <SelectItem value="interesado">Interesado</SelectItem>
            <SelectItem value="promesas de pago">Promesa de pago</SelectItem>
            <SelectItem value="cita agendada">Cita Agendada</SelectItem>
          </Select>
        </FormControl>
        <FormControl variant="outlined" size="small">
          <InputLabel htmlFor="bound">Tipo de Bound</InputLabel>
          <Select
            margin="normal"
            label="Tipo de Bound"
            value={filtros.bound}
            onChange={(e) => handleInputChange("bound", e.target.value)}
            sx={{backgroundColor: "#ffffff",}}
          >
            <SelectItem value="vacio">Todos</SelectItem>
            <SelectItem value="inbound">Inbound</SelectItem>
            <SelectItem value="outbound">Outbound</SelectItem>
          </Select>
        </FormControl>        
      </Box>
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
          asesor={session.user.asesor}
          setRefresh={() => setRefresh((prev) => !prev)}
        />
      </section>

      <section style={{ marginTop: "2rem", display: "flex", gap: "2rem" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Citas</h2>
          <CitasTable data={citas} asesor={session.user.asesor} setRefresh={() => setRefresh((prev) => !prev)} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Pagos</h2>
          <PagosTable data={pagos} asesor={session.user.asesor} setRefresh={() => setRefresh((prev) => !prev)} />
        </div>
      </section>
    </main>
  );
}
