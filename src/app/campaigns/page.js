"use client"

import { useState, useEffect } from "react"
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
} from "@mui/material"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import VisibilityIcon from "@mui/icons-material/Visibility"
import { stateMapping } from "../utils/stateMapping"

export default function CampaignManagement() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [openOutCampaignDialog, setOpenOutCampaignDialog] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    nombre_campa_a: "",
    descripcion: "",
    estado_campaña: "activa",
    mensaje_cliente: "",
    num_clientes: 0,
    fecha_inicio: null,
    fecha_fin: null,
    tipo: "in",
  })
  const [dialogMode, setDialogMode] = useState("create")
  const [createCampaign, setCreateCampaign] = useState(false)
  const [currentCampaignId, setCurrentCampaignId] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")
  const [campaignTypeFilter, setCampaignTypeFilter] = useState("all")
  const [anchorEl, setAnchorEl] = useState(null)
  const [errors, setErrors] = useState({})

  const [outCampaignData, setOutCampaignData] = useState({
    nombre_campa_a: "",
    descripcion: "",
    clientStates: [],
    timeRange: "today",
    clientType: "in",
    considerPreviouslyContacted: false,
    selectedTemplate: "",
    customDateRange: { start: null, end: null },
  })

  const [templates, setTemplates] = useState([])

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/campaigns?type=${campaignTypeFilter}`)
        const data = await response.json()
        setCampaigns(data.campaigns)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch campaigns")
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [campaignTypeFilter])

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates")
        const data = await response.json()
        setTemplates(data.templates)
      } catch (error) {
        console.error("Error fetching templates:", error)
      }
    }

    fetchTemplates()
  }, [])

  const validateFields = () => {
    const newErrors = {}
    if (!newCampaign.nombre_campa_a.trim()) {
      newErrors.nombre_campa_a = "Este campo es obligatorio"
    }
    if (!newCampaign.mensaje_cliente.trim()) {
      newErrors.mensaje_cliente = "Este campo es obligatorio"
    }
    if (!newCampaign.fecha_inicio) {
      newErrors.fecha_inicio = "Debe seleccionar una fecha de inicio"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenDialog = (type) => {
    setDialogMode("create")
    setErrors({})
    if (type === "out") {
      setOpenOutCampaignDialog(true)
    } else {
      setOpenDialog(true)
      setNewCampaign({
        nombre_campa_a: "",
        descripcion: "",
        estado_campaña: "activa",
        mensaje_cliente: "",
        num_clientes: 0,
        fecha_inicio: null,
        fecha_fin: null,
        tipo: "in",
      })
    }
    setCreateCampaign(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setOpenOutCampaignDialog(false)
  }

  const handleEditDialog = (campaign) => {
    setDialogMode("edit")
    setErrors({})
    setOpenDialog(true)
    setNewCampaign({
      nombre_campa_a: campaign.nombre_campa_a,
      descripcion: campaign.descripcion,
      estado_campa_a: campaign.estado_campa_a,
      mensaje_cliente: campaign.mensaje_cliente,
      num_clientes: campaign.num_clientes,
      fecha_inicio: new Date(campaign.fecha_inicio),
      fecha_fin: campaign.fecha_fin ? new Date(campaign.fecha_fin) : null,
      tipo: campaign.tipo,
    })
    setCurrentCampaignId(campaign.campa_a_id)
    setCreateCampaign(false)
  }

  const handleViewDialog = (campaign) => {
    setErrors({})
    setOpenDialog(true)
    setDialogMode("view")
    setNewCampaign({
      nombre_campa_a: campaign.nombre_campa_a,
      descripcion: campaign.descripcion,
      estado_campa_a: campaign.estado_campa_a,
      mensaje_cliente: campaign.mensaje_cliente,
      num_clientes: campaign.num_clientes,
      fecha_inicio: new Date(campaign.fecha_inicio),
      fecha_fin: campaign.fecha_fin ? new Date(campaign.fecha_fin) : null,
      tipo: campaign.tipo,
    })
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setNewCampaign((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name) => (date) => {
    setNewCampaign((prev) => ({ ...prev, [name]: date }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateFields()) {
      console.log("Form has errors")
      return
    }

    setLoading(true)
    try {
      const url = !createCampaign ? `/api/campaigns?id=${currentCampaignId}` : "/api/campaigns"
      const method = !createCampaign ? "PUT" : "POST"

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCampaign),
      })
      if (!response.ok) throw new Error("Failed to create/update campaign")
      const data = await response.json()

      if (!createCampaign) {
        setCampaigns((prev) => prev.map((campaign) => (campaign.campa_a_id === currentCampaignId ? data : campaign)))
        setSnackbarMessage("Campaña actualizada exitosamente")
      } else {
        setCampaigns((prev) => [...prev, data])
        setSnackbarMessage("Campaña creada exitosamente")
      }
      handleCloseDialog()
      setNewCampaign({
        nombre_campa_a: "",
        descripcion: "",
        estado_campaña: "activa",
        mensaje_cliente: "",
        num_clientes: 0,
        fecha_inicio: null,
        fecha_fin: null,
        tipo: "in",
      })
      setSnackbarSeverity("success")
      setOpenSnackbar(true)
    } catch (err) {
      setSnackbarMessage("Error al crear/actualizar campaña")
      setSnackbarSeverity("error")
      setOpenSnackbar(true)
    } finally {
      setLoading(false)
    }
  }

  const handleOutCampaignSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/campaigns/out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...outCampaignData,
          tipo: "out", // Aseguramos que el tipo sea 'out'
        }),
      })
      if (!response.ok) throw new Error("Failed to create OUT campaign")
      const data = await response.json()
      setCampaigns((prev) => [...prev, data])
      handleCloseDialog()
      setSnackbarMessage("Campaña OUT creada exitosamente")
      setSnackbarSeverity("success")
      setOpenSnackbar(true)
      // Reiniciar el formulario
      setOutCampaignData({
        nombre_campa_a: "",
        descripcion: "",
        clientStates: [],
        timeRange: "today",
        clientType: "in",
        considerPreviouslyContacted: false,
        selectedTemplate: "",
        customDateRange: { start: null, end: null },
      })
    } catch (err) {
      setSnackbarMessage("Error al crear campaña OUT")
      setSnackbarSeverity("error")
      setOpenSnackbar(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setOpenSnackbar(false)
  }

  const handleCampaignTypeFilterChange = (event) => {
    setCampaignTypeFilter(event.target.value)
  }

  if (loading && campaigns.length === 0) {
    return (
      <Container className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="flex justify-center items-center h-screen">
        <Typography color="error">{error}</Typography>
      </Container>
    )
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
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem
              onClick={() => {
                handleOpenDialog("in")
                setAnchorEl(null)
              }}
            >
              Campaña IN
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleOpenDialog("out")
                setAnchorEl(null)
              }}
            >
              Campaña OUT
            </MenuItem>
          </Menu>
          <FormControl variant="outlined" style={{ minWidth: 120 }}>
            <InputLabel id="campaign-type-filter-label">Tipo de Campaña</InputLabel>
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
                  <TableCell>{new Date(campaign.fecha_creacion).toLocaleString()}</TableCell>
                  <TableCell>{campaign.estado_campa_a}</TableCell>
                  <TableCell>{campaign.tipo}</TableCell>
                  <TableCell>
                    {campaign.fecha_inicio ? new Date(campaign.fecha_inicio).toLocaleString() : "N/A"}
                  </TableCell>
                  <TableCell>{campaign.fecha_fin ? new Date(campaign.fecha_fin).toLocaleString() : "N/A"}</TableCell>
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
                renderInput={(params) => <TextField {...params} fullWidth disabled={dialogMode === "view"} />}
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cerrar</Button>
            {dialogMode !== "view" && (
              <Button onClick={handleSubmit} variant="contained" color="primary">
                {dialogMode === "create" ? "Crear" : "Guardar"}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        <Dialog open={openOutCampaignDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
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
              onChange={(e) => setOutCampaignData({ ...outCampaignData, nombre_campa_a: e.target.value })}
              required
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
              onChange={(e) => setOutCampaignData({ ...outCampaignData, descripcion: e.target.value })}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Estados de clientes</InputLabel>
              <Select
                multiple
                value={outCampaignData.clientStates}
                onChange={(e) => setOutCampaignData({ ...outCampaignData, clientStates: e.target.value })}
                renderValue={(selected) => selected.map((state) => stateMapping[state].text).join(", ")}
              >
                {Object.keys(stateMapping).map((state) => (
                  <MenuItem key={state} value={state}>
                    <Checkbox checked={outCampaignData.clientStates.indexOf(state) > -1} />
                    {stateMapping[state].text}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Rango de tiempo</InputLabel>
              <Select
                value={outCampaignData.timeRange}
                onChange={(e) => setOutCampaignData({ ...outCampaignData, timeRange: e.target.value })}
              >
                <MenuItem value="today">Hoy</MenuItem>
                <MenuItem value="yesterday">Ayer</MenuItem>
                <MenuItem value="lastWeek">Última semana</MenuItem>
                <MenuItem value="lastMonth">Último mes</MenuItem>
                <MenuItem value="custom">Rango específico</MenuItem>
              </Select>
            </FormControl>

            {outCampaignData.timeRange === "custom" && (
              <div className="flex gap-4 mt-4">
                <DatePicker
                  label="Fecha inicio"
                  value={outCampaignData.customDateRange.start}
                  onChange={(date) =>
                    setOutCampaignData({
                      ...outCampaignData,
                      customDateRange: { ...outCampaignData.customDateRange, start: date },
                    })
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <DatePicker
                  label="Fecha fin"
                  value={outCampaignData.customDateRange.end}
                  onChange={(date) =>
                    setOutCampaignData({
                      ...outCampaignData,
                      customDateRange: { ...outCampaignData.customDateRange, end: date },
                    })
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </div>
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo de clientes</InputLabel>
              <Select
                value={outCampaignData.clientType}
                onChange={(e) => setOutCampaignData({ ...outCampaignData, clientType: e.target.value })}
              >
                <MenuItem value="in">IN</MenuItem>
                <MenuItem value="out">OUT</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={outCampaignData.considerPreviouslyContacted}
                  onChange={(e) =>
                    setOutCampaignData({ ...outCampaignData, considerPreviouslyContacted: e.target.checked })
                  }
                />
              }
              label="Considerar clientes previamente contactados"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Template</InputLabel>
              <Select
                value={outCampaignData.selectedTemplate}
                onChange={(e) => setOutCampaignData({ ...outCampaignData, selectedTemplate: e.target.value })}
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleOutCampaignSubmit} variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Crear/Enviar"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  )
}

