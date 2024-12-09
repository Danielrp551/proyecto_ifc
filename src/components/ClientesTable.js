"use client";

import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function ClientesTable({ 
    data,
    totalClientes,
    currentPage,
    pageSize,
    onPageChange,
    onPageSizeChange,
    setSelectedClientes,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [selectionModel, setSelectionModel] = useState([]); // Mantiene los IDs seleccionados

  const handleMenuOpen = (params, event) => {
    setSelectedRow(params.row);
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
  };

  const columns = [
    { field: "nombreCompleto", headerName: "Nombre", flex: 1, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 150 },
    { field: "celular", headerName: "Teléfono", flex: 1, minWidth: 120 },
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

  const rows = data.map((cliente) => ({
    id: cliente.cliente_id,
    nombreCompleto: `${cliente.nombre} ${cliente.apellido || ""}`.trim(),
    email: cliente.email,
    celular: cliente.celular,
  }));

  const handleSelectionChange = (newSelection) => {
    console.log("SELECTIONS : ",newSelection);
    setSelectionModel(newSelection); // Actualiza los seleccionados internamente
    setSelectedClientes(newSelection); // Notifica al componente principal
  };

  return (
    <div style={{ height: 300, width: "100%", border: "1px solid #ddd", borderRadius: "4px" }}>
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
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction("comercial")}>Acción Comercial</MenuItem>
        <MenuItem onClick={() => handleAction("detalles")}>Ver Detalles</MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          {selectedRow && (
            <div>
              <p>
                <strong>ID:</strong> {selectedRow.id}
              </p>
              <p>
                <strong>Nombre:</strong> {selectedRow.nombreCompleto}
              </p>
              <p>
                <strong>Email:</strong> {selectedRow.email}
              </p>
              <p>
                <strong>Teléfono:</strong> {selectedRow.celular}
              </p>
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
