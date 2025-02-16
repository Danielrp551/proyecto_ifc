"use client";

import { useState, useEffect, act } from "react";
import {
  Container,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  Menu,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  TablePagination,
  IconButton,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InfoIcon from "@mui/icons-material/Info";
import { stateMapping } from "../utils/stateMapping";
import { DateFilterv2 } from "@/components/date-filter_v2";
import { endOfDay, startOfDay } from "date-fns";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openOutCampaignDialog, setOpenOutCampaignDialog] = useState(false);
  const [openTemplatePreviewDialog, setOpenTemplatePreviewDialog] =
    useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [newCampaign, setNewCampaign] = useState({
    nombre_campa_a: "",
    descripcion: "",
    estado_campaña: "activa",
    mensaje_cliente: "",
    num_clientes: 0,
    fecha_inicio: null,
    fecha_fin: null,
    tipo: "in",
  });
  const [dialogMode, setDialogMode] = useState("create");
  const [createCampaign, setCreateCampaign] = useState(false);
  const [currentCampaignId, setCurrentCampaignId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [campaignTypeFilter, setCampaignTypeFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedPreset, setSelectedPreset] = useState("Hoy");
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  const [resetFilters, setResetFilters] = useState(false);
  const [outCampaignData, setOutCampaignData] = useState({
    nombre_campa_a: "",
    descripcion: "",
    clientStates: [],
    timeRange: "today",
    clientType: "in",
    considerPreviouslyContacted: false,
    selectedTemplate: "",
    dateRange: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
    activationType: "now",
    activationDate: startOfDay(new Date()),
  });

  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchCampaigns();
  }, [campaignTypeFilter, page, pageSize]); //This line was flagged as needing fewer dependencies

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const tipoParam =
        campaignTypeFilter === "all" ? "" : `tipo=${campaignTypeFilter}`;
        const response = await fetch(
            `/api/campaigns?${tipoParam}&page=${page + 1}&pageSize=${pageSize}`
          );
      const data = await response.json();
      setCampaigns(data.campaigns);
      setTotalCount(data.totalCount);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch campaigns");
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
      const data = await response.json();
      console.log("Templates : ", data);
      setTemplates(data.templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const validateFields = () => {
    const newErrors = {};
    if (!newCampaign.nombre_campa_a.trim()) {
      newErrors.nombre_campa_a = "Este campo es obligatorio";
    }
    if (!newCampaign.mensaje_cliente.trim()) {
      newErrors.mensaje_cliente = "Este campo es obligatorio";
    }
    if (!newCampaign.fecha_inicio) {
      newErrors.fecha_inicio = "Debe seleccionar una fecha de inicio";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOutCampaignFields = () => {
    const newErrors = {};

    if (!outCampaignData.nombre_campa_a.trim()) {
      newErrors.nombre_campa_a = "Este campo es obligatorio";
    }
    if (!outCampaignData.descripcion.trim()) {
      newErrors.descripcion = "Este campo es obligatorio";
    }
    if (outCampaignData.clientStates.length === 0) {
      newErrors.clientStates =
        "Debes seleccionar al menos un estado de cliente";
    }
    if (!outCampaignData.timeRange) {
      newErrors.timeRange = "Selecciona un rango de tiempo";
    }
    if (outCampaignData.timeRange === "custom") {
      if (!outCampaignData.customDateRange.start) {
        newErrors.customDateRangeStart = "Selecciona una fecha de inicio";
      }
      if (!outCampaignData.customDateRange.end) {
        newErrors.customDateRangeEnd = "Selecciona una fecha de fin";
      }
    }
    if (!outCampaignData.clientType) {
      newErrors.clientType = "Selecciona un tipo de cliente";
    }
    if (!outCampaignData.selectedTemplate) {
      newErrors.selectedTemplate = "Selecciona un template";
    }
    if(!outCampaignData.activationType){
      newErrors.activationType = "Selecciona una fecha de activación";
    }
    if(!outCampaignData.activationDate){
      newErrors.activationDate = "Selecciona una fecha de activación";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenDialog = (type) => {
    setDialogMode("create");
    setErrors({});
    if (type === "out") {
      setOpenOutCampaignDialog(true);
    } else {
      setOpenDialog(true);
      setNewCampaign({
        nombre_campa_a: "",
        descripcion: "",
        estado_campaña: "activa",
        mensaje_cliente: "",
        num_clientes: 0,
        fecha_inicio: null,
        fecha_fin: null,
        tipo: "in",
      });
    }
    setCreateCampaign(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenOutCampaignDialog(false);
  };

  const handleEditDialog = (campaign) => {
    setDialogMode("edit");
    setErrors({});
    setOpenDialog(true);
    setNewCampaign({
      nombre_campa_a: campaign.nombre_campa_a,
      descripcion: campaign.descripcion,
      estado_campaña: campaign.estado_campa_a,
      mensaje_cliente: campaign.mensaje_cliente,
      num_clientes: campaign.num_clientes,
      fecha_inicio: new Date(campaign.fecha_inicio),
      fecha_fin: campaign.fecha_fin ? new Date(campaign.fecha_fin) : null,
      tipo: campaign.tipo,
    });
    setCurrentCampaignId(campaign.campa_a_id);
    setCreateCampaign(false);
  };

  const handleViewDialog = (campaign) => {
    setErrors({});
    setOpenDialog(true);
    setDialogMode("view");
    setNewCampaign({
      nombre_campa_a: campaign.nombre_campa_a,
      descripcion: campaign.descripcion,
      estado_campaña: campaign.estado_campa_a,
      mensaje_cliente: campaign.mensaje_cliente,
      num_clientes: campaign.num_clientes,
      fecha_inicio: new Date(campaign.fecha_inicio),
      fecha_fin: campaign.fecha_fin ? new Date(campaign.fecha_fin) : null,
      tipo: campaign.tipo,
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewCampaign((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name) => (date) => {
    setNewCampaign((prev) => ({ ...prev, [name]: date }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateFields()) {
      console.log("Form has errors");
      return;
    }

    setLoading(true);
    try {
      const url = !createCampaign
        ? `/api/campaigns?id=${currentCampaignId}`
        : "/api/campaigns";
      const method = !createCampaign ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCampaign),
      });
      if (!response.ok) throw new Error("Failed to create/update campaign");
      const data = await response.json();

      if (!createCampaign) {
        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign.campa_a_id === currentCampaignId ? data : campaign
          )
        );
        setSnackbarMessage("Campaña actualizada exitosamente");
      } else {
        setCampaigns((prev) => [...prev, data]);
        setSnackbarMessage("Campaña creada exitosamente");
      }
      handleCloseDialog();
      setNewCampaign({
        nombre_campa_a: "",
        descripcion: "",
        estado_campaña: "activa",
        mensaje_cliente: "",
        num_clientes: 0,
        fecha_inicio: null,
        fecha_fin: null,
        tipo: "in",
      });
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (err) {
      setSnackbarMessage("Error al crear/actualizar campaña");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOutCampaignSubmit = async () => {
    if (!validateOutCampaignFields()) {
      setSnackbarMessage("Por favor, complete todos los campos obligatorios.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      console.log("Estado actual de outCampaignData:", outCampaignData);

      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0"); // Mes de 0 a 11
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      let startDate = formatDate(outCampaignData.dateRange.from);
      let endDate = formatDate(outCampaignData.dateRange.to);
      let activationDate = formatDate(outCampaignData.activationType);

      const bodyOut = {
        states: outCampaignData.clientStates, // Array de estados de clientes seleccionados
        start_date: startDate,
        end_date: endDate,
        type: outCampaignData.clientType, // Tipo de cliente (IN o OUT)
        in_out: outCampaignData.considerPreviouslyContacted ? "True" : "False", // Boolean convertido a string
        template_id: outCampaignData.selectedTemplate, // ID del template seleccionado
        chunk_size: 20, // Número de registros por lote (ajustable según necesidades)
        nombre_campania: outCampaignData.nombre_campa_a,
        descripcion_campania: outCampaignData.descripcion,
        activation_type: outCampaignData.activationType,
        activation_date: activationDate,
      };

      const response = await fetch(
        "https://pdcgrsx8x0.execute-api.us-east-2.amazonaws.com/lambdaA",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyOut),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        // ✅ Si el statusCode no es 200, mostrar error
        throw new Error(data.message);
      }

      console.log("Body out : ", bodyOut);
      //setCampaigns((prev) => [...prev, data])
      handleCloseDialog();
      setSnackbarMessage("Campaña OUT creada exitosamente");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setOutCampaignData({
        nombre_campa_a: "",
        descripcion: "",
        clientStates: [],
        timeRange: "today",
        clientType: "in",
        considerPreviouslyContacted: false,
        selectedTemplate: "",
        dateRange: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
      });
      setSelectedPreset("Hoy");
    } catch (err) {
      console.error("Error en handleOutCampaignSubmit:", err);
      setSnackbarMessage(err.message || "Error al crear campaña OUT");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleCampaignTypeFilterChange = (event) => {
    setCampaignTypeFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTemplatePreview = (template) => {
    setSelectedTemplate(template);
    setOpenTemplatePreviewDialog(true);
  };

  const handleDateFilterChange = (dateRange) => {
    setOutCampaignData((prev) => ({
      ...prev,
      dateRange: dateRange,
    }));
  };

  if (loading && campaigns.length === 0) {
    return (
      <Container className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="flex justify-center items-center h-screen">
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container className="py-8">
        <Typography variant="h4" component="h1" gutterBottom className="mb-6">
          CAMPAÑAS
        </Typography>
        <div className="flex justify-between mb-6">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={(event) => setAnchorEl(event.currentTarget)}
          >
            Nueva campaña
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                handleOpenDialog("in");
                setAnchorEl(null);
              }}
            >
              Campaña IN
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleOpenDialog("out");
                setAnchorEl(null);
              }}
            >
              Campaña OUT
            </MenuItem>
          </Menu>
          <FormControl variant="outlined" style={{ minWidth: 120 }}>
            <InputLabel id="campaign-type-filter-label">
              Tipo de Campaña
            </InputLabel>
            <Select
              labelId="campaign-type-filter-label"
              value={campaignTypeFilter}
              onChange={handleCampaignTypeFilterChange}
              label="Tipo de Campaña"
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="in">IN</MenuItem>
              <MenuItem value="out">OUT</MenuItem>
            </Select>
          </FormControl>
        </div>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Fecha creación</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Fecha inicio</TableCell>
                <TableCell>Fecha fin</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.campa_a_id}>
                  <TableCell>{campaign.campa_a_id}</TableCell>
                  <TableCell>{campaign.nombre_campa_a}</TableCell>
                  <TableCell>{campaign.descripcion}</TableCell>
                  <TableCell>
                    {new Date(campaign.fecha_creacion).toLocaleString()}
                  </TableCell>
                  <TableCell>{campaign.estado_campa_a}</TableCell>
                  <TableCell>{campaign.tipo}</TableCell>
                  <TableCell>
                    {campaign.fecha_inicio
                      ? new Date(campaign.fecha_inicio).toLocaleString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {campaign.fecha_fin
                      ? new Date(campaign.fecha_fin).toLocaleString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleEditDialog(campaign)}>
                      <EditIcon />
                    </Button>
                    <Button onClick={() => handleViewDialog(campaign)}>
                      <VisibilityIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            {dialogMode === "create" && "Crear nueva campaña IN"}
            {dialogMode === "edit" && "Editar campaña"}
            {dialogMode === "view" && "Ver detalles de la campaña"}
          </DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                autoFocus
                margin="dense"
                name="nombre_campa_a"
                label="Nombre de campaña"
                type="text"
                fullWidth
                variant="outlined"
                value={newCampaign.nombre_campa_a}
                onChange={handleInputChange}
                required
                error={!!errors.nombre_campa_a}
                helperText={errors.nombre_campa_a}
                disabled={dialogMode === "view"}
              />
              <TextField
                margin="dense"
                name="descripcion"
                label="Descripcion"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={newCampaign.descripcion}
                onChange={handleInputChange}
                disabled={dialogMode === "view"}
              />
              <Select
                label="Estado"
                fullWidth
                margin="normal"
                name="estado_campa_a"
                value={newCampaign.estado_campaña}
                onChange={handleInputChange}
                required
                disabled={dialogMode === "view" || dialogMode === "create"}
              >
                <MenuItem value="activa">Activa</MenuItem>
                <MenuItem value="inactiva">Inactiva</MenuItem>
              </Select>
              <TextField
                margin="dense"
                name="mensaje_cliente"
                label="Mensaje a cliente"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={newCampaign.mensaje_cliente}
                onChange={handleInputChange}
                required
                error={!!errors.mensaje_cliente}
                helperText={errors.mensaje_cliente}
                disabled={dialogMode === "view"}
              />
              <TextField
                margin="dense"
                name="num_clientes"
                label="Número de clientes"
                type="number"
                fullWidth
                variant="outlined"
                value={newCampaign.num_clientes}
                disabled
              />
              <DateTimePicker
                label="Fecha inicio *"
                value={newCampaign.fecha_inicio}
                onChange={handleDateChange("fecha_inicio")}
                disabled={dialogMode === "view"}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.fecha_inicio}
                    helperText={errors.fecha_inicio}
                    disabled={dialogMode === "view"}
                  />
                )}
              />
              <DateTimePicker
                label="Fecha fin"
                value={newCampaign.fecha_fin}
                onChange={handleDateChange("fecha_fin")}
                disabled={dialogMode === "view"}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    disabled={dialogMode === "view"}
                  />
                )}
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cerrar</Button>
            {dialogMode !== "view" && (
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
              >
                {dialogMode === "create" ? "Crear" : "Guardar"}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        <Dialog
          open={openOutCampaignDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Crear Campaña OUT</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="nombre_campa_a"
              label="Nombre de campaña"
              type="text"
              fullWidth
              variant="outlined"
              value={outCampaignData.nombre_campa_a}
              onChange={(e) =>
                setOutCampaignData({
                  ...outCampaignData,
                  nombre_campa_a: e.target.value,
                })
              }
              required
              error={!!errors.nombre_campa_a}
              helperText={errors.nombre_campa_a}
            />
            <TextField
              margin="dense"
              name="descripcion"
              label="Descripción"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={outCampaignData.descripcion}
              onChange={(e) =>
                setOutCampaignData({
                  ...outCampaignData,
                  descripcion: e.target.value,
                })
              }
              error={!!errors.descripcion}
              helperText={errors.descripcion}
            />
            <FormControl
              fullWidth
              margin="normal"
              error={!!errors.clientStates}
            >
              <InputLabel>Estados de clientes</InputLabel>
              <Select
                multiple
                value={outCampaignData.clientStates}
                onChange={(e) =>
                  setOutCampaignData({
                    ...outCampaignData,
                    clientStates: e.target.value,
                  })
                }
                renderValue={(selected) =>
                  selected.map((state) => stateMapping[state].text).join(", ")
                }
              >
                {Object.keys(stateMapping)
                  .filter(
                    (state) => !["activo", "default", "nuevo"].includes(state)
                  )
                  .map((state) => (
                    <MenuItem key={state} value={state}>
                      <Checkbox
                        checked={
                          outCampaignData.clientStates.indexOf(state) > -1
                        }
                      />
                      {stateMapping[state].text}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <DateFilterv2
              onDateChange={handleDateFilterChange}
              reset={resetFilters}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              setSelectedPreset={setSelectedPreset}
              startDate={startDate}
              endDate={endDate}
              selectedPreset={selectedPreset}
              TodoExist={false}
              size="medium"
            />

            <FormControl fullWidth margin="normal" error={!!errors.clientType}>
              <InputLabel>Tipo de clientes</InputLabel>
              <Select
                value={outCampaignData.clientType}
                onChange={(e) =>
                  setOutCampaignData({
                    ...outCampaignData,
                    clientType: e.target.value,
                  })
                }
              >
                <MenuItem value="in">IN</MenuItem>
                <MenuItem value="out">OUT</MenuItem>
              </Select>
              {errors.clientType && (
                <Typography color="error">{errors.clientType}</Typography>
              )}
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={outCampaignData.considerPreviouslyContacted}
                  onChange={(e) =>
                    setOutCampaignData({
                      ...outCampaignData,
                      considerPreviouslyContacted: e.target.checked,
                    })
                  }
                />
              }
              label="Considerar clientes previamente contactados"
            />

            <FormControl
              fullWidth
              margin="normal"
              error={!!errors.selectedTemplate}
            >
              <InputLabel>Template</InputLabel>
              <Select
                value={outCampaignData.selectedTemplate}
                onChange={(e) =>
                  setOutCampaignData({
                    ...outCampaignData,
                    selectedTemplate: e.target.value,
                  })
                }
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.nombre_template}
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleTemplatePreview(template);
                      }}
                    >
                      <InfoIcon />
                    </IconButton>
                  </MenuItem>
                ))}
              </Select>
              {errors.selectedTemplate && (
                <Typography color="error">{errors.selectedTemplate}</Typography>
              )}
            </FormControl>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <FormControl style={{ minWidth: 150 }}>
                <InputLabel>Fecha de activación</InputLabel>
                <Select
                  value={outCampaignData.activationType || "now"}
                  onChange={(e) => {
                    const selectedType = e.target.value;
                    setOutCampaignData({
                      ...outCampaignData,
                      activationType: selectedType,
                      activationDate: selectedType === "now" ? startOfDay(new Date()) : null,
                    });
                  }}
                >
                  <MenuItem value="now">Ahora</MenuItem>
                  <MenuItem value="custom">Seleccionar fecha</MenuItem>
                </Select>
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha de activación"
                  value={outCampaignData.activationDate}
                  onChange={(date) =>
                    setOutCampaignData({ ...outCampaignData, activationDate: date })
                  }
                  disabled={outCampaignData.activationType === "now"}
                  inputFormat="dd/MM/yyyy"
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              onClick={handleOutCampaignSubmit}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Enviar"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openTemplatePreviewDialog}
          onClose={() => setOpenTemplatePreviewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Vista previa del template</DialogTitle>
          <DialogContent>
            {selectedTemplate && (
              <>
                <Typography variant="h6">
                  {selectedTemplate.nombre_template}
                </Typography>
                <Typography variant="body1">
                  {selectedTemplate.mensaje}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenTemplatePreviewDialog(false)}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
}
