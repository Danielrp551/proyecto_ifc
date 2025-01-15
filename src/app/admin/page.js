"use client"

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Add, Edit, Block } from '@mui/icons-material';

const roles = ['Administrador', 'Gestor', 'Usuario'];

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    celular: '',
    email: '',
    rol: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [userToDisable, setUserToDisable] = useState(null);

  useEffect(() => {
    // Aquí normalmente harías una llamada a la API para obtener los usuarios
    // Por ahora, usaremos datos de ejemplo
    setUsers([
      { id: 1, nombre: 'Juan', primerApellido: 'Pérez', email: 'juan@example.com', rol: 'Gestor', activo: true },
      { id: 2, nombre: 'María', primerApellido: 'González', email: 'maria@example.com', rol: 'Usuario', activo: true },
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleCreateUser = () => {
    // Aquí normalmente enviarías los datos a tu API
    const createdUser = { ...newUser, id: users.length + 1, activo: true };
    setUsers([...users, createdUser]);
    setNewUser({
      nombre: '',
      primerApellido: '',
      segundoApellido: '',
      celular: '',
      email: '',
      rol: '',
    });
    setModalOpen(false);
    setSnackbar({ open: true, message: 'Usuario creado con éxito', severity: 'success' });
  };

  const handleEditUser = () => {
    setUsers(users.map(user => 
      user.id === editingUser.id ? editingUser : user
    ));
    setEditModalOpen(false);
    setSnackbar({ open: true, message: 'Usuario actualizado con éxito', severity: 'success' });
  };

  const handleToggleUserStatus = () => {
    setUsers(users.map(user => 
      user.id === userToDisable.id ? { ...user, activo: !user.activo } : user
    ));
    setDisableDialogOpen(false);
    setSnackbar({ open: true, message: 'Estado del usuario actualizado', severity: 'info' });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: '#333' }}>
        Administración de Usuarios
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setModalOpen(true)}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#115293',
            },
          }}
        >
          Crear Usuario
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{`${user.nombre} ${user.primerApellido}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.rol}</TableCell>
                <TableCell>{user.activo ? 'Activo' : 'Inactivo'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => {
                    setEditingUser(user);
                    setEditModalOpen(true);
                  }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => {
                    setUserToDisable(user);
                    setDisableDialogOpen(true);
                  }}>
                    <Block color={user.activo ? 'action' : 'error'} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para crear usuario */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="modal-crear-usuario"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Crear Nuevo Usuario
          </Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="nombre"
              label="Nombre"
              value={newUser.nombre}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="primerApellido"
              label="Primer Apellido"
              value={newUser.primerApellido}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="segundoApellido"
              label="Segundo Apellido"
              value={newUser.segundoApellido}
              onChange={handleInputChange}
            />
            <TextField
              name="celular"
              label="Celular"
              value={newUser.celular}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={newUser.email}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                name="rol"
                value={newUser.rol}
                onChange={handleInputChange}
                required
              >
                {roles.map((rol) => (
                  <MenuItem key={rol} value={rol}>{rol}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleCreateUser}
              sx={{
                mt: 2,
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#115293',
                },
              }}
            >
              Crear Usuario
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal para editar usuario */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        aria-labelledby="modal-editar-usuario"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Editar Usuario
          </Typography>
          {editingUser && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                name="nombre"
                label="Nombre"
                value={editingUser.nombre}
                onChange={(e) => setEditingUser({...editingUser, nombre: e.target.value})}
                required
              />
              <TextField
                name="primerApellido"
                label="Primer Apellido"
                value={editingUser.primerApellido}
                onChange={(e) => setEditingUser({...editingUser, primerApellido: e.target.value})}
                required
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  name="rol"
                  value={editingUser.rol}
                  onChange={(e) => setEditingUser({...editingUser, rol: e.target.value})}
                  required
                >
                  {roles.map((rol) => (
                    <MenuItem key={rol} value={rol}>{rol}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleEditUser}
                sx={{
                  mt: 2,
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#115293',
                  },
                }}
              >
                Guardar Cambios
              </Button>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Diálogo de confirmación para inhabilitar/habilitar usuario */}
      <Dialog
        open={disableDialogOpen}
        onClose={() => setDisableDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`¿Estás seguro de que quieres ${userToDisable?.activo ? 'inhabilitar' : 'habilitar'} este usuario?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {userToDisable?.activo
              ? 'El usuario no podrá acceder al sistema si lo inhabilitas.'
              : 'El usuario podrá volver a acceder al sistema si lo habilitas.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisableDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleToggleUserStatus} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPage;

