"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Divider,
  Skeleton,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { endOfDay, startOfDay, set } from "date-fns";
import { DateFilterv2 } from "./date-filter_v2";
import { blue, green, orange, red, grey, yellow } from "@mui/material/colors";

const stateMapping = {
  "no interesado": {
    text: "No interesado",
    color: red[100],
    textColor: red[800],
  },
  activo: {
    text: "Activo",
    color: green[100],
    textColor: green[800],
  },
  seguimiento: {
    text: "Seguimiento",
    color: blue[100],
    textColor: blue[800],
  },
  interesado: {
    text: "Interesado",
    color: yellow[100],
    textColor: yellow[800],
  },
  "promesas de pago": {
    text: "Promesa de pago",
    color: orange[100],
    textColor: orange[800],
  },
  "cita agendada": {
    text: "Cita Agendada",
    color: green[200],
    textColor: green[800],
  },
  default: {
    text: "Desconocido",
    color: grey[100],
    textColor: grey[800],
  },
};

export default function ConversationsChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [data, setData] = useState([]);
  const [resumen, setResumen] = useState({});
  const [totalConversaciones, setTotalConversaciones] = useState(0);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedPreset, setSelectedPreset] = useState("Hoy");

  const [resetFilters, setResetFilters] = useState(false);

  const [gestores, setGestores] = useState([]);

  const [filtros, setFiltros] = useState({
    dateRange: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
    estado: "",
    gestor: "",
    accion: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const estado = filtros.estado ? `&estado=${filtros.estado}` : "";
        const gestor = filtros.gestor ? `&asesor=${filtros.gestor}` : "";
        const accion = filtros.accion ? `&accion=${filtros.accion}` : "";
        const dateRange =
          filtros.dateRange.from && filtros.dateRange.to
            ? `&fechaInicio=${filtros.dateRange.from.toISOString()}&fechaFin=${filtros.dateRange.to.toISOString()}`
            : "";
        const response = await fetch(
          `/api/dashboard/conversaciones?${dateRange}${estado}${gestor}${accion}`
        );
        const data = await response.json();
        console.log("data", data);
        setData(data.conversacionesPorFecha);
        setResumen({
          conversacionesGestionadas: data.conversacionesGestionadas,
          conversacionesPorEstado: data.conversacionesPorEstado,
          conversacionesCitaAgendadaAccion: data.numCitaAgendada,
        });
        setTotalConversaciones(data.totalConversaciones);
      } catch (err) {
        console.error("Error al cargar los datos de los gestores:", err);
        setError("Error al cargar los datos de los gestores");
        setSnackbarMessage("Error al cargar gestores");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filtros]);

  useEffect(() => {
    const fetchInteracciones = async () => {
      setLoading(true);
      setError(null);
      try {
        const dateRange =
          filtros.dateRange.from && filtros.dateRange.to
            ? `&fechaInicio=${filtros.dateRange.from.toISOString()}&fechaFin=${filtros.dateRange.to.toISOString()}`
            : "";
        const response = await fetch(
          `/api/dashboard/interacciones?${dateRange}`
        );
        const data = await response.json();
        console.log("data interacciones", data);
      } catch (err) {
        console.error("Error al cargar los datos de los gestores:", err);
        setError("Error al cargar los datos de los gestores");
        setSnackbarMessage("Error al cargar gestores");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInteracciones();
  }, []);

  useEffect(() => {
    const fetchGestores = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/gestores?`);
          const data = await response.json();
          console.log("data asesores", data);
          setGestores(data.asesores);
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

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  const handleDateChange = (dateRange) => {
    setFiltros((prev) => ({
      ...prev,
      dateRange: dateRange,
    }));
    //setPage(0); // Reinicia a la primera página
  };

  const handleInputChange = (field, value) => {
    setFiltros((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box className="flex gap-4">
      {/* Panel de resumen */}
      <Card className="w-1/4 bg-white shadow-md">
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Resumen de Conversaciones
          </Typography>
          {loading ? (
            <>
              <Skeleton variant="text" width="60%" height={60} />
              <Skeleton variant="text" width="100%" />
              <Divider className="my-4" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="75%" />
            </>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              <Typography variant="h4" className="text-green-600 font-bold">
                {totalConversaciones}
              </Typography>
              <Typography className="text-gray-500">
                Total en el periodo seleccionado
              </Typography>
              <Divider className="my-2" />
              <Typography variant="body2" className="text-gray-600">
                Conversaciones gestionadas:{" "}
                <strong>{resumen.conversacionesGestionadas}</strong>
              </Typography>
              <Divider className="my-2" />
              <Typography variant="subtitle2" className="mt-2 mb-1">
                Conversaciones por estado:
              </Typography>
              {Object.entries(resumen.conversacionesPorEstado || {})
                .filter(
                  ([state]) =>
                    !["nuevo", "contactado", "cita agendada"].includes(state)
                )
                .map(([state, count]) => (
                  <Typography
                    key={state}
                    variant="body2"
                    style={{
                      backgroundColor:
                        stateMapping[state]?.color ||
                        stateMapping.default.color,
                      color:
                        stateMapping[state]?.textColor ||
                        stateMapping.default.textColor,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      marginBottom: "4px",
                      display: "inline-block",
                      marginRight: "4px",
                    }}
                  >
                    {stateMapping[state]?.text || state}: {count}
                  </Typography>
                ))}
                { resumen.conversacionesCitaAgendadaAccion != 0 && (
                <Typography
                    variant="body2"
                    style={{
                    backgroundColor: stateMapping["cita agendada"].color,
                    color: stateMapping["cita agendada"].textColor,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    marginBottom: "4px",
                    display: "inline-block",
                    marginRight: "4px",
                    }}
                >
                    {stateMapping["cita agendada"].text}: {resumen.conversacionesCitaAgendadaAccion}
                </Typography>
                )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Gráfico */}
      <Card className="w-3/4 bg-white shadow-md">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Conversaciones
          </Typography>
          <Grid container spacing={2} className="mb-4">
            <Grid item xs={12} md={12}>
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
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtros.estado}
                  onChange={(e) => handleInputChange("estado", e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {Object.keys(stateMapping)
                    .filter((state) => !["default"].includes(state))
                    .map((state) => (
                    <MenuItem key={state} value={state}>
                      {stateMapping[state].text}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Gestor</InputLabel>
                <Select
                  value={filtros.gestor}
                  onChange={(e) => handleInputChange("gestor", e.target.value)}
                  label="Gestor"
                >
                  <MenuItem value="">Todos</MenuItem>
                    {gestores.map((gestor) => (
                        <MenuItem key={gestor.asesor_id} value={gestor.nombre + " " + gestor.primer_apellido}>
                        {gestor.nombre} {gestor.primer_apellido}
                        </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Acción</InputLabel>
                <Select
                  value={filtros.accion}
                  onChange={(e) => handleInputChange("accion", e.target.value)}
                  label="Acción"
                >
                  <MenuItem value="">Todas</MenuItem>
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
            </Grid>
          </Grid>
          {loading ? (
            <Skeleton variant="rectangular" width="100%" height={300} />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={300} className={"mt-2"}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="num_conversaciones" fill="#00C853" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
