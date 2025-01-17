"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { getActionInfo } from "@/app/utils/actionMapping";
import { getStateInfo } from "@/app/utils/stateMapping";
import { endOfDay, startOfDay } from "date-fns";
import { DateFilterv2 } from "./date-filter_v2";

const Reporte = () => {
  const [estadosData, setEstadosData] = useState([]);
  const [totalEstadosData, setTotalEstadosData] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [resetFilters, setResetFilters] = useState(false);

  const [filtros, setFiltros] = useState({
    dateRange: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
  });

  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  const [selectedPreset, setSelectedPreset] = useState("Hoy");

  useEffect(() => {
    const fetchEstadosData = async () => {
      setLoading(true);
      setError(null);   
      try {
        const dateRange =
          filtros.dateRange.from && filtros.dateRange.to
            ? `&fechaInicio=${filtros.dateRange.from.toISOString()}&fechaFin=${filtros.dateRange.to.toISOString()}`
            : "";
        const response = await fetch(`/api/dashboard/reporte?${dateRange}`);
        const data = await response.json();
        console.log("data estados", data);

        const estadosOrdenados = Object.entries(data.estados)
          .map(([estado, datos]) => ({
            estado,
            ...datos,
          }))
          .filter((item) => item.total > 0)
          .sort((a, b) => b.total - a.total);
        setEstadosData(estadosOrdenados);
        setTotalEstadosData(data.totalLeads);
      } catch (err) {
        console.error("Error al cargar los datos de los clientes:", err);
        setError("Error al cargar los datos. Por favor, intente de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchEstadosData();
  }, [filtros, refresh]);

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  const handleDateChange = (dateRange) => {
    setFiltros((prev) => ({
      ...prev,
      dateRange: dateRange,
    }));
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Skeleton variant="rectangular" height={50} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={400} />
        </>
      );
    }

    if (error) {
      return <Typography color="error">{error}</Typography>;
    }

    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 3, mt:2, borderRadius: '8px', gap:'16px' }}>
          <Typography variant="h6" component="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            Total de Leads:
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            {totalEstadosData}
          </Typography>
        </Box>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Estado</TableCell>
                <TableCell>Converge(%)</TableCell>
                <TableCell>Recencia(días)</TableCell>
                <TableCell>Intensity</TableCell>
                <TableCell>Accion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estadosData.length > 0 ? (
                estadosData.map((datos, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Chip
                        label={`${getStateInfo(datos.estado).text}: ${((datos.total/totalEstadosData)*100).toFixed(2)}%`}
                        sx={{
                          backgroundColor: getStateInfo(datos.estado).color,
                          color: getStateInfo(datos.estado).textColor,
                          fontWeight: "medium",
                        }}
                      />
                    </TableCell>
                    <TableCell>{datos.converge + "%"}</TableCell>
                    <TableCell>{datos.recencia}</TableCell>
                    <TableCell>{datos.intensity}</TableCell>
                    <TableCell>
                      {Object.entries(datos.accion).map(([accion, count]) => (
                        <Chip
                          key={accion}
                          label={`${getActionInfo(accion).text}: ${count}`}
                          sx={{
                            backgroundColor: getActionInfo(accion).color,
                            color: getActionInfo(accion).textColor,
                            fontWeight: "normal",
                            m: 0.5,
                          }}
                        />
                      ))}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No se encontraron datos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', backgroundColor: '#FFFFFF' }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#333' }}>
          Reporte de Leads
        </Typography>
        <Tooltip title="Refrescar">
          <IconButton onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
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
        {/*
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Fecha Inicio</InputLabel>
            <Select label="Fecha Inicio" value={startDate} onChange={(e) => setStartDate(e.target.value)}>
              <MenuItem value={startDate}>
                {startDate.toLocaleDateString()}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Fecha Fin</InputLabel>
            <Select label="Fecha Fin" value={endDate} onChange={(e) => setEndDate(e.target.value)}>
              <MenuItem value={endDate}>
                {endDate.toLocaleDateString()}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        */}
      </Grid>

      {renderContent()}
    </Paper>
  );
};

export default Reporte;

