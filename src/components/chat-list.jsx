"use client"

import { useState } from "react"
import Box from "@mui/material/Box"
import List from "@mui/material/List"
import InputBase from "@mui/material/InputBase"
import Paper from "@mui/material/Paper"
import SearchIcon from "@mui/icons-material/Search"
import SortIcon from "@mui/icons-material/Sort"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import UpdateIcon from "@mui/icons-material/Update"
import IconButton from "@mui/material/IconButton"
import Tooltip from "@mui/material/Tooltip"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Typography from "@mui/material/Typography"
import Divider from "@mui/material/Divider"
import ChatItem from "./chat-item"
import CircularProgress from "@mui/material/CircularProgress"

export default function ChatList({ chats, selectedChatId, onSelectChat, orderBy, onChangeOrderBy, loading }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleSortClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleSortClose = () => {
    setAnchorEl(null)
  }

  // Filtrar chats por búsqueda
  const filteredChats = chats.filter((chat) =>
    `${chat.cliente.nombre} ${chat.cliente.apellido}`.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Ordenar chats según el método seleccionado
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (orderBy === "recent") {
      // Ordenar por mensaje más reciente (descendente)
      return new Date(b.ultima_interaccion).getTime() - new Date(a.ultima_interaccion).getTime()
    } else {
      // Ordenar por mensajes por vencer (más antiguos sin responder primero)
      if (a.mensajes_no_leidos > 0 && b.mensajes_no_leidos === 0) {
        return -1 // a va primero
      } else if (a.mensajes_no_leidos === 0 && b.mensajes_no_leidos > 0) {
        return 1 // b va primero
      } else if (a.mensajes_no_leidos > 0 && b.mensajes_no_leidos > 0) {
        // Ambos tienen mensajes sin leer, ordenar por antigüedad
        return new Date(a.ultima_interaccion).getTime() - new Date(b.ultima_interaccion).getTime()
      } else {
        // Ninguno tiene mensajes sin leer, ordenar por reciente
        return new Date(b.ultima_interaccion).getTime() - new Date(a.ultima_interaccion).getTime()
      }
    }
  })

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header con filtros */}
      <Box sx={{ p: 1, bgcolor: "background.paper" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle2" sx={{ flexGrow: 1, ml: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            Conversaciones ({chats.length})
            {loading && <CircularProgress size={16} />}
            </Typography>
          <Tooltip title="Ordenar conversaciones">
            <IconButton
              size="small"
              onClick={handleSortClick}
              aria-controls={open ? "sort-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <SortIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            id="sort-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleSortClose}
            MenuListProps={{
              "aria-labelledby": "sort-button",
            }}
          >
            <MenuItem selected={orderBy === "mas_reciente"} onClick={() => {
                onChangeOrderBy("mas_reciente")
                handleSortClose()
                }}>
              <ListItemIcon>
                <UpdateIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Más reciente</ListItemText>
            </MenuItem>
            <MenuItem selected={orderBy === "por_vencer"} onClick={() => {
                onChangeOrderBy("por_vencer")
                handleSortClose()
                }}>
              <ListItemIcon>
                <AccessTimeIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Por vencer</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* Barra de búsqueda */}
        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            bgcolor: "#f0f2f5",
            boxShadow: "none",
            borderRadius: 1,
          }}
        >
          <SearchIcon sx={{ ml: 1, color: "text.secondary" }} />
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Buscar conversaciones"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Paper>
      </Box>

      {/* Indicador de orden actual */}
      <Box sx={{ px: 2, py: 0.5, bgcolor: "#f0f2f5", display: "flex", alignItems: "center" }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
          {orderBy === "mas_reciente" ? (
            <>
              <UpdateIcon fontSize="inherit" sx={{ mr: 0.5 }} /> Ordenado por más reciente
            </>
          ) : (
            <>
              <AccessTimeIcon fontSize="inherit" sx={{ mr: 0.5 }} /> Ordenado por mensajes por vencer
            </>
          )}
        </Typography>
      </Box>

      <Divider />

      {/* Lista de chats */}
      <List sx={{ flexGrow: 1, overflow: "auto", p: 0 }}>
        {chats.map((chat) => (
          <ChatItem
            key={chat.conversacion_id}
            chat={chat}
            isSelected={chat.conversacion_id === selectedChatId}
            onClick={() => onSelectChat(chat)}
          />
        ))}
      </List>
    </Box>
  )
}
