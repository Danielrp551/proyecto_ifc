"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Button,
  ButtonGroup,
  Modal,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";

const AgregarCitaModal = ({ open, onClose }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [cliente, setCliente] = useState({
    celular: "",
    nombre: "",
    estado: "",
  });
  const [cita, setCita] = useState({ fecha: "", hora: "" });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const isValidCelular = (cel) => /^\d{9}$/.test(cel);
  const isFormValid = () =>
    cliente.nombre && isValidCelular(cliente.celular) && cliente.estado;
  const isCitaValid = () => cita.fecha && cita.hora;

  const handleNext = () => {
    if (isFormValid()) setTabIndex(1);
  };
  const handleBack = () => setTabIndex(0);

  const handleSave = async () => {
    if (!isCitaValid()) return;
    setLoading(true);
    const payload = { ...cliente, cita };
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) onClose();
    } catch (error) {
      console.error("Error al guardar cita", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            width: 400,
            backgroundColor: "white",
            padding: 3,
            margin: "auto",
            mt: 5,
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={(_, newValue) => setTabIndex(newValue)}
          >
            <Tab label="Datos del Cliente" />
            <Tab label="Datos de la Cita" />
          </Tabs>

          {tabIndex === 0 && (
            <Box>
              <TextField
                fullWidth
                label="Celular"
                error={!isValidCelular(cliente.celular)}
                helperText={
                  !isValidCelular(cliente.celular) ? "Debe tener 9 dígitos" : ""
                }
                value={cliente.celular}
                onChange={(e) =>
                  setCliente({ ...cliente, celular: e.target.value })
                }
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Nombre Completo"
                value={cliente.nombre}
                onChange={(e) =>
                  setCliente({ ...cliente, nombre: e.target.value })
                }
                sx={{ mt: 2 }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={cliente.estado}
                  onChange={(e) =>
                    setCliente({ ...cliente, estado: e.target.value })
                  }
                >
                  <MenuItem value="cita agendada">Cita agendada</MenuItem>
                  <MenuItem value="promesas de pago">Promesa de Pago</MenuItem>
                </Select>
              </FormControl>
              <Button
                onClick={handleNext}
                variant="contained"
                sx={{ mt: 2 }}
                disabled={!isFormValid()}
              >
                Siguiente
              </Button>
            </Box>
          )}

          {tabIndex === 1 && (
            <Box>
              <TextField
                fullWidth
                type="date"
                value={cita.fecha}
                onChange={(e) => setCita({ ...cita, fecha: e.target.value })}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                type="time"
                value={cita.hora}
                onChange={(e) => setCita({ ...cita, hora: e.target.value })}
                sx={{ mt: 2 }}
              />
              <Button onClick={handleBack} sx={{ mt: 2, mr: 1 }}>
                Atrás
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                sx={{ mt: 2 }}
                disabled={loading || !isCitaValid()}
              >
                {loading ? <CircularProgress size={24} /> : "Guardar"}
              </Button>
            </Box>
          )}
        </Box>
      </Modal>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default AgregarCitaModal;
