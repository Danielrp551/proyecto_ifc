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
  MenuItem,
  Chip,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getActionInfo } from "@/app/utils/actionMapping";
import { getStateInfo } from "@/app/utils/stateMapping";
import { DateFilterv2 } from "@/components/date-filter_v2";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { startOfDay, endOfDay } from "date-fns";

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
    asesor: "vacio",
    acciones: "vacio",
    search: "",
    dateRange: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
    estado_cliente: "vacio",
  });
  const [tempSearch, setTempSearch] = useState("");

  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  const [selectedPreset, setSelectedPreset] = useState("Hoy");

  const [resetFilters, setResetFilters] = useState(false);

  const [editedData, setEditedData] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [openConversationDialog, setOpenConversationDialog] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationData, setConversationData] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(0);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [commercialActionLoading, setCommercialActionLoading] = useState(false);

  const [refresh, setRefresh] = useState(false);

  const router = useRouter();

  const { data: session, status } = useSession();
  //console.log("Session: ",session);
  if (session) {
    const asesor = session.user?.asesor;
    console.log("Asesor: ", asesor);
  }

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
        const estado = filtros.estado_cliente !== "" && filtros.estado_cliente !== "vacio" ? `&estado=${filtros.estado_cliente}` : "";
        const asesor = filtros.asesor !== "" && filtros.asesor !== "vacio" ? `&asesor=${filtros.asesor}` : "";
        const dateRange =
          filtros.dateRange.from && filtros.dateRange.to
            ? `&fechaInicio=${filtros.dateRange.from.toISOString()}&fechaFin=${filtros.dateRange.to.toISOString()}`
            : "";
        const accion =
          filtros.acciones !== "" && filtros.acciones !== "vacio" ? `&accion=${filtros.acciones}` : "";
        const response = await fetch(
          `/api/gestores/clientes?page=${
            page + 1
          }&pageSize=${pageSize}${asesor}${accion}${dateRange}${search}${estado}`
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
  }, [page, pageSize, filtros, refresh]);

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

  const handleInputChangeModal = (field, value) => {
    setEditedData((prev) => ({
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

  const handleDateChange = (dateRange) => {
    setFiltros((prev) => ({
      ...prev,
      dateRange: dateRange,
    }));
    setPage(0); // Reinicia a la primera página
  };

  const handleMenuOpen = (event, client) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClient(null);
  };

  const handleAccionComercial = () => {
    setDialogTitle("Acción Comercial");
    setEditedData({
      ...selectedClient,
      nombreCompleto: selectedClient.nombre + " " + selectedClient.apellido,
    });
    fetchCommercialAction(selectedClient.cliente_id);
    setOpenDialog(true);
    handleMenuClose();
    console.log("Acción Comercial de:", selectedClient);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    //setNotes("");
    setError(false);
    setEditedData(null);
    setSelectedDate("");
    setSelectedTime("");
  };

  const handleVerDetalles = () => {
    console.log("Ver Detalles de:", selectedClient);
    // Aquí iría la lógica para navegar a la página de detalles del cliente
    if (selectedClient) {
      router.push(`/clientes/${selectedClient.cliente_id}`);
    }
    handleMenuClose();
  };

  const saveChanges = async () => {
    try {
      const body = JSON.stringify({
        nombreCompleto: editedData.nombreCompleto,
        email: editedData.email === "" ? null : editedData.email,
        observaciones: editedData.observaciones,
        notas: notes,
        gestor: editedData.gestor === " - " ? "" : editedData.gestor,
        asesorId: session.user?.asesor.asesor_id,
        acciones: editedData.acciones,
        fechaCita:
          editedData.acciones === "cita_agendada" ||
          editedData.acciones === "promesa_de_pago"
            ? selectedDate 
            : null,
        horaCita:
          editedData.acciones === "cita_agendada" ||
          editedData.acciones === "promesa_de_pago"
            ? selectedTime 
            : null,
      });
      console.log("Body guardar:", body);
      const response = await fetch(`/api/clients/${editedData.cliente_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });

      if (!response.ok) {
        throw new Error("Error al guardar los cambios.");
      }

      const data = await response.json();
      console.log("Cambios guardados:", data);

      setRefresh((prev) => !prev);
      // Cerrar el diálogo después de guardar
      handleDialogClose();
      setSnackbarMessage("Acción comercial guardada exitosamente");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error al guardar cambios:", error.message);
      setSnackbarMessage("Error al crear la acción comercial");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleSave = () => {
    if (
      (editedData.acciones === "cita_agendada" ||
        editedData.acciones === "promesa_de_pago") &&
        (!selectedDate || !selectedTime)
    ) {
      setSnackbarMessage("La fecha y hora de la cita son obligatorias");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }
  
    saveChanges();
  };

  const handleAction = (action) => {
    if (action === "comercial") {
      setDialogTitle("Acción Comercial (Cliente)");
      setOpenDialog(true);
    } else if (action === "conversacion") {
      setOpenConversationDialog(true);
      fetchConversation(selectedClient.cliente_id);
    }

    handleMenuClose();
  };

  const handleConversationDialogClose = () => {
    setOpenConversationDialog(false);
    setConversationData(null);
    setSelectedConversation(0);
  };

  const fetchConversation = async (clientId) => {
    setConversationLoading(true);
    try {
      const response = await fetch(`/api/dashboard/conversaciones/${clientId}`);
      if (!response.ok) {
        throw new Error("Error al cargar la conversación");
      }
      const data = await response.json();
      setConversationData(data.conversaciones);
      console.log("Conversación cargada:", data);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      setSnackbarMessage("Error al cargar la conversación");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setConversationLoading(false);
    }
  };

  const fetchCommercialAction = async (clientId) => {
    setCommercialActionLoading(true);
    console.log("Cliente ID:", clientId);
    try {
      // Realizar la solicitud a la API para obtener la última cita
      const response = await fetch(`/api/clients/citas/${clientId}`);
      if (!response.ok) {
        if (response.status === 404) {
          // No se encontró ninguna cita
          console.log("No hay citas agendadas o confirmadas para este cliente.");
          setSelectedDate("");
          setSelectedTime("");
          return;
        }
        throw new Error("Error al cargar la acción comercial");
      }
  
      const data = await response.json();
      console.log("Datos Acción Comercial:", data);
  
      if (data && data.fecha_cita) {
        const citaDate = new Date(data.fecha_cita);
  
        // Formatear la fecha para el input de tipo date (YYYY-MM-DD)
        const formattedDate = citaDate.toISOString().split('T')[0];
        setSelectedDate(formattedDate);
  
        // Formatear la hora para el input de tipo time (HH:MM)
        const formattedTime = citaDate.toISOString().split('T')[1].substring(0,5);
        setSelectedTime(formattedTime);
      } else {
        // Si no hay cita, limpiar los campos
        setSelectedDate("");
        setSelectedTime("");
      }
  
    } catch (error) {
      console.error("Error fetching commercial action:", error);
      setSnackbarMessage("Error al cargar la acción comercial");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setCommercialActionLoading(false);
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
                  <MenuItem value="vacio">Todos</MenuItem>
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
                  <MenuItem value="vacio">Todos</MenuItem>
                  <MenuItem value="no interesado">
                    Interesado con Reservas
                  </MenuItem>
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="seguimiento">Seguimiento</MenuItem>
                  <MenuItem value="interesado">Interesado</MenuItem>
                  <MenuItem value="promesas de pago">Promesa de pago</MenuItem>
                  <MenuItem value="promesa_pago_cancelada">Promesa de pago cancelada</MenuItem>
                  <MenuItem value="cita agendada">Cita Agendada</MenuItem>
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
                  <MenuItem value="vacio">Todos</MenuItem>
                  <MenuItem value="cita_agendada">Cita Agendada</MenuItem>
                  <MenuItem value="volver_contactar">
                    Volver a contactar
                  </MenuItem>
                  <MenuItem value="atendio_otro_lugar">
                    Atendió en otro lugar
                  </MenuItem>
                  <MenuItem value="no_interesado">No interesado</MenuItem>
                  <MenuItem value="promesa_de_pago">Promesa</MenuItem>
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
                TodoExist={false}
              />

              <Button
                variant="contained"
                onClick={() => {
                  setFiltros({
                    asesor: "vacio",
                    acciones: "vacio",
                    search: "",
                    dateRange: {
                      from: startOfDay(new Date()),
                      to: endOfDay(new Date()),
                    },
                    estado_cliente: "vacio",
                  });
                  setTempSearch("");

                  setSelectedPreset("Hoy");
                  setStartDate(startOfDay(new Date()));
                  setEndDate(endOfDay(new Date()));
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
                  <TableCell>Score</TableCell>
                  <TableCell>Acción</TableCell>
                  <TableCell>Gestor</TableCell>
                  <TableCell>Acciones</TableCell>
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
                        <TableCell>
                          {cliente.nombre + " " + cliente.apellido}
                        </TableCell>
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
                        <TableCell>{cliente.score}</TableCell>
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

                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, cliente)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
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

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleAccionComercial}>
              Acción Comercial
            </MenuItem>
            <MenuItem onClick={handleVerDetalles}>Ver Detalles</MenuItem>
            <MenuItem onClick={() => handleAction("conversacion")}>
              Ver Conversación
            </MenuItem>
          </Menu>
        </>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          { commercialActionLoading ? (
            <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 150,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          editedData && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Nombre"
                value={editedData.nombreCompleto}
                onChange={(e) =>
                  handleInputChangeModal("nombreCompleto", e.target.value)
                }
              />
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                value={editedData.email || ""}
                onChange={(e) =>
                  handleInputChangeModal("email", e.target.value)
                }
              />
              <TextField
                fullWidth
                margin="normal"
                label="Teléfono"
                value={editedData.celular}
                InputProps={{ readOnly: true }}
              />
              <FormControl fullWidth variant="outlined" size="medium">
                <InputLabel htmlFor="gestor">Gestor</InputLabel>
                <Select
                  fullWidth
                  label="Gestor"
                  margin="normal"
                  value={editedData.gestor === "" ? " - " : editedData.gestor}
                  onChange={(e) =>
                    handleInputChangeModal("gestor", e.target.value)
                  }
                >
                  <MenuItem value=" - ">Sin gestor asignado</MenuItem>
                  {gestores.map((gestor) => (
                    <MenuItem
                      key={gestor.asesor_id}
                      value={gestor.nombre + " " + gestor.primer_apellido}
                    >
                      {gestor.nombre} {gestor.primer_apellido}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                margin="normal"
                label="Observaciones"
                value={editedData.observaciones || ""}
                multiline
                rows={4}
                onChange={(e) =>
                  handleInputChangeModal("observaciones", e.target.value)
                }
              />
              <FormControl fullWidth variant="outlined" size="medium">
                <InputLabel htmlFor="acciones">Acciones</InputLabel>
                <Select
                  fullWidth
                  label="Acciones"
                  margin="normal"
                  value={editedData.acciones}
                  onChange={(e) =>
                    handleInputChangeModal("acciones", e.target.value)
                  }
                >
                  <MenuItem value="vacio">Todos</MenuItem>
                  <MenuItem value="cita_agendada">Cita Agendada</MenuItem>
                  <MenuItem value="volver_contactar">
                    Volver a contactar
                  </MenuItem>
                  <MenuItem value="atendio_otro_lugar">
                    Atendió en otro lugar
                  </MenuItem>
                  <MenuItem value="no_interesado">No Interesado</MenuItem>
                  <MenuItem value="promesa_de_pago">Promesa</MenuItem>
                </Select>
              </FormControl>
              {(editedData.acciones === "cita_agendada" ||
                  editedData.acciones === "promesa_de_pago") && (
                  <>
                    <TextField
                      fullWidth
                      margin="normal"
                      type="date"
                      label="Fecha de la cita"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      type="time"
                      label="Hora de la cita"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                    />
                  </>
                )}
            </>
          ))
        }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cerrar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openConversationDialog}
        onClose={handleConversationDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Conversación del Cliente</DialogTitle>
        <DialogContent>
          {conversationLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <CircularProgress />
            </div>
          ) : conversationData ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper elevation={2} className="p-4">
                  <Typography variant="subtitle1" gutterBottom>
                    Historial de Conversaciones
                  </Typography>
                  <List>
                    {conversationData.map((conv, index) => (
                      <ListItem
                        key={conv.conversacion_id}
                        button="true"
                        selected={selectedConversation === index}
                        onClick={() => setSelectedConversation(index)}
                      >
                        <ListItemText
                          primary={`Conversación ${index + 1}`}
                          secondary={new Date(
                            conv.ultima_interaccion
                          ).toLocaleString()}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper elevation={2} className="p-4 h-[500px] overflow-y-auto">
                  {conversationData[selectedConversation]?.interacciones.map(
                    (message, index) => (
                      <React.Fragment
                        key={message._id || `interaccion-${index}`}
                      >
                        {/* Mensaje del cliente */}
                        {message.mensaje_cliente && (
                          <Box className="mb-4 flex justify-end">
                            <Box className="p-3 rounded-lg max-w-[70%] bg-green-100 text-green-800">
                              <Typography variant="body1">
                                {message.mensaje_cliente}
                              </Typography>
                              <Typography
                                variant="caption"
                                className="mt-1 text-gray-500"
                              >
                                {message.fecha
                                  ? new Date(message.fecha).toLocaleString(
                                      "es-ES",
                                      {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                  : "Fecha no disponible"}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Mensaje del chatbot */}
                        {message.mensaje_chatbot &&
                          message.mensaje_chatbot
                            .split("|")
                            .map((botMessage, index) => (
                              <Box
                                key={`bot-message-${index}`}
                                className="mb-4 flex justify-start"
                              >
                                <Box className="p-3 rounded-lg max-w-[70%] bg-blue-100 text-blue-800">
                                  <Typography variant="body1">
                                    {botMessage.trim()}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    className="mt-1 text-gray-500"
                                  >
                                    {message.fecha
                                      ? new Date(message.fecha).toLocaleString(
                                          "es-ES",
                                          {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        )
                                      : "Fecha no disponible"}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                      </React.Fragment>
                    )
                  )}
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Typography>No hay datos de conversación disponibles.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConversationDialogClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GestoresPage;
