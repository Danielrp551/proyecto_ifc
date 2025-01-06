"use client";

import { DataGrid } from "@mui/x-data-grid";
import { use, useState } from "react";
import {
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ClientesTable({
  data,
  totalClientes,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  setSelectedClientes,
  asesor,
  setRefresh,
  asesores,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [selectionModel, setSelectionModel] = useState([]); // Mantiene los IDs seleccionados
  const [editedData, setEditedData] = useState(null); // Datos editados del cliente
  const [notes, setNotes] = useState(""); // Notas del cambio
  const [error, setError] = useState(false); // Validación de notas

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const router = useRouter();

  const handleMenuOpen = (params, event) => {
    setSelectedRow(params.row);
    setEditedData({ ...params.row });
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    if (action === "comercial") {
      setDialogTitle("Acción Comercial (Cliente)");
    } else if (action === "detalles") {
      setDialogTitle("Detalles del Cliente");
    }
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNotes("");
    setError(false);
  };

  const saveChanges = async () => {
    try {
      const response = await fetch(`/api/clients/${editedData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombreCompleto: editedData.nombreCompleto,
          email: editedData.email,
          observaciones: editedData.observaciones,
          notas: notes,
          gestor: editedData.gestor,
          asesorId: asesor.asesor_id,
          acciones: editedData.acciones,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar los cambios.");
      }

      const data = await response.json();
      console.log("Cambios guardados:", data);

      setRefresh();
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
    /*
    if (!notes.trim()) {
      setError(true);
      return;
    }
    */
    // Aquí se implementaría la lógica para guardar los cambios (API o lógica adicional)
    console.log("Datos guardados:", editedData);
    console.log("Notas:", notes);
    saveChanges();
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const columns = [
    { field: "nombreCompleto", headerName: "Nombre", flex: 1, minWidth: 150 },
    { field: "celular", headerName: "Teléfono", flex: 1, minWidth: 120 },
    { field: "estado", headerName: "Estado", flex: 1, minWidth: 100 },
    { field: "bound", headerName: "Bound", flex: 1, minWidth: 100 },
    { field: "gestor", headerName: "Gestor", flex: 1, minWidth: 100 },
    {
      field: "actions",
      headerName: "Acciones",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(params, e)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];
  console.log("DATA CLIENTES", data);
  const rows = data.map((cliente) => ({
    id: cliente.cliente_id,
    nombreCompleto: `${cliente.nombre} ${cliente.apellido || ""}`.trim(),
    email: cliente.email || "",
    celular: cliente.celular,
    estado: cliente.estado,
    bound: cliente.bound === true ? "INBOUND" : "OUTBOUND",
    fecha_creacion: cliente.fecha_creacion,
    fecha_ultima_interaccion: cliente.fecha_ultima_interaccion,
    observaciones: cliente.observaciones || "",
    gestor: cliente.gestor !== "" ? cliente.gestor : " - ",
    acciones: cliente.acciones,
  }));

  const handleSelectionChange = (newSelection) => {
    console.log("SELECTIONS : ", newSelection);
    setSelectionModel(newSelection); // Actualiza los seleccionados internamente
    setSelectedClientes(newSelection); // Notifica al componente principal
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleViewDetails = (id) => {
    router.push(`/clientes/${id}`); // Redirige a la página de detalles del cliente
  };

  return (
    <div
      style={{
        height: 300,
        width: "100%",
        border: "1px solid #ddd",
        borderRadius: "4px",
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        paginationMode="server"
        pageSize={pageSize}
        paginationModel={{
          page: currentPage - 1, // 0-indexado
          pageSize,
        }}
        onPaginationModelChange={({ page, pageSize }) => {
          onPageChange(page + 1); // 1-indexado
          onPageSizeChange(pageSize);
        }}
        rowCount={totalClientes}
        checkboxSelection
        rowsPerPageOptions={[5, 10, 20]}
        onRowSelectionModelChange={handleSelectionChange}
        disableRowSelectionOnClick
        disableExtendRowFullWidth
        pagination
        getRowClassName={
          (params) =>
            params.row.gestor === " - "
              ? "bg-red-50" // Rojo suave si no está gestionado
              : "bg-blue-50" // Azul suave si está gestionado
        }
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction("comercial")}>
          Acción Comercial
        </MenuItem>
        <MenuItem onClick={() => handleViewDetails(selectedRow?.id)}>
          Ver Detalles
        </MenuItem>
        {/*<MenuItem onClick={() => handleAction('detalles')}>Ver Detalles</MenuItem>*/}
      </Menu>

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <p>
            <strong>Usuario actual:</strong>{" "}
            {asesor.nombre + " " + asesor.primer_apellido}
          </p>
          {editedData && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Nombre"
                value={editedData.nombreCompleto}
                onChange={(e) =>
                  handleInputChange("nombreCompleto", e.target.value)
                }
              />
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                value={editedData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Teléfono"
                value={editedData.celular}
                InputProps={{ readOnly: true }} // No se puede editar el teléfono
              />
              <FormControl fullWidth variant="outlined" size="medium">
                <InputLabel htmlFor="gestor">Gestor</InputLabel>
                <Select
                  fullWidth
                  label="Gestor"
                  margin="normal"
                  value={editedData.gestor}
                  onChange={(e) =>
                    handleInputChange("gestor", e.target.value)
                  }
                >
                  <MenuItem value=" - ">Sin gestor asignado</MenuItem>
                  {asesores.map((asesor) => (
                    <MenuItem key={asesor.asesor_id} value={asesor.nombre + " " + asesor.primer_apellido}>
                      {asesor.nombre} {asesor.primer_apellido}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                margin="normal"
                label="Observaciones"
                value={editedData.observaciones}
                multiline
                rows={4}
                onChange={(e) =>
                  handleInputChange("observaciones", e.target.value)
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
                    handleInputChange("acciones", e.target.value)
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
                </Select>
              </FormControl>

              {/*
              <TextField
                fullWidth
                margin="normal"
                label="Notas (obligatorio)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                error={error}
                helperText={error ? "Las notas son obligatorias" : ""}
                multiline
                rows={4}
              />
              */}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cerrar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Guardar
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
    </div>
  );
}
