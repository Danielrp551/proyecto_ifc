import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import DoneAllIcon from "@mui/icons-material/DoneAll"

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function MessageBubble({ interaction }) {
  const renderedMessages = []

  // Mensaje del sistema
  if (interaction.tipo_mensaje === "sistema") {
    let backgroundColor = "#f0f2f5"
    let textColor = "#667781"

    if (interaction.mensaje_chatbot === "FIN CONTROL BOT SOFIA" || interaction.mensaje_chatbot === "FIN CONTROL ASESOR") {
      backgroundColor = "#ffebee"
      textColor = "#d32f2f"
    } else if (interaction.mensaje_chatbot === "INICIO CONTROL ASESOR") {
      backgroundColor = "#e8f5e9"
      textColor = "#2e7d32"
    }

    renderedMessages.push(
      <Box key={`${interaction._id}-sistema`} sx={{ display: "flex", justifyContent: "center", my: 2 }}>
        <Paper
          elevation={0}
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            bgcolor: backgroundColor,
            color: textColor,
            fontWeight: "medium",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 500 }}>
            {interaction.mensaje_chatbot}
          </Typography>
        </Paper>
      </Box>
    )
  }

  // Mensaje del cliente (entrante)
  if (interaction.mensaje_cliente) {
    renderedMessages.push(
      <Box key={`${interaction._id}-cliente`} sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Paper
          elevation={0}
          sx={{
            maxWidth: "70%",
            p: 1,
            px: 1.5,
            borderRadius: 2,
            bgcolor: "background.paper",
            position: "relative",
          }}
        >
          <Typography variant="body2">{interaction.mensaje_cliente}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
              {formatTime(interaction.fecha)}
            </Typography>
          </Box>
        </Paper>
      </Box>
    )
  }

  // Mensaje del chatbot o asesor (saliente)
  if (interaction.mensaje_chatbot && interaction.tipo_mensaje !== "sistema") {
    const messages = interaction.mensaje_chatbot.split("|")
    messages.forEach((message, index) => {
      renderedMessages.push(
        <Box key={`${interaction._id}-chatbot-${index}`} sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Paper
            elevation={0}
            sx={{
              maxWidth: "70%",
              p: 1,
              px: 1.5,
              borderRadius: 2,
              bgcolor: "#d9fdd3",
              position: "relative",
            }}
          >
            <Typography variant="body2">{message.trim()}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                {formatTime(interaction.fecha)}
              </Typography>
              <DoneAllIcon sx={{ ml: 0.5, fontSize: 14, color: "#53bdeb" }} />
            </Box>
          </Paper>
        </Box>
      )
    })
  }

  return <>{renderedMessages}</>
}
