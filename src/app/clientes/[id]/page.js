"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import React from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Tabs,
  Tab,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Person,
  Phone,
  Email,
  CalendarToday,
  AttachMoney,
  Assignment,
  Chat,
} from "@mui/icons-material";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ClientDetails() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedConversation, setSelectedConversation] = useState(0);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${id}`);
        if (!response.ok)
          throw new Error("Error al obtener los detalles del cliente");
        const data = await response.json();
        setClient(data);
        //if (data.conversaciones && data.conversaciones.length > 0) {
        //    setSelectedConversation(0);
        //  }
        console.log("CLIENTE : ", data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchClient();
  }, [id]);

  useEffect(() => {
    if (client?.conversaciones && client.conversaciones.length > 0) {
      setSelectedConversation(0);
    }
  }, [client]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="py-8">
      <Paper elevation={3} className="p-6">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h4" gutterBottom className="flex items-center">
              <Person className="mr-2" />
              {client.nombre} {client.apellido}
            </Typography>
            <Chip
              label={client.estado || "Activo"}
              color={client.estado === "activo" ? "success" : "default"}
              className="mb-4"
            />
            <Typography variant="body1" className="flex items-center mb-2">
              <Phone className="mr-2" /> {client.celular}
            </Typography>
            <Typography variant="body1" className="flex items-center mb-2">
              <Email className="mr-2" /> {client.email}
            </Typography>
            <Typography variant="body2" color="textSecondary" className="mt-4">
              Cliente desde:{" "}
              {new Date(client.fecha_creacion).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="client details tabs"
              scrollButtons="auto"
              variant="scrollable"
            >
              <Tab label="Información General" />
              <Tab label="Citas" />
              <Tab label="Pagos" />
              <Tab label="Acciones Comerciales" />
              <Tab label="Conversaciones" />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Documento de Identidad"
                    secondary={`${client.tipo_documento}: ${client.documento_identidad}`}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Última Interacción"
                    secondary={
                      client.fecha_ultima_interaccion
                        ? new Date(
                            client.fecha_ultima_interaccion
                          ).toLocaleString()
                        : "N/A"
                    }
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Última Interacción Bot"
                    secondary={
                      client.fecha_ultima_interaccion_bot
                        ? new Date(
                            client.fecha_ultima_interaccion_bot
                          ).toLocaleString()
                        : "N/A"
                    }
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Tipo de Cliente"
                    secondary={client.bound ? "Inbound" : "Outbound"}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Categoría No Interés"
                    secondary={client.categoria_no_interes || "N/A"}
                  />
                </ListItem>
                {client.categoria_no_interes && (
                  <>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Detalle No Interés"
                        secondary={client.detalle_no_interes || "N/A"}
                      />
                    </ListItem>
                  </>
                )}
                <Divider component="li" />
                <ListItem>
                  <ListItemText
                    primary="Observaciones"
                    secondary={client.observaciones || "Sin observaciones"}
                  />
                </ListItem>
              </List>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Typography
                variant="h6"
                gutterBottom
                className="flex items-center"
              >
                <CalendarToday className="mr-2" /> Citas
              </Typography>
              {client.citas && client.citas.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Motivo</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {client.citas.map((cita) => (
                        <TableRow key={cita.cita_id}>
                          <TableCell>
                            {new Date(cita.fecha_cita).toLocaleString()}
                          </TableCell>
                          <TableCell>{cita.motivo}</TableCell>
                          <TableCell>{cita.estado_cita}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>No hay citas registradas</Typography>
              )}
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <Typography
                variant="h6"
                gutterBottom
                className="flex items-center"
              >
                <AttachMoney className="mr-2" /> Pagos
              </Typography>
              {client.pagos && client.pagos.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Monto</TableCell>
                        <TableCell>Método</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {client.pagos.map((pago) => (
                        <TableRow key={pago.pago_id}>
                          <TableCell>
                            {new Date(pago.fecha_pago).toLocaleDateString()}
                          </TableCell>
                          <TableCell>${pago.monto}</TableCell>
                          <TableCell>{pago.metodo_pago}</TableCell>
                          <TableCell>{pago.estado_pago}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>No hay pagos registrados</Typography>
              )}
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <Typography
                variant="h6"
                gutterBottom
                className="flex items-center"
              >
                <Assignment className="mr-2" /> Acciones Comerciales
              </Typography>
              {client.acciones_comerciales &&
              client.acciones_comerciales.length > 0 ? (
                <List>
                  {client.acciones_comerciales.map((accion) => (
                    <React.Fragment key={accion.acciones_comerciales_id}>
                      <ListItem>
                        <ListItemText
                          primary={`Acción #${accion.acciones_comerciales_id}`}
                          secondary={accion.notas}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography>No hay acciones comerciales registradas</Typography>
              )}
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
              <Typography
                variant="h6"
                gutterBottom
                className="flex items-center mb-4"
              >
                <Chat className="mr-2" /> Conversaciones
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={2} className="p-4">
                    <Typography variant="subtitle1" gutterBottom>
                      Historial de Conversaciones
                    </Typography>
                    <List>
                      {client.conversaciones &&
                        client.conversaciones.map((conv, index) => (
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
                  <Paper
                    elevation={2}
                    className="p-4 h-[500px] overflow-y-auto"
                  >
                    {client.conversaciones &&
                      client.conversaciones[selectedConversation] &&
                      client.conversaciones[
                        selectedConversation
                      ]?.interacciones.map((message, index) => (
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
                                          weekday: "long", // Muestra el día de la semana (ej. lunes)
                                          year: "numeric", // Muestra el año
                                          month: "long", // Muestra el nombre del mes completo (ej. enero)
                                          day: "numeric", // Muestra el día
                                          hour: "2-digit", // Muestra la hora con dos dígitos
                                          minute: "2-digit", // Muestra los minutos con dos dígitos
                                        }
                                      )
                                    : "Fecha no disponible"}
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {/* Mensaje del chatbot */}
                          {message.mensaje_chatbot && (
                            <Box className="mb-4 flex justify-start">
                              <Box className="p-3 rounded-lg max-w-[70%] bg-blue-100 text-blue-800">
                                <Typography variant="body1">
                                  {message.mensaje_chatbot}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  className="mt-1 text-gray-500"
                                >
                                  {message.fecha
                                    ? new Date(message.fecha).toLocaleString(
                                        "es-ES",
                                        {
                                          weekday: "long", // Muestra el día de la semana (ej. lunes)
                                          year: "numeric", // Muestra el año
                                          month: "long", // Muestra el nombre del mes completo (ej. enero)
                                          day: "numeric", // Muestra el día
                                          hour: "2-digit", // Muestra la hora con dos dígitos
                                          minute: "2-digit", // Muestra los minutos con dos dígitos
                                        }
                                      )
                                    : "Fecha no disponible"}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </React.Fragment>
                      ))}
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
