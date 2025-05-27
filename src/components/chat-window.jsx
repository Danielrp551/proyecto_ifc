"use client"

import { useState, useRef, useEffect } from "react"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import Avatar from "@mui/material/Avatar"
import InputBase from "@mui/material/InputBase"
import IconButton from "@mui/material/IconButton"
import SearchIcon from "@mui/icons-material/Search"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions"
import SendIcon from "@mui/icons-material/Send"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Modal from "@mui/material/Modal"
import Button from "@mui/material/Button"
import Alert from "@mui/material/Alert"
import Chip from "@mui/material/Chip"
import MessageBubble from "./message-bubble"

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return (
    date.toLocaleDateString([], { day: "numeric", month: "short" }) +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  )
}

export default function ChatWindow({ chat, onSendMessage }) {
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const open = Boolean(anchorEl)

  // Verificar si el chat ha terminado
  const hasEndedControl =
    chat.estado_conversacion === "finalizada" ||
    chat.interacciones.some(
      (interaction) => interaction.tipo_mensaje === "sistema" && interaction.mensaje_chatbot === "FIN CONTROL ASESOR",
    )

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLeaveConversation = () => {
    handleMenuClose()
    setModalOpen(true)
  }

  const handleConfirmLeave = () => {
    setModalOpen(false)
    // Aquí iría la lógica para dejar la conversación
  }

    useEffect(() => {
    if (chat?.interacciones?.length) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    }, [chat.interacciones])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage("")
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Paper
        elevation={0}
        square
        sx={{
          display: "flex",
          alignItems: "center",
          p: 1,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "#f0f2f5",
        }}
      >
        <Avatar
          alt={`${chat.cliente.nombre} ${chat.cliente.apellido}`}
          src={`/placeholder.svg?height=40&width=40&text=${chat.cliente.nombre.substring(0, 1)}${chat.cliente.apellido.substring(0, 1)}`}
          sx={{ mr: 1.5 }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1">
            {chat.cliente.nombre === "" && chat.cliente.apellido === ""
                ?  chat.cliente.celular
                : `${chat.cliente.nombre} ${chat.cliente.apellido}`
            }
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {chat.cliente.estado === "activo" ? "En línea" : `Última vez ${formatDateTime(chat.ultima_interaccion)}`}
            </Typography>
            <Chip
              label={chat.tipo_control}
              size="small"
              color={chat.tipo_control === "asesor" ? "success" : chat.tipo_control === "bot" ? "primary" : "default"}
              sx={{ fontSize: "10px", height: "18px" }}
            />
          </Box>
        </Box>
        <IconButton size="small" aria-label="search">
          <SearchIcon />
        </IconButton>
        <IconButton
          size="small"
          aria-label="more options"
          onClick={handleMenuClick}
          aria-controls={open ? "chat-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <MoreVertIcon />
        </IconButton>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          p: 2,
          bgcolor: "#e5ddd5",
          backgroundImage: "url('/whatsapp-bg.png')",
          backgroundRepeat: "repeat",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {chat.interacciones.map((interaction) => (
            <MessageBubble key={interaction._id} interaction={interaction} />
          ))}
          {hasEndedControl && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Esta conversación ha finalizado y no se pueden enviar más mensajes.
            </Alert>
          )}
          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* Menu */}
      <Menu
        id="chat-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{
          "aria-labelledby": "chat-options-button",
        }}
      >
        <MenuItem onClick={handleMenuClose}>Acción comercial</MenuItem>
        <MenuItem onClick={handleLeaveConversation}>Dejar conversación</MenuItem>
      </Menu>

      {/* Modal de confirmación */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="confirmation-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            Confirmar acción
          </Typography>
          <Typography id="confirmation-modal-description" sx={{ mb: 3 }}>
            ¿Estás seguro que ya no quieres tomar control de esta conversación?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button onClick={() => setModalOpen(false)} variant="outlined">
              Cancelar
            </Button>
            <Button onClick={handleConfirmLeave} variant="contained" color="primary">
              Confirmar
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Input - Solo se muestra si el chat no ha terminado */}
      {!hasEndedControl && (
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          square
          sx={{
            display: "flex",
            alignItems: "center",
            p: 1,
            bgcolor: "#f0f2f5",
          }}
        >
          <IconButton size="medium" sx={{ color: "text.secondary" }}>
            <EmojiEmotionsIcon />
          </IconButton>
          <InputBase
            sx={{
              ml: 1,
              flex: 1,
              bgcolor: "white",
              borderRadius: 2,
              px: 2,
              py: 0.5,
            }}
            placeholder="Escribe un mensaje aquí"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <IconButton
            type="submit"
            disabled={!newMessage.trim()}
            sx={{
              ml: 1,
              bgcolor: newMessage.trim() ? "#00a884" : "#e9edef",
              color: "white",
              "&:hover": {
                bgcolor: newMessage.trim() ? "#008f73" : "#e9edef",
              },
              "&.Mui-disabled": {
                color: "#a8a8a8",
              },
              width: 40,
              height: 40,
            }}
          >
            <SendIcon />
          </IconButton>
        </Paper>
      )}
    </Box>
  )
}
