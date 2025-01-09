"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Checkbox,
  Snackbar,
  Alert,
  Button,
  TablePagination,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectItem,
  FormControlLabel,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useRouter } from "next/navigation";
import { DateFilter } from "@/components/date-filter";
import SearchIcon from "@mui/icons-material/Search";
import { DateFilterv2 } from "@/components/date-filter_v2";
import { getStateInfo } from "@/app/utils/stateMapping";

export default function ClientsManagement() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [totalClients, setTotalClients] = useState(0); // Total de clientes
  const [page, setPage] = useState(0); // Página actual
  const [pageSize, setPageSize] = useState(10); // Tamaño de página
  const [filtros, setFiltros] = useState({
    estado_cliente: "vacio",
    bound: "vacio",
    search: "",
    dateRange: { from: null, to: null },
    nuevasConversaciones: false,
  }); // Filtros de búsqueda
  const [resetFilters, setResetFilters] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedPreset, setSelectedPreset] = useState("Todo");

  const router = useRouter();

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const estado =
          filtros.estado_cliente !== "" && filtros.estado_cliente !== "vacio"
            ? `&estado=${filtros.estado_cliente}`
            : "";
        const bound =
          filtros.bound !== "" && filtros.bound !== "vacio"
            ? `&bound=${filtros.bound}`
            : "";
        const search =
          filtros.search !== "" && filtros.search !== "vacio"
            ? `&search=${filtros.search}`
            : "";
        const dateRange =
          filtros.dateRange.from && filtros.dateRange.to
            ? `&fechaInicio=${filtros.dateRange.from.toISOString()}&fechaFin=${filtros.dateRange.to.toISOString()}`
            : "";
        const nuevasConversaciones = filtros.nuevasConversaciones
        ? "&nuevasConversaciones=true"
        : "";
        const response = await fetch(
          `api/clients?page=${
            page + 1
          }&pageSize=${pageSize}${estado}${bound}${search}${dateRange}${nuevasConversaciones}`
        );
        const data = await response.json();
        console.log("data : ", data);
        setClients(data.clientes);
        setTotalClients(data.totalClientes);
      } catch (err) {
        setError("No se pudieron cargar los datos de los clientes");
        setSnackbarMessage("Error al cargar clientes");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [
    page,
    pageSize,
    refresh,
    filtros.estado_cliente,
    filtros.bound,
    filtros.dateRange,
    filtros.nuevasConversaciones,
  ]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangePageSize = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0); // Reinicia a la primera página
  };

  const handleViewDetails = (id) => {
    router.push(`/clientes/${id}`); // Redirige a la página de detalles del cliente
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const handleInputChange = (field, value) => {
    setFiltros((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(0); // Reinicia a la primera página
  };

  // New function to handle date range changes
  const handleDateChange = (dateRange) => {
    setFiltros((prev) => ({
      ...prev,
      dateRange: dateRange,
    }));
  };

  return (
    <Container className="py-8">
      <Typography variant="h4" gutterBottom>
        Clientes
      </Typography>

      {loading ? (
        <Container className="flex justify-center items-center h-screen">
          <CircularProgress />
        </Container>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "column" }, // Alinea los elementos en columna en dispositivos pequeños y en fila en dispositivos medianos
              //justifyContent: "flex-start", // Alinea los elementos al final
              gap: 2, // Espaciado entre los elementos
              padding: 0, // Opcional: Añade un poco de espacio alrededor del contenedor
            }}
          >
            <Box className="flex flex-wrap gap-2 mx-0 p-0">
              <TextField
                variant="outlined"
                size="small"
                placeholder="Buscar..."
                value={filtros.search}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300, backgroundColor: "#ffffff" }}
                onChange={(e) => handleInputChange("search", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setRefresh((prev) => !prev); // Dispara la consulta solo al presionar Enter
                  }
                }}
              />
              <FormControl
                variant="outlined"
                size="small"
                sx={{ minWidth: 170 }}
              >
                <InputLabel htmlFor="estado_cliente">
                  Estado del cliente
                </InputLabel>
                <Select
                  margin="normal"
                  label="Estado del cliente"
                  value={filtros.estado_cliente}
                  onChange={(e) =>
                    handleInputChange("estado_cliente", e.target.value)
                  }
                  sx={{ backgroundColor: "#ffffff" }}
                >
                  <SelectItem value="vacio">Todos</SelectItem>
                  <SelectItem value="no interesado">Interesado con Reservas</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="seguimiento">Seguimiento</SelectItem>
                  <SelectItem value="interesado">Interesado</SelectItem>
                  <SelectItem value="promesas de pago">
                    Promesa de pago
                  </SelectItem>
                  <SelectItem value="cita agendada">Cita Agendada</SelectItem>
                </Select>
              </FormControl>
              <FormControl
                variant="outlined"
                size="small"
                sx={{ minWidth: 145 }}
              >
                <InputLabel htmlFor="bound">Tipo de Bound</InputLabel>
                <Select
                  margin="normal"
                  label="Tipo de Bound"
                  value={filtros.bound}
                  onChange={(e) => handleInputChange("bound", e.target.value)}
                  sx={{ backgroundColor: "#ffffff" }}
                >
                  <SelectItem value="vacio">Todos</SelectItem>
                  <SelectItem value="true">Inbound</SelectItem>
                  <SelectItem value="false">Outbound</SelectItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filtros.nuevasConversaciones}
                    onChange={(e) =>
                      handleInputChange("nuevasConversaciones", e.target.checked)
                    }
                    color="primary"
                  />
                }
                label="Nuevas Conversaciones"
              />
            </Box>
            <Typography variant="h6">
              Filtros de fecha de última interacción
            </Typography>
            <Box className="flex flex-wrap gap-2 mt-2 mb-2 mx-0 p-0">
              <DateFilterv2
                onDateChange={handleDateChange}
                reset={resetFilters}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                setSelectedPreset={setSelectedPreset}
                startDate={startDate}
                endDate={endDate}
                selectedPreset={selectedPreset}
              />
              <Button
                variant="contained"
                onClick={() => {
                  setFiltros({
                    estado_cliente: "vacio",
                    bound: "vacio",
                    search: "",
                    dateRange: { from: null, to: null },
                  });

                  //setResetFilters((prev) => !prev);
                  setSelectedPreset("Todo");
                  setStartDate(null);
                  setEndDate(null);
                }}
              >
                Limpiar
              </Button>
            </Box>
          </Box>
          <TableContainer className="mt-2" component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Celular</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Bound</TableCell>
                  <TableCell>Gestor</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow
                    key={client.cliente_id}
                    className={`${
                      client.gestor === ""
                        ? "bg-red-50" // Rojo claro si no está gestionado
                        : "bg-blue-50" // Azul claro si está gestionado
                    }`}
                  >
                    <TableCell>{client.nombre}</TableCell>
                    <TableCell>{client.celular}</TableCell>
                    <TableCell>{getStateInfo(client.estado).text}</TableCell>
                    <TableCell>
                      {client.bound === true ? "IN" : "OUT"}
                    </TableCell>
                    <TableCell>{client.gestor !== ""? client.gestor : " - "}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleViewDetails(client.cliente_id)}
                        startIcon={<InfoIcon />}
                        variant="outlined"
                        color="primary"
                      >
                        Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginación */}
          <TablePagination
            component="div"
            count={totalClients} // Total de clientes
            page={page}
            rowsPerPage={pageSize}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[5, 10, 20]}
            onRowsPerPageChange={handleChangePageSize}
          />
        </>
      )}
    </Container>
  );
}
