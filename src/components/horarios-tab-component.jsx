"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Snackbar,
  Alert,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
} from "@mui/material"
import { Add, Edit, Delete, ArrowBackIos, ArrowForwardIos, Schedule, CalendarToday } from "@mui/icons-material"

const tiposServicio = [
  { label: "Capilar", value: "capilar" },
  { label: "Facial", value: "facial" },
]

const tiposHorario = [
  { label: "Recurrente", value: "recurrente" },
  { label: "Fijo", value: "fijo" },
]

const diasSemana = [
  { label: "Lunes", value: "monday" },
  { label: "Martes", value: "tuesday" },
  { label: "Miércoles", value: "wednesday" },
  { label: "Jueves", value: "thursday" },
  { label: "Viernes", value: "friday" },
  { label: "Sábado", value: "saturday" },
  { label: "Domingo", value: "sunday" },
]

// Generar días del mes (1-31)
const diasMes = Array.from({ length: 31 }, (_, i) => ({
  label: `${i + 1}`,
  value: i + 1,
}))

const meses = [
  { label: "Enero", value: "january" },
  { label: "Febrero", value: "february" },
  { label: "Marzo", value: "march" },
  { label: "Abril", value: "april" },
  { label: "Mayo", value: "may" },
  { label: "Junio", value: "june" },
  { label: "Julio", value: "july" },
  { label: "Agosto", value: "august" },
  { label: "Septiembre", value: "september" },
  { label: "Octubre", value: "october" },
  { label: "Noviembre", value: "november" },
  { label: "Diciembre", value: "december" },
]

const HorariosTabComponent = () => {
  const [mesActualIndex, setMesActualIndex] = useState(0)
  const [mesActual, setMesActual] = useState("")
  const [horarios, setHorarios] = useState([])
  const [nuevoHorario, setNuevoHorario] = useState({
    tipo_servicio: "",
    tipo_horario: "",
    dia_recurrente: "",
    fecha_fijo: "",
    inicio: "",
    fin: "",
    mes_horario: "",
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingHorario, setEditingHorario] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [horarioToDelete, setHorarioToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  useEffect(() => {
    // Calcular el mes actual
    const fechaActual = new Date()
    const mesIndex = fechaActual.getMonth()
    setMesActualIndex(mesIndex)
    setMesActual(meses[mesIndex].value)
  }, [])

    useEffect(() => {
    // ya tienes mesActual calculado; evita llamar si todavía está vacío
    if (!mesActual) return;

    const fetchHorarios = async () => {
        try {
        const res = await fetch(`/api/horarios?mes=${mesActual}`);
        if (!res.ok) throw new Error("Error al obtener horarios");

        const { horarios } = await res.json();
        setHorarios(horarios);
        } catch (err) {
        console.error(err);
        setSnackbar({
            open: true,
            message: "Error al cargar los horarios",
            severity: "error",
        });
        }
    };

    fetchHorarios();
    }, [mesActual]); 

  const handleMesAnterior = () => {
    const nuevoIndex = mesActualIndex === 0 ? 11 : mesActualIndex - 1
    setMesActualIndex(nuevoIndex)
    setMesActual(meses[nuevoIndex].value)
  }

  const handleMesSiguiente = () => {
    const nuevoIndex = mesActualIndex === 11 ? 0 : mesActualIndex + 1
    setMesActualIndex(nuevoIndex)
    setMesActual(meses[nuevoIndex].value)
  }

  const horariosFiltrados = horarios.filter((horario) => horario.mes_horario === mesActual)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNuevoHorario({ ...nuevoHorario, [name]: value })
  }

  const handleSelectChange = (name, value) => {
    setNuevoHorario({ ...nuevoHorario, [name]: value })

    // Limpiar campos relacionados cuando cambia el tipo de horario
    if (name === "tipo_horario") {
      setNuevoHorario((prev) => ({
        ...prev,
        [name]: value,
        dia_recurrente: "",
        fecha_fijo: "",
      }))
    }
  }

  const handleCreateHorario = async () => {
    // Validaciones
    if (!nuevoHorario.tipo_servicio || !nuevoHorario.tipo_horario || !nuevoHorario.inicio || !nuevoHorario.fin) {
      setSnackbar({
        open: true,
        message: "Por favor completa todos los campos obligatorios",
        severity: "error",
      })
      return
    }

    if (nuevoHorario.tipo_horario === "recurrente" && !nuevoHorario.dia_recurrente) {
      setSnackbar({
        open: true,
        message: "Por favor selecciona un día de la semana",
        severity: "error",
      })
      return
    }

    if (nuevoHorario.tipo_horario === "fijo" && !nuevoHorario.fecha_fijo) {
      setSnackbar({
        open: true,
        message: "Por favor selecciona un día del mes",
        severity: "error",
      })
      return
    }

    try {
    const payload = {
        ...nuevoHorario,
        mes_horario: mesActual,
    }

    const response = await fetch("/api/horarios", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error("Error al guardar horario en el servidor")

    const { horario } = await response.json(); 

    setHorarios(prev => [...prev, horario]);
    setSnackbar({
        open: true,
        message: "Horario creado con éxito",
        severity: "success",
    })
    setModalOpen(false)
    setNuevoHorario({
        tipo_servicio: "",
        tipo_horario: "",
        dia_recurrente: "",
        fecha_fijo: "",
        inicio: "",
        fin: "",
        mes_horario: "",
    })
    } catch (error) {
    console.error("Error al crear horario:", error)
    setSnackbar({
        open: true,
        message: "Error al crear el horario. Intenta nuevamente.",
        severity: "error",
    })
    }
  }

    const handleEditHorario = async () => {
    try {
        const res = await fetch("/api/horarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingHorario),   // incluye id y campos editados
        });

        if (!res.ok) throw new Error("Error al actualizar");

        const { horario: horarioActualizado } = await res.json();

        setHorarios(prev =>
        prev.map(h => (h.id === horarioActualizado.id ? horarioActualizado : h))
        );
        setSnackbar({
        open: true,
        message: "Horario actualizado con éxito",
        severity: "success",
        });
        setEditModalOpen(false);
        setEditingHorario(null);
    } catch (err) {
        console.error(err);
        setSnackbar({
        open: true,
        message: "No se pudo actualizar el horario",
        severity: "error",
        });
    }
    };

    const handleDeleteHorario = async () => {
    try {
        const res = await fetch(`/api/horarios?id=${horarioToDelete.id}`, {
        method: "DELETE",
        });

        if (!res.ok) throw new Error("Error al eliminar");

        setHorarios(prev => prev.filter(h => h.id !== horarioToDelete.id));
        setSnackbar({
        open: true,
        message: "Horario eliminado con éxito",
        severity: "success",
        });
    } catch (err) {
        console.error(err);
        setSnackbar({
        open: true,
        message: "No se pudo eliminar el horario",
        severity: "error",
        });
    } finally {
        setDeleteDialogOpen(false);
        setHorarioToDelete(null);
    }
    };

  const handleEditClick = (horario) => {
    setEditingHorario({ ...horario })
    setEditModalOpen(true)
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditingHorario({ ...editingHorario, [name]: value })
  }

  const handleEditSelectChange = (name, value) => {
    setEditingHorario({ ...editingHorario, [name]: value })

    // Limpiar campos relacionados cuando cambia el tipo de horario
    if (name === "tipo_horario") {
      setEditingHorario((prev) => ({
        ...prev,
        [name]: value,
        dia_recurrente: "",
        fecha_fijo: "",
      }))
    }
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setSnackbar({ ...snackbar, open: false })
  }

  const formatearHorario = (horario) => {
    if (horario.tipo_horario === "recurrente") {
      const dia = diasSemana.find((d) => d.value === horario.dia_recurrente)?.label || horario.dia_recurrente
      return dia
    } else {
      return `Día ${horario.fecha_fijo}`
    }
  }

  const formatearTipoServicio = (tipo) => {
    return tiposServicio.find((t) => t.value === tipo)?.label || tipo
  }

  return (
    <>
      {/* Navegación de meses */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 4 }}>
        <IconButton onClick={handleMesAnterior} sx={{ mr: 2 }}>
          <ArrowBackIos />
        </IconButton>
        <Typography variant="h5" sx={{ color: "#333", fontWeight: "bold", minWidth: "200px", textAlign: "center" }}>
          Horarios de {meses.find((m) => m.value === mesActual)?.label || mesActual}
        </Typography>
        <IconButton onClick={handleMesSiguiente} sx={{ ml: 2 }}>
          <ArrowForwardIos />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setModalOpen(true)}
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": {
              backgroundColor: "#115293",
            },
          }}
        >
          Agregar Horario
        </Button>
      </Box>

      {/* Lista de horarios como cards */}
      {horariosFiltrados.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {horariosFiltrados.map((horario) => (
            <Card key={horario.id} elevation={3} sx={{ borderLeft: "4px solid #1976d2"}}>
              <CardContent sx={{ py: 2, px: 3}}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: "bold", color: "#333" }}>
                      {formatearTipoServicio(horario.tipo_servicio)}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                      <CalendarToday sx={{ fontSize: 16, color: "#666" }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatearHorario(horario)}
                      </Typography>
                      <Chip
                        label={horario.tipo_horario === "recurrente" ? "Recurrente" : "Fijo"}
                        size="small"
                        color={horario.tipo_horario === "recurrente" ? "primary" : "secondary"}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Schedule sx={{ fontSize: 16, color: "#666" }} />
                    <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                      {horario.inicio} - {horario.fin}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <CardActions sx={{ justifyContent: "flex-end", pt: 0, pb: 1, px: 3 }}>
                  <Button size="small" startIcon={<Edit />} onClick={() => handleEditClick(horario)}>
                    Editar
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Delete />}
                    color="error"
                    onClick={() => {
                      setHorarioToDelete(horario)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    Eliminar
                  </Button>
                </CardActions>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Card elevation={3}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No hay horarios registrados para {meses.find((m) => m.value === mesActual)?.label || mesActual}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Agrega tu primer horario haciendo clic en el botón "Agregar Horario"
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Modal para crear horario */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} aria-labelledby="modal-crear-horario">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Agregar Nuevo Horario - {meses.find((m) => m.value === mesActual)?.label || mesActual}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Servicio</InputLabel>
                <Select
                  value={nuevoHorario.tipo_servicio}
                  onChange={(e) => handleSelectChange("tipo_servicio", e.target.value)}
                  required
                >
                  {tiposServicio.map((tipo, index) => (
                    <MenuItem key={index} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Horario</InputLabel>
                <Select
                  value={nuevoHorario.tipo_horario}
                  onChange={(e) => handleSelectChange("tipo_horario", e.target.value)}
                  required
                >
                  {tiposHorario.map((tipo, index) => (
                    <MenuItem key={index} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {nuevoHorario.tipo_horario === "recurrente" && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Día de la Semana</InputLabel>
                  <Select
                    value={nuevoHorario.dia_recurrente}
                    onChange={(e) => handleSelectChange("dia_recurrente", e.target.value)}
                    required
                  >
                    {diasSemana.map((dia, index) => (
                      <MenuItem key={index} value={dia.value}>
                        {dia.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {nuevoHorario.tipo_horario === "fijo" && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Día del Mes</InputLabel>
                  <Select
                    value={nuevoHorario.fecha_fijo}
                    onChange={(e) => handleSelectChange("fecha_fijo", e.target.value)}
                    required
                  >
                    {diasMes.map((dia, index) => (
                      <MenuItem key={index} value={dia.value}>
                        {dia.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="inicio"
                label="Hora de Inicio"
                type="time"
                value={nuevoHorario.inicio}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="fin"
                label="Hora de Fin"
                type="time"
                value={nuevoHorario.fin}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleCreateHorario}
              sx={{
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#115293",
                },
              }}
            >
              Agregar Horario
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal para editar horario */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} aria-labelledby="modal-editar-horario">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Editar Horario - {meses.find((m) => m.value === editingHorario?.mes_horario)?.label || editingHorario?.mes_horario}
          </Typography>
          {editingHorario && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Servicio</InputLabel>
                  <Select
                    value={editingHorario.tipo_servicio}
                    onChange={(e) => handleEditSelectChange("tipo_servicio", e.target.value)}
                    required
                  >
                    {tiposServicio.map((tipo, index) => (
                      <MenuItem key={index} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Horario</InputLabel>
                  <Select
                    value={editingHorario.tipo_horario}
                    onChange={(e) => handleEditSelectChange("tipo_horario", e.target.value)}
                    required
                  >
                    {tiposHorario.map((tipo, index) => (
                      <MenuItem key={index} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {editingHorario.tipo_horario === "recurrente" && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Día de la Semana</InputLabel>
                    <Select
                      value={editingHorario.dia_recurrente}
                      onChange={(e) => handleEditSelectChange("dia_recurrente", e.target.value)}
                      required
                    >
                      {diasSemana.map((dia, index) => (
                        <MenuItem key={index} value={dia.value}>
                          {dia.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {editingHorario.tipo_horario === "fijo" && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Día del Mes</InputLabel>
                    <Select
                      value={editingHorario.fecha_fijo}
                      onChange={(e) => handleEditSelectChange("fecha_fijo", e.target.value)}
                      required
                    >
                      {diasMes.map((dia, index) => (
                        <MenuItem key={index} value={dia.value}>
                          {dia.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="inicio"
                  label="Hora de Inicio"
                  type="time"
                  value={editingHorario.inicio}
                  onChange={handleEditInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="fin"
                  label="Hora de Fin"
                  type="time"
                  value={editingHorario.fin}
                  onChange={handleEditInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>
            </Grid>
          )}
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button onClick={() => setEditModalOpen(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleEditHorario}
              sx={{
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#115293",
                },
              }}
            >
              Guardar Cambios
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Diálogo de confirmación para eliminar horario */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">¿Estás seguro de que quieres eliminar este horario?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Esta acción no se puede deshacer. El horario será eliminado permanentemente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteHorario} autoFocus color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default HorariosTabComponent
