"use client";

import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import { IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function PagosTable({ data }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null); 
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
  };

  const columns = [
    { field: 'fecha_pago', headerName: 'Fecha', flex: 1, minWidth: 120 },
    { field: 'monto', headerName: 'Monto', flex: 1, minWidth: 80 },
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

  const rows = data.map((pago) => ({
    id: pago.pago_id,
    fecha_pago: pago.fecha_pago.toString().slice(0,10),
    monto: `$${pago.monto}`,
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
        <MenuItem onClick={() => handleAction('detalles')}>Ver Detalles</MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          {selectedRow && (
            <div>
              <p><strong>ID:</strong> {selectedRow.id}</p>
              <p><strong>Fecha:</strong> {selectedRow.fecha_pago}</p>
              <p><strong>Monto:</strong> {selectedRow.monto}</p>
              <p><strong>Método:</strong> {selectedRow.metodo_pago}</p>
              <p><strong>Estado:</strong> {selectedRow.estado_pago}</p>
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
