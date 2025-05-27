"use client"

import { useState, useEffect } from "react"
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material"

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 2,
}

export default function ModalTomarControlCliente({ open, onClose, clienteId, asesorId, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [estadoControl, setEstadoControl] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open && clienteId) {
      setLoading(true)
      setError("")
      fetch(`/api/clients/control?clienteId=${clienteId}`)
        .then((res) => res.json())
        .then((data) => {
          setEstadoControl(data.tipo_control)
        })
        .catch((err) => {
          console.error("Error al verificar el control:", err)
          setError("No se pudo verificar el estado del cliente.")
        })
        .finally(() => setLoading(false))
    }
  }, [open, clienteId])

  const handleTomarControl = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/clients/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId, asesorId }),
      })
      const result = await res.json()
      if (res.ok) {
        if (onSuccess) onSuccess()
        onClose()
      } else {
        setError(result.message || "Error al tomar control.")
      }
    } catch (err) {
      console.error(err)
      setError("Error en la conexión con el servidor.")
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    if (loading) {
      return <CircularProgress size={24} />
    }

    if (error) {
      return <Typography color="error">{error}</Typography>
    }

    if (estadoControl === "asesor") {
      return (
        <Typography>
          Este cliente ya está siendo atendido por otro asesor. No puedes tomar control.
        </Typography>
      )
    }

    if (estadoControl === "bot") {
      return (
        <>
          <Typography>
            Este cliente está siendo atendido por el bot. ¿Deseas tomar el control?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button variant="outlined" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleTomarControl} disabled={loading}>
              Confirmar
            </Button>
          </Box>
        </>
      )
    }

    return <Typography>No se pudo determinar el estado de control.</Typography>
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          Tomar control del cliente
        </Typography>
        {renderContent()}
      </Box>
    </Modal>
  )
}
