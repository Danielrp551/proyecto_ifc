"use client"

import { useState, useEffect } from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import Box from "@mui/material/Box"
import CssBaseline from "@mui/material/CssBaseline"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import ChatList from "@/components/chat-list"
import ChatWindow from "@/components/chat-window"
import { useSession } from "next-auth/react"

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#128C7E",
    },
    background: {
      default: "#f0f2f5",
    },
  },
})

export default function MisChats() {
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderBy, setOrderBy] = useState("mas_reciente")

  const { data: session, status } = useSession();
  // Asesor ID : session.user.asesor

  useEffect(() => {
    if (status !== "authenticated") return;
    
    const fetchChats = async () => {
      try {
        const asesorId = session?.user?.asesor.asesor_id
        const queryParams = new URLSearchParams({ orderBy })
        setLoading(true)

        if (asesorId) {
            queryParams.append("asesorId", asesorId)
        }
        // Simulamos llamada a la API
        const response = await fetch(`/api/clients/conversations?${queryParams.toString()}`)
        if (!response.ok) {
            throw new Error("Error al obtener las conversaciones")
        }
        console.log("Respuesta de la API:", response)
        // Para el ejemplo, seteamos data en duro
        /*
        const data = {
          conversaciones: [
            {
              conversacion_id: "conv_001",
              cliente: {
                nombre: "María",
                apellido: "García",
                celular: "+51987654321",
                estado: "activo",
              },
              ultima_interaccion: "2023-06-15T14:30:00",
              mensajes_no_leidos: 2,
              estado_conversacion: "activa",
              tipo_control: "asesor",
              interacciones: [
                {
                  _id: "int_001",
                  fecha: "2023-06-15T14:10:00",
                  mensaje_cliente: "Hola, necesito información sobre mi pedido #12345",
                  mensaje_chatbot: null,
                },
                {
                  _id: "int_002",
                  fecha: "2023-06-15T14:12:00",
                  mensaje_cliente: null,
                  mensaje_chatbot: "Hola María, permíteme revisar tu pedido en nuestro sistema",
                },
                {
                  _id: "int_003",
                  fecha: "2023-06-15T14:16:00",
                  mensaje_cliente: null,
                  mensaje_chatbot: "FIN CONTROL BOT SOFIA",
                  tipo_mensaje: "sistema",
                },
                {
                  _id: "int_004",
                  fecha: "2023-06-15T14:17:00",
                  mensaje_cliente: null,
                  mensaje_chatbot: "INICIO CONTROL ASESOR",
                  tipo_mensaje: "sistema",
                },
                {
                  _id: "int_005",
                  fecha: "2023-06-15T14:20:00",
                  mensaje_cliente: null,
                  mensaje_chatbot:
                    "Hola María, soy Carlos del departamento de atención al cliente. Veo que tienes una consulta sobre tu pedido #12345",
                },
                {
                  _id: "int_006",
                  fecha: "2023-06-15T14:22:00",
                  mensaje_cliente: "Sí, me gustaría saber cuándo llegará mi pedido",
                  mensaje_chatbot: null,
                },
                {
                  _id: "int_007",
                  fecha: "2023-06-15T14:30:00",
                  mensaje_cliente: null,
                  mensaje_chatbot: "¿Cómo va todo con el proyecto?",
                },
              ],
            },
            {
              conversacion_id: "conv_002",
              cliente: {
                nombre: "Juan",
                apellido: "Pérez",
                celular: "+51987654322",
                estado: "finalizado",
              },
              ultima_interaccion: "2023-06-15T12:30:00",
              mensajes_no_leidos: 0,
              estado_conversacion: "finalizada",
              tipo_control: "finalizado",
              interacciones: [
                {
                  _id: "int_008",
                  fecha: "2023-06-15T11:45:00",
                  mensaje_cliente: "Necesito los documentos del contrato",
                  mensaje_chatbot: null,
                },
                {
                  _id: "int_009",
                  fecha: "2023-06-15T12:00:00",
                  mensaje_cliente: null,
                  mensaje_chatbot: "Claro, te los envío en un momento",
                },
                {
                  _id: "int_010",
                  fecha: "2023-06-15T12:15:00",
                  mensaje_cliente: null,
                  mensaje_chatbot: "Te envié los documentos por email",
                },
                {
                  _id: "int_011",
                  fecha: "2023-06-15T12:30:00",
                  mensaje_cliente: null,
                  mensaje_chatbot: "FIN CONTROL ASESOR",
                  tipo_mensaje: "sistema",
                },
              ],
            },
            {
              conversacion_id: "conv_003",
              cliente: {
                nombre: "Ana",
                apellido: "Rodríguez",
                celular: "+51987654323",
                estado: "activo",
              },
              ultima_interaccion: "2023-06-14T18:20:00",
              mensajes_no_leidos: 3,
              estado_conversacion: "activa",
              tipo_control: "bot",
              interacciones: [
                {
                  _id: "int_012",
                  fecha: "2023-06-14T17:30:00",
                  mensaje_cliente: "¿Quiero información sobre sus servicios?",
                  mensaje_chatbot: null,
                },
                {
                  _id: "int_013",
                  fecha: "2023-06-14T17:45:00",
                  mensaje_cliente: null,
                  mensaje_chatbot: "¡Hola Ana! Me encanta ayudarte. ¿Qué tipo de servicio te interesa?",
                },
                {
                  _id: "int_014",
                  fecha: "2023-06-14T18:20:00",
                  mensaje_cliente: "¿Nos vemos mañana para el café?",
                  mensaje_chatbot: null,
                },
              ],
            },
            {
              conversacion_id: "conv_004",
              cliente: {
                nombre: "Carlos",
                apellido: "López",
                celular: "+51987654324",
                estado: "activo",
              },
              ultima_interaccion: "2023-06-14T10:05:00",
              mensajes_no_leidos: 1,
              estado_conversacion: "activa",
              tipo_control: "asesor",
              interacciones: [
                {
                  _id: "int_015",
                  fecha: "2023-06-14T10:05:00",
                  mensaje_cliente: "Gracias por la información",
                  mensaje_chatbot: null,
                },
              ],
            },
          ],
        }*/

        const data = await response.json()
        

        setChats(data.conversaciones)
      } catch (error) {
        console.error("Error fetching chats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [orderBy,status])

  const handleSelectChat = (chat) => {
    setSelectedChat(chat)
  }

  const handleSendMessage = (content) => {
    if (!selectedChat || !content.trim()) return

    const newInteraction = {
      _id: `int_${Date.now()}`,
      fecha: new Date().toISOString(),
      mensaje_cliente: null,
      mensaje_chatbot: content,
    }

    const updatedChats = chats.map((chat) => {
      if (chat.conversacion_id === selectedChat.conversacion_id) {
        return {
          ...chat,
          interacciones: [...chat.interacciones, newInteraction],
          ultima_interaccion: new Date().toISOString(),
        }
      }
      return chat
    })

    setChats(updatedChats)
    setSelectedChat({
      ...selectedChat,
      interacciones: [...selectedChat.interacciones, newInteraction],
    })
  }

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container className="flex justify-center items-center h-screen">
          <Typography>Cargando conversaciones...</Typography>
        </Container>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Box sx={{ bgcolor: "primary.main", color: "white", p: 2 }}>
          <Typography variant="h5" component="h1">
            Mis Chats
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Box sx={{ width: "33%", borderRight: 1, borderColor: "divider", bgcolor: "background.paper" }}>
            <ChatList 
                chats={chats} 
                selectedChatId={selectedChat?.conversacion_id} 
                onSelectChat={handleSelectChat} 
                orderBy={orderBy}
                onChangeOrderBy={setOrderBy}
                loading={loading}
            />
          </Box>
          <Box sx={{ width: "67%", bgcolor: "#e5ddd5" }}>
            {selectedChat ? (
              <ChatWindow chat={selectedChat} onSendMessage={handleSendMessage} />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "text.secondary",
                }}
              >
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    bgcolor: "grey.200",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100"
                    height="100"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: "medium" }}>
                  Mis Chats
                </Typography>
                <Typography variant="body1" sx={{ textAlign: "center", maxWidth: 400, mt: 1 }}>
                  Selecciona una conversación para comenzar a chatear
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
