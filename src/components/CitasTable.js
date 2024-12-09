"use client";

import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import { IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function CitasTable({ data }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null); // Para saber sobre qué fila se hizo click
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');

  const handleMenuOpen = (params, event) => {
    setSelectedRow(params.row);
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
  };

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

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          {/* Aquí puedes mostrar la info relevante del selectedRow, por ejemplo: */}
          {selectedRow && (
            <div>
              <p><strong>ID:</strong> {selectedRow.id}</p>
              <p><strong>Fecha:</strong> {selectedRow.fecha_cita}</p>
              <p><strong>Motivo:</strong> {selectedRow.motivo}</p>
              <p><strong>Estado:</strong> {selectedRow.estado_cita}</p>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
