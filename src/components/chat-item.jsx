"use client"

import ListItem from "@mui/material/ListItem"
import ListItemAvatar from "@mui/material/ListItemAvatar"
import ListItemText from "@mui/material/ListItemText"
import Avatar from "@mui/material/Avatar"
import Typography from "@mui/material/Typography"
import Badge from "@mui/material/Badge"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

const getLastMessage = (interacciones) => {
  if (!interacciones || interacciones.length === 0) return "Sin mensajes"

  const lastInteraction = interacciones[interacciones.length - 1]
  return lastInteraction.mensaje_cliente || lastInteraction.mensaje_chatbot || "Sin mensaje"
}

const getControlTypeColor = (tipoControl) => {
  switch (tipoControl) {
    case "bot":
      return { color: "#1976d2", text: "Bot" }
    case "asesor":
      return { color: "#2e7d32", text: "Asesor" }
    case "finalizado":
      return { color: "#d32f2f", text: "Finalizado" }
    default:
      return { color: "#757575", text: "Sin asignar" }
  }
}

export default function ChatItem({ chat, isSelected, onClick }) {
  const controlInfo = getControlTypeColor(chat.tipo_control)
  const lastMessage = getLastMessage(chat.interacciones)

  return (
    <ListItem
      alignItems="flex-start"
      onClick={onClick}
      sx={{
        cursor: "pointer",
        bgcolor: isSelected ? "action.selected" : "background.paper",
        "&:hover": {
          bgcolor: "action.hover",
        },
        borderBottom: 1,
        borderColor: "divider",
        py: 1,
      }}
    >
      <ListItemAvatar>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: chat.cliente.estado === "activo" ? "#44b700" : "transparent",
              boxShadow: chat.cliente.estado === "activo" ? "0 0 0 2px white" : "none",
            },
          }}
        >
          <Avatar
            alt={`${chat.cliente.nombre} ${chat.cliente.apellido}`}
            src={`/placeholder.svg?height=40&width=40&text=${chat.cliente.nombre.substring(0, 1)}${chat.cliente.apellido.substring(0, 1)}`}
          />
        </Badge>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2" component="span">
              {chat.cliente.nombre === "" && chat.cliente.apellido === ""
                ?  chat.cliente.celular
                : `${chat.cliente.nombre} ${chat.cliente.apellido}`
            }
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(chat.ultima_interaccion)}
            </Typography>
          </Box>
        }
        secondary={
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Typography
                sx={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "normal", // permite saltos de línea
                    lineHeight: 1.4,
                    maxHeight: "2.8em", // opcional para altura máxima visible
                }}
                component="span"
                variant="body2"
                color="text.secondary"
              >
                {lastMessage}
              </Typography>
              {chat.mensajes_no_leidos > 0 && (
                <Badge
                  badgeContent={chat.mensajes_no_leidos}
                  color="primary"
                  sx={{ ml: 1, "& .MuiBadge-badge": { fontSize: 10, height: 18, minWidth: 18 } }}
                />
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={controlInfo.text}
                size="small"
                sx={{
                  backgroundColor: controlInfo.color,
                  color: "white",
                  fontSize: "10px",
                  height: "20px",
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {chat.cliente.celular}
              </Typography>
            </Box>
          </Box>
        }
      />
    </ListItem>
  )
}
