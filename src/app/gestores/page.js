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
  MenuItem as SelectItem,
  FormControlLabel,
  Tab,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";

const GestoresPage = () => {
  const [gestores, setGestores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalGestores, setTotalGestores] = useState(0);
  const [filtros, setFiltros] = useState({
    estado_gestor: "vacio",
    search: "",
    nuevosGestores: false,
  });
  const [tempSearch, setTempSearch] = useState("");

  useEffect(() => {
    const fetchGestores = async () => {
      setLoading(true);
      try {
        const search =
          filtros.search !== "" && filtros.search !== "vacio"
            ? `&search=${filtros.search}`
            : "";

        const response = await fetch(
          `/api/gestores?page=${page + 1}&pageSize=${pageSize}${search}`
        );
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
              <Button
                variant="contained"
                onClick={() => {
                  setFiltros({
                    estado_gestor: "vacio",
                    search: "",
                    nuevosGestores: false,
                  });
                  setTempSearch("");
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
                  <TableCell>Número de leads</TableCell>
                  {/*<TableCell>Acciones</TableCell>*/}
                </TableRow>
              </TableHead>
              <TableBody>
                {gestores.length > 0 ? (
                  gestores.map((gestor) => (
                    <TableRow key={gestor.asesor_id}>
                      <TableCell>
                        {gestor.nombre + " " + gestor.primer_apellido}
                      </TableCell>
                      <TableCell>{gestor.celular}</TableCell>
                      <TableCell>{gestor.num_leads}</TableCell>
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No se encontraron gestores
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalGestores}
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
