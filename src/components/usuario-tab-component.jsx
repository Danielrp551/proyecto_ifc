"use client"

import { useState, useEffect } from "react"
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
  CircularProgress,
  TablePagination,
} from "@mui/material"
import { Add, Edit, Block } from "@mui/icons-material"
import { useSession } from "next-auth/react"

const roles = [
  {
    label: "Administrador",
    value: "admin",
  },
  {
    label: "Asesor",
    value: "asesor",
  },
]

const UsuarioTabComponent = () => {
  const [users, setUsers] = useState([])
  const [newUser, setNewUser] = useState({
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    celular: "",
    email: "",
    rol: "",
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [userToDisable, setUserToDisable] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usuarios, setUsuarios] = useState([])
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [error, setError] = useState(null)
  const [refresh, setRefresh] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const { data: session, status } = useSession()

  useEffect(() => {
    const fetchUsuarios = async () => {
      if (!session || !session.user) {
        console.log("Esperando a que la sesión esté disponible...")
        return
      }

      setLoading(true)
      try {
        const usuario_id = session?.user?.asesor?.usuario_id ? `&usuario_id=${session?.user?.asesor?.usuario_id}` : ""
        const response = await fetch(`/api/admin?page=${page + 1}&pageSize=${pageSize}${usuario_id}`)
        if (!response.ok) {
          throw new Error("Error al obtener los usuarios")
        }
        const data = await response.json()
        console.log("Usuarios:", data.usuarios)
        console.log("Asesor fetch : ", session?.user?.asesor)
        setUsuarios(data.usuarios)
        setTotalUsuarios(data.totalUsuarios)
      } catch (err) {
        console.error("Error al cargar los datos de los usuarios:", err)
        setError("Error al cargar los datos de los usuarios")
        setSnackbar({ open: true, message: "Error al cargar usuarios", severity: "error" })
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchUsuarios()
    }
  }, [page, pageSize, refresh, session, status])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewUser({ ...newUser, [name]: value })
  }

  const handleCreateUser = async () => {
    try {
      const response = await fetch(`/api/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Usuario creado con éxito",
          severity: "success",
        })
        setModalOpen(false)
        setRefresh(!refresh)
        setNewUser({
          nombre: "",
          primerApellido: "",
          segundoApellido: "",
          celular: "",
          email: "",
          rol: "",
        })
      } else {
        const errorData = await response.json()
        setSnackbar({
          open: true,
          message: errorData.message || "Error al crear el usuario",
          severity: "error",
        })
      }
    } catch (error) {
      console.error("Error al crear el usuario:", error)
      setSnackbar({
        open: true,
        message: "Error interno del servidor",
        severity: "error",
      })
    }
  }

  const handleEditUser = async () => {
    const updatedUser = {
      usuario_id: editingUser.usuario_id,
      username: editingUser.username,
      rol: editingUser.rol,
      nombre: editingUser.nombre,
      primerApellido: editingUser.primerApellido,
      segundoApellido: editingUser.segundoApellido,
    }

    try {
      const response = await fetch(`/api/admin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      })

      if (response.ok) {
        setEditModalOpen(false)
        setSnackbar({
          open: true,
          message: "Usuario actualizado con éxito",
          severity: "success",
        })
        setRefresh(!refresh)
      } else {
        throw new Error("Error al actualizar el usuario")
      }
    } catch (error) {
      console.error("Error al actualizar el usuario:", error)
      setSnackbar({
        open: true,
        message: "Error al actualizar el usuario",
        severity: "error",
      })
    }
  }

  const handleToggleUserStatus = async (usuario) => {
    try {
      const response = await fetch(`/api/admin`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: usuario.usuario_id,
          activo: usuario.activo ? 0 : 1,
        }),
      })

      if (response.ok) {
        setSnackbar({
          open: true,
          message: `Usuario ${usuario.activo ? "inhabilitado" : "habilitado"} con éxito`,
          severity: "success",
        })
        setRefresh(!refresh)
        setDisableDialogOpen(false)
      } else {
        throw new Error("Error al cambiar el estado del usuario")
      }
    } catch (error) {
      console.error("Error al cambiar el estado del usuario:", error)
      setSnackbar({
        open: true,
        message: "Error al cambiar el estado del usuario",
        severity: "error",
      })
    }
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setSnackbar({ ...snackbar, open: false })
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditingUser({ ...editingUser, [name]: value })
  }

  const handleEditClick = (user) => {
    const asesor = user.asesor[0]
    const editingUserObj = {
      usuario_id: user.usuario_id,
      username: user.username,
      nombre: asesor?.nombre || "",
      primerApellido: asesor?.primer_apellido || "",
      segundoApellido: asesor?.segundo_apellido || "",
      celular: asesor?.celular || "",
      rol: user.roles?.nombre_rol || "",
    }

    setEditingUser(editingUserObj)
    setEditModalOpen(true)
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (event) => {
    setPageSize(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <>
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !error && (
        <>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setModalOpen(true)}
              sx={{
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#115293",
                },
              }}
            >
              Crear Usuario
            </Button>
          </Box>

          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((user) => (
                  <TableRow key={user.usuario_id}>
                    <TableCell>{`${user.asesor[0].nombre} ${user.asesor[0].primer_apellido}`}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.roles.nombre_rol}</TableCell>
                    <TableCell>{user.activo ? "Activo" : "Inactivo"}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(user)}>
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setUserToDisable(user)
                          setDisableDialogOpen(true)
                        }}
                      >
                        <Block color={user.activo ? "action" : "error"} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalUsuarios}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handlePageSizeChange}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Usuarios por página"
          />
        </>
      )}

      {/* Error message */}
      {error && !loading && <Alert severity="error">{error}</Alert>}

      {/* Modal para crear usuario */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} aria-labelledby="modal-crear-usuario">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Crear Nuevo Usuario
          </Typography>
          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                name="nombre"
                label="Nombre"
                value={newUser.nombre}
                onChange={handleInputChange}
                required
              />
              <TextField
                sx={{ flex: 1 }}
                name="primerApellido"
                label="Primer Apellido"
                value={newUser.primerApellido}
                onChange={handleInputChange}
                required
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                name="segundoApellido"
                label="Segundo Apellido"
                value={newUser.segundoApellido}
                onChange={handleInputChange}
              />
              <TextField
                sx={{ flex: 1 }}
                name="celular"
                label="Celular"
                value={newUser.celular}
                onChange={handleInputChange}
                required
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                sx={{ flex: 1 }}
                name="email"
                label="Email"
                type="email"
                value={newUser.email}
                onChange={handleInputChange}
                required
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Rol</InputLabel>
                <Select name="rol" value={newUser.rol} onChange={handleInputChange} required>
                  {roles.map((rol, index) => (
                    <MenuItem key={index} value={rol.value}>
                      {rol.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Button
              variant="contained"
              onClick={handleCreateUser}
              sx={{
                mt: 2,
                backgroundColor: "#1976d2",
                "&:hover": {
                  backgroundColor: "#115293",
                },
              }}
            >
              Crear Usuario
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Modal para editar usuario */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} aria-labelledby="modal-editar-usuario">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Editar Usuario
          </Typography>
          {editingUser && (
            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                name="nombre"
                label="Nombre"
                value={editingUser.nombre}
                onChange={handleEditInputChange}
                required
              />
              <TextField
                name="primerApellido"
                label="Primer Apellido"
                value={editingUser.primerApellido}
                onChange={handleEditInputChange}
                required
              />
              <TextField
                name="username"
                label="Email (username)"
                type="email"
                value={editingUser.username}
                onChange={handleEditInputChange}
                required
              />

              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select name="rol" value={editingUser.rol} onChange={handleEditInputChange} required>
                  {roles.map((rol, index) => (
                    <MenuItem key={index} value={rol.value}>
                      {rol.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleEditUser}
                sx={{
                  mt: 2,
                  backgroundColor: "#1976d2",
                  "&:hover": {
                    backgroundColor: "#115293",
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
          {`¿Estás seguro de que quieres ${userToDisable?.activo ? "inhabilitar" : "habilitar"} este usuario?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {userToDisable?.activo
              ? "El usuario no podrá acceder al sistema si lo inhabilitas."
              : "El usuario podrá volver a acceder al sistema si lo habilitas."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDisableDialogOpen(false)}>Cancelar</Button>
          <Button onClick={() => handleToggleUserStatus(userToDisable)} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default UsuarioTabComponent
