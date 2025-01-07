"use client";

import React, { useState, useEffect } from "react";
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
  MenuItem ,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getActionInfo } from "@/app/utils/actionMapping";
import { getStateInfo } from "@/app/utils/stateMapping";
import { DateFilterv2 } from "@/components/date-filter_v2";

const GestoresPage = () => {
  const [gestores, setGestores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalGestores, setTotalGestores] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [filtros, setFiltros] = useState({
    asesor: "",
    acciones: "",
    search: "",
    dateRange: { from: null, to: null },
  });
  const [tempSearch, setTempSearch] = useState("");

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedPreset, setSelectedPreset] = useState("Todo");

  const [resetFilters, setResetFilters] = useState(false);

  useEffect(() => {
    const fetchGestores = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/gestores?`);
        const data = await response.json();
        console.log("data", data);
        setGestores(data.asesores);
        setTotalGestores(data.totalAsesores);
      } catch (err) {
        setError("Error al cargar los datos de los gestores");
        setSnackbarMessage("Error al cargar gestores");
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    fetchGestores();
  }, []);

  useEffect(() => {
    const fetchClientesGestores = async () => {
      setLoading(true);
      try {
        const search = filtros.search !== "" ? `&search=${filtros.search}` : "";
        const asesor = filtros.asesor !== "" ? `&asesor=${filtros.asesor}` : "";
        const dateRange = filtros.dateRange.from && filtros.dateRange.to
          ? `&fechaInicio=${filtros.dateRange.from.toISOString()}&fechaFin=${filtros.dateRange.to.toISOString()}`
          : "";
        const accion =
          filtros.acciones !== "" ? `&accion=${filtros.acciones}` : "";
        const response = await fetch(
          `/api/gestores/clientes?page=${
            page + 1
          }&pageSize=${pageSize}${asesor}${accion}${dateRange}${search}`
        );
        const data = await response.json();
        console.log("data clientes gestores", data);
        setClientes(data.clientes);
        setTotalClientes(data.totalClientes);
      } catch (err) {
        console.error("Error al cargar los datos de los clientes:", err);
        setError("Error al cargar los datos de los clientes");
        setSnackbarMessage("Error al cargar clientes");
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    fetchClientesGestores();
  }, [page, pageSize, filtros]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangePageSize = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleInputChange = (field, value) => {
    setFiltros((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(0); // Reinicia a la primera página
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  const handleSearchEnter = (e) => {
    if (e.key === "Enter") {
      setFiltros((prev) => ({
        ...prev,
        search: tempSearch, // Aplicar el valor del input solo al presionar Enter
      }));
      setPage(0); // Reinicia a la primera página
    }
  };

  const handleDateChange = (dateRange) => {
    setFiltros((prev) => ({
      ...prev,
      dateRange: dateRange,
    }));
    setPage(0); // Reinicia a la primera página
  };

  return (
    <Container className="py-8">
      <Typography variant="h4" gutterBottom>
        Gestores
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
              flexDirection: { xs: "column", md: "column" },
              gap: 2,
              padding: 0,
            }}
          >
            <Box className="flex flex-wrap gap-2 mx-0 p-0">
              <TextField
                variant="outlined"
                size="small"
                placeholder="Buscar gestor..."
                value={tempSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300, backgroundColor: "#ffffff" }}
                onChange={(e) => setTempSearch(e.target.value)}
                onKeyDown={handleSearchEnter}
              />
              <FormControl
                variant="outlined"
                size="small"
                sx={{ minWidth: 200 }}
              >
                <InputLabel htmlFor="gestor">Gestor</InputLabel>
                <Select
                  margin="normal"
                  label="Gestor"
                  value={filtros.asesor}
                  onChange={(e) => handleInputChange("asesor", e.target.value)}
                  sx={{ backgroundColor: "#ffffff" }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {gestores.map((gestor) => (
                    <MenuItem
                      key={gestor.asesor_id}
                      value={gestor.nombre + " " + gestor.primer_apellido}
                    >
                      {gestor.nombre + " " + gestor.primer_apellido}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl
                variant="outlined"
                size="small"
                sx={{ minWidth: 200 }}
              >
                <InputLabel htmlFor="acciones">Acción comercial</InputLabel>
                <Select
                  margin="normal"
                  label="Acción comercial"
                  value={filtros.acciones}
                  onChange={(e) =>
                    handleInputChange("acciones", e.target.value)
                  }
                  sx={{ backgroundColor: "#ffffff" }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="cita_agendada">Cita Agendada</MenuItem>
                  <MenuItem value="volver_contactar">
                    Volver a contactar
                  </MenuItem>
                  <MenuItem value="atendio_otro_lugar">
                    Atendió en otro lugar
                  </MenuItem>
                  <MenuItem value="no_interesado">No interesado</MenuItem>
                </Select>
              </FormControl>

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
                    asesor: "",
                    acciones: "",
                    search: "",
                    dateRange: { from: null, to: null },
                  });
                  setTempSearch("");

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
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acción</TableCell>
                  <TableCell>Gestor</TableCell>
                  {/*<TableCell>Acciones</TableCell>*/}
                </TableRow>
              </TableHead>
              <TableBody>
                {clientes.length > 0 ? (
                  clientes.map((cliente) => {
                    const actionInfo = getActionInfo(cliente.acciones);
                    const stateInfo = getStateInfo(cliente.estado);
                    return (
                      <TableRow
                        key={cliente.cliente_id}
                        className={`${
                          cliente.gestor === ""
                            ? "bg-red-50" // Rojo claro si no está gestionado
                            : "bg-blue-50" // Azul claro si está gestionado
                        }`}
                      >
                        <TableCell>{cliente.nombre + " " + cliente.apellido}</TableCell>
                        <TableCell>{cliente.celular}</TableCell>
                        <TableCell>
                          <Chip
                            label={stateInfo.text}
                            sx={{
                              backgroundColor: stateInfo.color,
                              color: stateInfo.textColor,
                              fontWeight: "medium",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={actionInfo.text}
                            sx={{
                              backgroundColor: actionInfo.color,
                              color: actionInfo.textColor,
                              fontWeight: "medium",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {cliente.gestor === "" ? " - " : cliente.gestor}
                        </TableCell>
                        {/*
                      <TableCell>
                        <Button
                          startIcon={<InfoIcon />}
                          variant="outlined"
                          color="primary"
                        >
                          Ver Detalles
                        </Button>
                      </TableCell>
                      */}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No se encontraron clientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalClientes}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[5, 10, 20]}
            onRowsPerPageChange={handleChangePageSize}
          />
        </>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default GestoresPage;
