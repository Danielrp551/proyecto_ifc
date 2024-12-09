"use client";

import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import { Select, MenuItem as SelectItem ,TextField, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function CitasTable({ data,asesor, setRefresh }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null); // Para saber sobre qué fila se hizo click
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [editedData, setEditedData] = useState(null); // Datos editados de la cita
  const [notes, setNotes] = useState(""); // Notas del cambio
  const [error, setError] = useState(false); // Validación de notas


  const handleMenuOpen = (params, event) => {
    setSelectedRow(params.row);
    setEditedData({ ...params.row });
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    // Dependiendo de la acción:
    if (action === 'comercial') {
      setDialogTitle('Acción Comercial');
    } else if (action === 'detalles') {
      setDialogTitle('Detalles de la Cita');
    }
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNotes("");
    setError(false);
  };

  const handleSave = async () => {
    if (!notes.trim()) {
      setError(true);
      return;
    }

    try {
      const response = await fetch(`/api/citas/${editedData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fecha_cita: editedData.fecha_cita,
          motivo: editedData.motivo,
          estado_cita: editedData.estado_cita,
          notas : notes,
          asesorId: asesor.asesor_id
        }),
      });

      if (response.ok) {
        console.log("Datos guardados correctamente");
        setRefresh()
        handleDialogClose();
      } else {
        console.error("Error al guardar los cambios");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isPastDate = new Date(editedData?.fecha_cita) < new Date();

  const columns = [
    { field: 'fecha_cita', headerName: 'Fecha', flex: 1, minWidth: 100 },
    { field: 'motivo', headerName: 'Servicio', flex: 1, minWidth: 120 },
    { field: 'estado_cita', headerName: 'Estado', flex: 1, minWidth: 100 },
    {
      field: 'actions', headerName: 'Acciones', width: 80, sortable: false, renderCell: (params) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(params, e)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      )
    }
  ];

  const rows = data.map((cita) => ({
    id: cita.cita_id,
    fecha_cita: cita.fecha_cita.toString().slice(0,10),
    motivo: cita.motivo,
    estado_cita: cita.estado_cita,
  }));

  return (
    <div style={{ height: 300, width: '100%', border: '1px solid #ddd', borderRadius: '4px' }}>
      <DataGrid 
        rows={rows}
        columns={columns}
        pageSize={5}
        disableRowSelectionOnClick
        disableExtendRowFullWidth
        rowsPerPageOptions={[10, 20, 50]}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('comercial')}>Acción Comercial</MenuItem>
        <MenuItem onClick={() => handleAction('detalles')}>Ver Detalles</MenuItem>
      </Menu>


      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <p><strong>Usuario actual:</strong> {asesor.nombre + " "  + asesor.primer_apellido}</p>
          {editedData && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Fecha"
                type="date"
                value={editedData.fecha_cita}
                onChange={(e) => handleInputChange("fecha_cita", e.target.value)}
                disabled={isPastDate}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Motivo"
                value={editedData.motivo}
                onChange={(e) => handleInputChange("motivo", e.target.value)}
                disabled={isPastDate}
              />
              <Select
                fullWidth
                margin="normal"
                value={editedData.estado_cita}
                onChange={(e) => handleInputChange("estado_cita", e.target.value)}
                disabled={isPastDate}
              >
                <SelectItem value="agendada">Cita Agendada</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
              </Select>
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
                disabled={isPastDate}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cerrar</Button>
          <Button onClick={handleSave} variant="contained" color="primary" disabled={isPastDate}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
