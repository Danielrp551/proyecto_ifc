"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Paper, Tabs, Tab } from "@mui/material"
import { useSession } from "next-auth/react"
import UsuarioTabComponent from "../../components/usuario-tab-component"
import HorariosTabComponent from "../../components/horarios-tab-component"


// TabPanel component for Material UI tabs
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

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

const AdminPage = () => {
  const [tabValue, setTabValue] = useState(0)
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
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [error, setError] = useState(null)
  const [refresh, setRefresh] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const { data: session, status } = useSession()

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

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
        setUsers(data.usuarios)
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

  return (
    <Box sx={{ maxWidth: 1200, margin: "auto", mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: "#333" }}>
        Administración de Usuarios
      </Typography>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="Usuarios" />
          <Tab label="Horarios" />
        </Tabs>
      </Box>

      {/* Tab Panel 1: Usuarios */}
      <TabPanel value={tabValue} index={0}>
        <UsuarioTabComponent
          users={users}
          setUsers={setUsers}
          snackbar={snackbar}
          setSnackbar={setSnackbar}
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          newUser={newUser}
          setNewUser={setNewUser}
          editModalOpen={editModalOpen}
          setEditModalOpen={setEditModalOpen}
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          disableDialogOpen={disableDialogOpen}
          setDisableDialogOpen={setDisableDialogOpen}
          userToDisable={userToDisable}
          setUserToDisable={setUserToDisable}
          loading={loading}
          setLoading={setLoading}
          totalUsuarios={totalUsuarios}
          setTotalUsuarios={setTotalUsuarios}
          error={error}
          setError={setError}
          refresh={refresh}
          setRefresh={setRefresh}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
        />
      </TabPanel>

      {/* Tab Panel 2: Configuración */}
      <TabPanel value={tabValue} index={1}>
        <HorariosTabComponent />
      </TabPanel>
    </Box>
  )
}

export default AdminPage
