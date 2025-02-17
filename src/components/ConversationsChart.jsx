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
  Switch,
  FormControlLabel,
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
import { endOfDay, startOfDay, differenceInHours } from "date-fns";
import { DateFilterv2 } from "./date-filter_v2";
import { stateMapping, getStateInfo } from "@/app/utils/stateMapping";

export default function ConversationsChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [data, setData] = useState([]);
  const [resumen, setResumen] = useState({});
  const [totalConversaciones, setTotalConversaciones] = useState(0);
  const [nuevasConversaciones, setNuevasConversaciones] = useState([]);
  const [resumenNuevasConversaciones, setResumenNuevasConversaciones] = useState({});
  const [totalConversacionesNuevas, setTotalConversacionesNuevas] = useState(0);
  const [mostrarNuevas, setMostrarNuevas] = useState(false);


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
        const cantidadHoras = differenceInHours(
          filtros.dateRange.to,
          filtros.dateRange.from
        );
        const gastos =
          data.totalInteracciones * 0.0192 + cantidadHoras * (0.0464 + 0.017);
        console.log("Gastos", gastos);
        setData(data.conversacionesPorFecha);
        setResumen({
          conversacionesGestionadas: data.conversacionesGestionadas,
          conversacionesPorEstado: data.conversacionesPorEstado,
          conversacionesCitaAgendadaAccion: data.numCitaAgendada,
          totalInteracciones: data.totalInteracciones,
          gastosAprox: gastos,
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
  }, [filtros]);

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

  useEffect(() => {
    const fetchNuevasConversaciones = async () => {
      setLoading(true);
      try {
        const estado = filtros.estado ? `&estado=${filtros.estado}` : "";
        const gestor = filtros.gestor ? `&asesor=${filtros.gestor}` : "";
        const accion = filtros.accion ? `&accion=${filtros.accion}` : "";
        const dateRange =
        filtros.dateRange.from && filtros.dateRange.to
          ? `&fechaInicio=${filtros.dateRange.from.toISOString()}&fechaFin=${filtros.dateRange.to.toISOString()}`
          : "";
        const response = await fetch(
          `/api/dashboard/nuevas-conversaciones?${dateRange}${estado}${gestor}${accion}`
        );
        const data = await response.json();
        console.log("data nuevas conversaciones: ", data);
        const cantidadHoras = differenceInHours(
          filtros.dateRange.to,
          filtros.dateRange.from
        );
        const gastos =
          data.totalInteracciones * 0.0192 + cantidadHoras * (0.0464 + 0.017);
        setNuevasConversaciones(data.conversacionesPorFecha);
        setResumenNuevasConversaciones({
          conversacionesGestionadas: data.conversacionesGestionadas,
          conversacionesPorEstado: data.conversacionesPorEstado,
          conversacionesCitaAgendadaAccion: data.numCitaAgendada,
          totalInteracciones: data.totalInteracciones,
          gastosAprox: gastos,
        });
        setTotalConversacionesNuevas(data.totalConversaciones);
      } catch (err) {
        setError("No se pudieron cargar los datos de las nuevas conversaciones");
        setSnackbarMessage("Error al cargar información de las nuevas conversaciones");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNuevasConversaciones();  
  }, [filtros]);

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

  const resumenActual = mostrarNuevas ? resumenNuevasConversaciones : resumen;
  const totalConversacionesActual = mostrarNuevas ? totalConversacionesNuevas : totalConversaciones;

  return (
    <Box className="flex gap-4">
      {/* Panel de resumen */}
      <Card className="w-1/4 bg-white shadow-md">
        <CardContent>
          <Typography variant="h6" className="mb-4">
             {mostrarNuevas ? "Resumen de Nuevas Conversaciones" : "Resumen de Conversaciones"}
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
                <FormControlLabel
                  control={
                    <Switch
                      checked={mostrarNuevas}
                      onChange={() => setMostrarNuevas(!mostrarNuevas)}
                      color="primary"
                    />
                  }
                  label={mostrarNuevas ? "Ver conversaciones actuales" : "Ver nuevas conversaciones"}
                />
              <Typography variant="h4" className="text-green-600 font-bold">
                {totalConversacionesActual}
              </Typography>
              <Typography className="text-gray-500">
                Total en el periodo seleccionado
              </Typography>
              <Divider className="my-2" />
              <Typography variant="body2" className="text-gray-600">
                Conversaciones gestionadas:{" "}
                <strong>{resumenActual.conversacionesGestionadas}</strong>
              </Typography>
              <Divider className="my-2" />
              <Typography variant="subtitle2" className="mt-2 mb-1">
                Conversaciones por estado:
              </Typography>
              
              {Object.entries(resumenActual.conversacionesPorEstado || {})
                .filter(([state]) => !["nuevo", "contactado"].includes(state))
                .map(([state, count]) => (
                  <Typography
                    key={state}
                    variant="body2"
                    style={{
                      backgroundColor:
                        getStateInfo(state)?.color || getStateInfo(state).color,
                      color:
                        getStateInfo(state)?.textColor ||
                        getStateInfo(state).textColor,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      marginBottom: "4px",
                      display: "inline-block",
                      marginRight: "4px",
                    }}
                  >
                    {getStateInfo(state)?.text || state}: {count}
                  </Typography>
                ))}
              {resumenActual.conversacionesCitaAgendadaAccion != 0 && (
                <Typography
                  variant="body2"
                  style={{
                    backgroundColor: getStateInfo("cita agendada").color,
                    color: getStateInfo("cita agendada").textColor,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    marginBottom: "4px",
                    display: "inline-block",
                    marginRight: "4px",
                  }}
                >
                  {getStateInfo("cita agendada").text + " Accion"}:{" "}
                  {resumenActual.conversacionesCitaAgendadaAccion}
                </Typography>
              )}             
              <Divider className="my-2" />
              <Typography variant="body2" className="text-gray-600">
                Total de interacciones:{" "}
                <strong>{resumenActual.totalInteracciones}</strong>
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Gastos aproximados:{" "}
                <strong>${resumenActual.gastosAprox?.toFixed(2)}</strong>
              </Typography>
              <Typography variant="body1" className="text-gray-600 mt-2">
                Total de gastos general:{" "}
                <strong>${(resumen.gastosAprox+ resumenNuevasConversaciones.gastosAprox).toFixed(2)}</strong>
              </Typography>
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
                    <MenuItem
                      key={gestor.asesor_id}
                      value={gestor.nombre + " " + gestor.primer_apellido}
                    >
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
                  <MenuItem value="promesa_de_pago">Promesa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {loading ? (
            <Skeleton variant="rectangular" width="100%" height={300} />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={350} className={"mt-2"}>
              <BarChart data={mostrarNuevas ? nuevasConversaciones : data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="fecha"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="num_conversaciones"
                  name="Número de conversaciones"
                  fill="#00C853"
                />
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
