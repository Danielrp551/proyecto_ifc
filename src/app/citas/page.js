"use client";

import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  Paper,
  IconButton,
  Button,
  ButtonGroup,
  useTheme,
  styled,
  Tooltip,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
  Help,
} from "@mui/icons-material";
import { endOfDay, startOfDay } from "date-fns";
import Skeleton from '@mui/material/Skeleton';


const StyledButton = styled(Button)(({ theme }) => ({
  color: "#000",
  backgroundColor: "transparent",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
}));

const EventTooltip = ({ event }) => {
    const startTime = new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <Box>
        <Typography variant="subtitle1"><strong>{event.title}</strong></Typography>
        <Typography variant="body2">Hora: {startTime} - {endTime}</Typography>
        <Typography variant="body2">Estado: {event.extendedProps.estado || 'No especificado'}</Typography>
      </Box>
    );
  };

const CalendarPage = () => {
  const [view, setView] = useState("timeGridWeek");
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga inicializado en true
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [endDate, setEndDate] = useState(endOfDay(new Date()));
  const [filtros, setFiltros] = useState({
    dateRange: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
  });

  useEffect(() => {
    const fetchCitas = async () => {
      setLoading(true); // Activar la carga al iniciar la solicitud
      try {
        const dateRange =
          filtros.dateRange.from && filtros.dateRange.to
            ? `fechaInicio=${filtros.dateRange.from.toISOString()}&fechaFin=${filtros.dateRange.to.toISOString()}`
            : "";
        const response = await fetch(`/api/citas?${dateRange}`);
        const data = await response.json();
        // Mapear la respuesta al formato de FullCalendar
        const mappedEvents = data.citas.map((cita) => {
            const startDate = new Date(cita.fecha_cita);
            const correctedStartDate = new Date(startDate.getTime() + 5 * 60 * 60 * 1000); // + 5 horas
            const endDate = new Date(correctedStartDate.getTime() + 30 * 60 * 1000);
          return {
            title: `${cita.clientes.nombre} - ${cita.motivo}`,
            start: correctedStartDate.toISOString(), // Asegúrate de que esté en formato ISO
            end: endDate.toISOString(), // Si tienes fecha de fin
            backgroundColor:
                cita.estado_cita === "agendada" ? "#1a73e8" :
                cita.estado_cita === "eliminada" ? "#e67c73" :
                cita.estado_cita === "confirmada" ? "#34a853" : "#000000", 
            borderColor:
                cita.estado_cita === "agendada" ? "#1a73e8" :
                cita.estado_cita === "eliminada" ? "#e67c73" :
                cita.estado_cita === "confirmada" ? "#34a853" : "#000000",
            estado: 
                cita.estado_cita === "agendada" ? "Agendada" :
                cita.estado_cita === "eliminada" ? "Eliminada" :
                cita.estado_cita === "confirmada" ? "Confirmada" : "No especificado",
            display: "block",
          };
        });

        console.log("data", data);
        setCitas(mappedEvents);
      } catch (err) {
        setError("Error al cargar los datos de las citas");
        setSnackbarMessage("Error al cargar las citas");
        setOpenSnackbar(true);
      } finally {
        setLoading(false); // Desactivar la carga al finalizar la solicitud
      }
    };

    fetchCitas();
  }, [refresh]);

  const calendarRef = useRef(null);

  const handleViewChange = (newView) => {
    setView(newView);
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(newView);
  };

  const handleTodayClick = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.today();
  };

  const handlePrevClick = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.prev();
  };

  const handleNextClick = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
  };

  const handleDateSet = (dateInfo) => {
    const newFrom = new Date(dateInfo.start);
    const newTo = new Date(dateInfo.end);
  
    // Evita actualizar `filtros` si el rango es el mismo
    if (
      filtros.dateRange.from.getTime() !== newFrom.getTime() ||
      filtros.dateRange.to.getTime() !== newTo.getTime()
    ) {
      setFiltros({
        dateRange: {
          from: newFrom,
          to: newTo,
        },
      });
      setRefresh(!refresh);
    }
  };

  return (
    <Box
      sx={{
        height: "auto",
        backgroundColor: "#ffffff",
        margin: -3,
        padding: 3,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          backgroundColor: "#ffffff",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            px: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <StyledButton
              variant="contained"
              onClick={handleTodayClick}
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.08)",
                borderRadius: "40px",
                color: "#000",
              }}
            >
              Hoy
            </StyledButton>
            <ButtonGroup>
              <IconButton
                size="small"
                sx={{ color: "#000" }}
                onClick={handlePrevClick}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: "#000" }}
                onClick={handleNextClick}
              >
                <ChevronRight />
              </IconButton>
            </ButtonGroup>
          </Box>

          <ButtonGroup
            variant="contained"
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.08)",
              borderRadius: "40px",
              overflow: "hidden",
            }}
          >
            <StyledButton
              onClick={() => handleViewChange("timeGridDay")}
              sx={{
                backgroundColor:
                  view === "timeGridDay"
                    ? "rgba(0, 0, 0, 0.12)"
                    : "transparent",
                color: "#000",
              }}
            >
              Día
            </StyledButton>
            <StyledButton
              onClick={() => handleViewChange("timeGridWeek")}
              sx={{
                backgroundColor:
                  view === "timeGridWeek"
                    ? "rgba(0, 0, 0, 0.12)"
                    : "transparent",
                color: "#000",
              }}
            >
              Semana
            </StyledButton>
            <StyledButton
              onClick={() => handleViewChange("dayGridMonth")}
              sx={{
                backgroundColor:
                  view === "dayGridMonth"
                    ? "rgba(0, 0, 0, 0.12)"
                    : "transparent",
                color: "#000",
              }}
            >
              Mes
            </StyledButton>
          </ButtonGroup>
            {/*
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton size="small" sx={{ color: "#000" }}>
              <Search />
            </IconButton>
            <IconButton size="small" sx={{ color: "#000" }}>
              <Help />
            </IconButton>
            <IconButton size="small" sx={{ color: "#000" }}>
              <Settings />
            </IconButton>
          </Box>
          */}
        </Box>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {loading && (
            <Box sx={{ height: "500px", display: "flex", flexDirection: "column" }}>
              {/* Skeleton para la cabecera del calendario */}
              <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
              {/* Skeletons para las filas del calendario */}
              {[...Array(7)].map((_, index) => (
                <Box key={index} sx={{ display: "flex", mb: 1 }}>
                  <Skeleton variant="rectangular" width={100} height={30} sx={{ mr: 1 }} />
                  <Skeleton variant="rectangular" width="100%" height={30} />
                </Box>
              ))}
            </Box>
          )}
          {!loading && (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={view}
              events={citas}
              datesSet={handleDateSet}
              height="auto"
              slotMinTime="08:00:00"
              slotMaxTime="22:00:00"
              slotDuration="00:15:00"
              allDaySlot={false}
              stickyHeaderDates={true}
              nowIndicator={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              locale="es"
              firstDay={1}
              expandRows={true}
              themeSystem="standard"
              editable={true}
              eventMinHeight={40}
              views={{
                timeGridWeek: {
                  dayHeaderFormat: {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    omitCommas: true,
                  },
                },
                timeGridDay: {
                  dayHeaderFormat: {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    omitCommas: true,
                  },
                },
              }}
              eventTimeFormat={{
                hour: "numeric",
                minute: "2-digit",
                meridiem: "short",
              }}
              eventContent={(eventInfo) => (
                  <Tooltip title={<EventTooltip event={eventInfo.event} />} arrow>
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      overflow: 'hidden', 
                      color: 'white',
                      padding: '4px 6px',
                      minHeight: '40px', 
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', lineHeight: 1.2, mb: 0.5 }}>
                        {eventInfo.event.title}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', lineHeight: 1 }}>
                        {eventInfo.timeText}
                      </Typography>
                    </Box>
                  </Tooltip>
                )}
            />
          )}
        </Box>
      </Paper>

            <Snackbar
              open={openSnackbar}
              autoHideDuration={4000}
              onClose={() => setOpenSnackbar(false)}
            >
              <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
    </Box>
  );
};

export default CalendarPage;
