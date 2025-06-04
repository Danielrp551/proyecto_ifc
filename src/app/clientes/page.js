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
  FormControlLabel,
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
    Chip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useRouter } from "next/navigation";
import { DateFilter } from "@/components/date-filter";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import { DateFilterv2 } from "@/components/date-filter_v2";
import { getStateInfo } from "@/app/utils/stateMapping";
import { endOfDay, startOfDay, differenceInHours } from "date-fns";
import { useSession } from "next-auth/react";
import { getScoreInfo } from "../utils/scoreMapping";
import ModalTomarControlCliente from "@/components/ModalTomarControlCliente";

export default function ClientsManagement() {
  const [clients, setClients] = useState([]);
   const [gestores, setGestores] = useState([]);
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
    dateRange: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
    nuevasConversaciones: false,
  }); // Filtros de búsqueda
  const [resetFilters, setResetFilters] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedPreset, setSelectedPreset] = useState("Hoy");

  const [editedData, setEditedData] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);

  const [openConversationDialog, setOpenConversationDialog] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationData, setConversationData] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [commercialActionLoading, setCommercialActionLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

  const [openModalTomarControl, setOpenModalTomarControl] = useState(false);
const [selectedClienteId, setSelectedClienteId] = useState(null);

  const router = useRouter();

  const { data: session, status } = useSession();
  //console.log("Session: ",session);
  if (session) {
    const asesor = session.user?.asesor;
    console.log("Asesor: ", asesor);
  }

  const isHabilitado = session?.user?.asesor.asesor_id === 8 || session?.user?.asesor.asesor_id === 13 || session?.user?.rol === "admin" || session?.user?.rol === "admin_general";


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
          }&pageSize=${pageSize}${estado}${bound}${search}${dateRange}${"&nuevasConversaciones=true"}`
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

  useEffect(() => {
    const fetchGestores = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/gestores?`);
        const data = await response.json();
        console.log("data", data);
        setGestores(data.asesores);
      } catch (err) {
        setError("Error al cargar los datos de los gestores");
        setSnackbarMessage("Error al cargar gestores");
        setOpenSnackbar(true);
        console.error("Error al cargar los gestores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGestores();
  }, []);

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
    setOpenDialog(true);
    fetchCommercialAction(selectedClient.cliente_id);
    handleMenuClose();
    console.log("Acción Comercial de:", selectedClient);
  };

  const handleVerDetalles = () => {
    console.log("Ver Detalles de:", selectedClient);
    // Aquí iría la lógica para navegar a la página de detalles del cliente
    if (selectedClient) {
      router.push(`/clientes/${selectedClient.cliente_id}`);
    }
    handleMenuClose();
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

  const handleDialogClose = () => {
    setOpenDialog(false);
    //setNotes("");
    setError(false);
    setEditedData(null);
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
        num_intentos: editedData.num_intentos,
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

  const handleInputChangeModal = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchCommercialAction = async (clientId) => {
    setCommercialActionLoading(true);
    try {
      const response = await fetch(`/api/clients/citas/${clientId}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.log("No hay citas agendadas o confirmadas para este cliente.");
          setSelectedDate("");
          setSelectedTime("");
          setEditedData({
            ...selectedClient,
            nombreCompleto: `${selectedClient.nombre} ${selectedClient.apellido}`.trim(),
          });
          return;
        }
        throw new Error("Error al cargar la acción comercial");
      }
  
      const data = await response.json();
      console.log("Datos Acción Comercial:", data);
  
      if (data && data.fecha_cita) {
        const citaDate = new Date(data.fecha_cita);
        const formattedDate = citaDate.toISOString().split("T")[0]; // YYYY-MM-DD
        const formattedTime = citaDate.toISOString().split("T")[1].substring(0, 5); // HH:MM
        setSelectedDate(formattedDate);
        setSelectedTime(formattedTime);
      } else {
        setSelectedDate("");
        setSelectedTime("");
      }
  
      // Luego asigna los datos del cliente en editedData
      setEditedData({
        ...selectedClient,
        nombreCompleto: `${selectedClient.nombre} ${selectedClient.apellido}`.trim(),
      });
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
                  <MenuItem value="vacio">Todos</MenuItem>
                  <MenuItem value="no interesado">
                    Interesado con Reservas
                  </MenuItem>
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="seguimiento">Seguimiento</MenuItem>
                  <MenuItem value="interesado">Interesado</MenuItem>
                  <MenuItem value="promesas de pago">Promesa de pago</MenuItem>
                  <MenuItem value="promesa_pago_cancelada">
                    Promesa de pago cancelada
                  </MenuItem>
                  <MenuItem value="cita agendada">Cita Agendada</MenuItem>
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
                  <MenuItem value="vacio">Todos</MenuItem>
                  <MenuItem value="true">Inbound</MenuItem>
                  <MenuItem value="false">Outbound</MenuItem>
                </Select>
              </FormControl>
              {/*
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
                */}
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
                TodoExist={false}
              />
              <Button
                variant="contained"
                onClick={() => {
                  setFiltros({
                    estado_cliente: "vacio",
                    bound: "vacio",
                    search: "",
                    dateRange: {
                      from: startOfDay(new Date()),
                      to: endOfDay(new Date()),
                    },
                  });

                  //setResetFilters((prev) => !prev);
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
                  <TableCell>Celular</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Score</TableCell>
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
                    <TableCell>
                      <Chip
                        label={getStateInfo(client.estado).text}
                        sx={{
                          backgroundColor: getStateInfo(client.estado).color,
                          color: getStateInfo(client.estado).textColor,
                          fontWeight: "medium",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getScoreInfo(client.score).text}
                        sx={{
                          backgroundColor: getScoreInfo(client.score).color,
                          color: getScoreInfo(client.score).textColor,
                          fontWeight: "medium",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {client.bound === true ? "IN" : "OUT"}
                    </TableCell>
                    <TableCell>
                      {client.gestor !== "" ? client.gestor : " - "}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, client)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
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
            {isHabilitado && (
              <MenuItem
              onClick={() => {
                setSelectedClienteId(selectedClient.cliente_id);
                setOpenModalTomarControl(true);
                handleMenuClose();
              }}
            >
              Tomar Control del Cliente
            </MenuItem>
            )}
            
          </Menu>
        </>
      )}

      <ModalTomarControlCliente
        open={openModalTomarControl}
        onClose={() => setOpenModalTomarControl(false)}
        clienteId={selectedClienteId}
        asesorId={session?.user?.asesor?.asesor_id}
        onSuccess={() => {
          setOpenSnackbar(true);
          setSnackbarMessage("Ahora estás a cargo de este cliente.");
          setSnackbarSeverity("success");
          setRefresh(prev => !prev); 
        }}
      />

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          {commercialActionLoading ? (
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
                <TextField
                  fullWidth
                  margin="normal"
                  label="Número de contactos"
                  type="number"
                  value={editedData.num_intentos ?? 0}
                  onChange={(e) =>
                    handleInputChangeModal("num_intentos", e.target.value)
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
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cerrar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={commercialActionLoading}
          >
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
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
