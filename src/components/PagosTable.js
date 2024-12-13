"use client";

import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import {   TextField,Select, MenuItem as SelectItem, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function PagosTable({ data,asesor, setRefresh }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null); 
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [editedData, setEditedData] = useState(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(false);


  const handleMenuOpen = (params, event) => {
    setSelectedRow(params.row);
    setEditedData({ ...params.row });
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    if (action === 'comercial') {
      setDialogTitle('Acción Comercial (Pago)');
    } else if (action === 'detalles') {
      setDialogTitle('Detalles del Pago');
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
      const response = await fetch(`/api/pagos/${editedData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fecha_pago: editedData.fecha_pago,
          monto: editedData.montoReal,
          metodo_pago: editedData.metodo_pago,
          estado_pago: editedData.estado_pago,
          notas: notes,
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

  const columns = [
    { field: 'fecha_pago', headerName: 'Fecha', flex: 1, minWidth: 120 },
    { field: 'monto', headerName: 'Monto', flex: 1, minWidth: 80,valueFormatter: (params) => params.value, },
    { field: 'metodo_pago', headerName: 'Método', flex: 1, minWidth: 120 },
    { field: 'estado_pago', headerName: 'Estado', flex: 1, minWidth: 100 },
    {
      field: 'actions', 
      headerName: 'Acciones', 
      width: 80, 
      sortable: false, 
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => handleMenuOpen(params, e)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      )
    }
  ];

  console.log("DATA PAGOS", data);
  const rows = data.map((pago) => ({
    id: pago.pago_id,
    fecha_pago: new Date(pago.fecha_pago).toLocaleString("es-ES", {
      timeZone: "America/Lima", // Cambia según tu zona horaria
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    monto: `S/. ${pago.monto}`,
    montoReal: pago.monto,
    metodo_pago: pago.metodo_pago,  
    estado_pago: pago.estado_pago,
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
        {/*<MenuItem onClick={() => handleAction('detalles')}>Ver Detalles</MenuItem>*/}
      </Menu>

      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <p>
            <strong>Usuario actual:</strong> {asesor.nombre + " " + asesor.primer_apellido}
          </p>
          {editedData && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Fecha"
                type="date"
                value={editedData.fecha_pago}
                onChange={(e) => handleInputChange("fecha_pago", e.target.value)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Monto (S/.)"
                type="number"
                value={editedData.montoReal}
                onChange={(e) => handleInputChange("montoReal", e.target.value)}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Método de Pago"
                value={editedData.metodo_pago}
                onChange={(e) => handleInputChange("metodo_pago", e.target.value)}
              />
              <Select
                fullWidth
                margin="normal"
                value={editedData.estado_pago}
                onChange={(e) => handleInputChange("estado_pago", e.target.value)}
              >
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
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
              />
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
    </div>
  );
}
