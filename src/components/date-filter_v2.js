"use client"

import { useState, useEffect } from "react"
import { format, subDays, subMonths, subWeeks, startOfDay, endOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { TextField, MenuItem, IconButton, Menu } from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"

const presets = [
  {
    label: "Todo",
    getValue: () => ({ from: null, to: null })
  },
  { 
    label: "Hoy", 
    getValue: () => ({ 
      from: startOfDay(new Date()), 
      to: endOfDay(new Date()) 
    })
  },
  { 
    label: "Ayer", 
    getValue: () => ({ 
      from: startOfDay(subDays(new Date(), 1)), 
      to: endOfDay(subDays(new Date(), 1)) 
    })
  },
  { 
    label: "Última semana", 
    getValue: () => ({ 
      from: startOfDay(subWeeks(new Date(), 1)), 
      to: endOfDay(new Date()) 
    })
  },
  { 
    label: "Último mes", 
    getValue: () => ({ 
      from: startOfDay(subMonths(new Date(), 1)), 
      to: endOfDay(new Date()) 
    })
  },
  { 
    label: "Últimos 6 meses", 
    getValue: () => ({ 
      from: startOfDay(subMonths(new Date(), 6)), 
      to: endOfDay(new Date()) 
    })
  },
]

export function DateFilterv2({ size = "small",onDateChange, reset, setStartDate, setEndDate,setSelectedPreset, startDate, endDate,selectedPreset, TodoExist =true }) {
  //const [startDate, setStartDate] = useState(new Date())
  //const [endDate, setEndDate] = useState(new Date())
  //const [selectedPreset, setSelectedPreset] = useState("Todo")
  const [anchorEl, setAnchorEl] = useState(null)
/*
  useEffect(() => {
    if (reset) {
      setSelectedPreset("Todo");
      setStartDate(null);
      setEndDate(null);
      //onDateChange({ from: null, to: null });
    }
  }, [reset]);
  */

  const handlePresetChange = (event) => {
    const value = event.target.value
    setSelectedPreset(value)
    
    if (value !== "Rango específico") {
      const preset = presets.find(p => p.label === value)
      if (preset) {
        const newDateRange = preset.getValue()
        setStartDate(newDateRange.from)
        setEndDate(newDateRange.to)
        onDateChange(newDateRange)
      }
    }
  }

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate)
    onDateChange({
      from: startOfDay(newDate),
      to: endOfDay(endDate)
    })
  }

  const handleEndDateChange = (newDate) => {
    setEndDate(newDate)
    onDateChange({
      from: startOfDay(startDate),
      to: endOfDay(newDate)
    })
  }

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <TextField
        select
        size= {size}
        value={selectedPreset}
        onChange={handlePresetChange}
        sx={{ minWidth: 180, backgroundColor: "#ffffff" }}
      >
        {presets
          .filter((preset) => TodoExist || preset.label !== "Todo") // Excluir "Todo" si TodoExist es false
          .map((preset) => (
            <MenuItem key={preset.label} value={preset.label}>
              {preset.label}
            </MenuItem>
          ))}
        <MenuItem value="Rango específico">Rango específico</MenuItem>
      </TextField>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <DatePicker
            label="Fecha inicial"
            value={startDate}
            onChange={handleStartDateChange}
            disabled={selectedPreset !== "Rango específico"}
            maxDate={endOfDay(new Date())}
            slotProps={{
              textField: {
                size: size,
                sx: { backgroundColor: "#ffffff" }
              }
            }}
          />
          <DatePicker
            label="Fecha final"
            value={endDate}
            onChange={handleEndDateChange}
            disabled={selectedPreset !== "Rango específico"}
            slotProps={{
              textField: {
                size: size,
                sx: { backgroundColor: "#ffffff" }
              }
            }}
            maxDate={endOfDay(new Date())}
            
          />
        </div>
      </LocalizationProvider>
    </div>
  )
}

