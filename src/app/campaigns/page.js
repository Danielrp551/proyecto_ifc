"use client";

import { useState, useEffect } from 'react';
import {
    MenuItem as SelectItem,
    Container,
    Typography,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    CircularProgress,
    Snackbar,
    Alert,
    Select
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function CampaignManagement() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [newCampaign, setNewCampaign] = useState({
        nombre_campa_a: '',
        descripcion: '',
        estado_campaña: 'activa',
        mensaje_cliente: '',
        num_clientes: 0,
        fecha_inicio: null,
        fecha_fin: null
    });
    const [dialogMode, setDialogMode] = useState('create');
    const [creaCampaign, setCreateCampaign] = useState(false);
    const [currentCampaignId, setCurrentCampaignId] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');



    useEffect(() => {
        const fetchCampaigns = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/campaigns');
                const data = await response.json();
                setCampaigns(data.campaigns);
                console.log("Campaigns: ", data.campaigns);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch campaigns');
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    const [errors, setErrors] = useState({});

    const validateFields = () => {
        const newErrors = {};
        if (!newCampaign.nombre_campa_a.trim()) {
            newErrors.nombre_campa_a = 'Este campo es obligatorio';
        }
        if (!newCampaign.mensaje_cliente.trim()) {
            newErrors.mensaje_cliente = 'Este campo es obligatorio';
        }
        if (!newCampaign.fecha_inicio) {
            newErrors.fecha_inicio = 'Debe seleccionar una fecha de inicio';
        }
        /*
        if (!newCampaign.fecha_fin) {
            newErrors.fecha_fin = 'Debe seleccionar una fecha de fin';
        }
        */
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
    };

    const handleOpenDialog = () => {
        setDialogMode('create'); // Modo creación
        setErrors({}); // Limpiar errores
        setOpenDialog(true);
        setNewCampaign({
            nombre_campa_a: '',
            descripcion: '',
            estado_campaña: 'activa',
            mensaje_cliente: '',
            num_clientes: 0,
            fecha_inicio: null,
            fecha_fin: null
        });
        setCreateCampaign(true);
    };
    const handleCloseDialog = () => { setOpenDialog(false) };
    const handleEditDialog = (campaign) => {
        setDialogMode('edit'); // Modo edición
        setErrors({}); // Limpiar errores
        setOpenDialog(true);
        console.log("Campaign: ", campaign);
        setNewCampaign({
            nombre_campa_a: campaign.nombre_campa_a,
            descripcion: campaign.descripcion,
            estado_campaña: campaign.estado_campa_a,
            mensaje_cliente: campaign.mensaje_cliente,
            num_clientes: campaign.num_clientes,
            fecha_inicio: new Date(campaign.fecha_inicio),
            fecha_fin: campaign.fecha_fin
        });
        setCurrentCampaignId(campaign.campa_a_id); // Establece el ID de la campaña a editar
        setCreateCampaign(false); // Modo edición
    };

    const handleViewDialog = (campaign) => {
        setErrors({}); // Limpiar errores
        setOpenDialog(true);
        setDialogMode('view'); // Modo vista
        setNewCampaign({
            nombre_campa_a: campaign.nombre_campa_a,
            descripcion: campaign.descripcion,
            estado_campaña: campaign.estado_campa_a,
            mensaje_cliente: campaign.mensaje_cliente,
            num_clientes: campaign.num_clientes,
            fecha_inicio: new Date(campaign.fecha_inicio),
            fecha_fin: campaign.fecha_fin
        });
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewCampaign(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name) => (date) => {
        setNewCampaign(prev => ({ ...prev, [name]: date }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateFields()) {
            console.log('Form has errors');
            return; // Detener el envío si hay errores
        }

        setLoading(true);
        try {
            const url = !creaCampaign
                ? `/api/campaigns?id=${currentCampaignId}` // Usar el ID como parámetro de consulta
                : '/api/campaigns';
            const method = !creaCampaign ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCampaign)
            });
            if (!response.ok) throw new Error('Failed to create campaign');
            const data = await response.json();

            if (!creaCampaign) {
                // Actualizar la campaña editada en el estado local
                setCampaigns((prev) =>
                    prev.map((campaign) =>
                        campaign.campa_a_id === currentCampaignId ? data : campaign
                    )
                );
                setSnackbarMessage('Campaña actualizada exitosamente');
            } else {
                // Agregar la nueva campaña al estado local
                setCampaigns((prev) => [...prev, data]);
                setSnackbarMessage('Campaña creada exitosamente');
            }
            handleCloseDialog();
            setNewCampaign({
                nombre_campa_a: '',
                descripcion: '',
                estado_campaña: 'activa',
                mensaje_cliente: '',
                fecha_inicio: null,
                fecha_fin: null
            });
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
        } catch (err) {
            setSnackbarMessage('Error al crear campaña');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    if (loading) {
        return (
            <Container className="flex justify-center items-center h-screen">
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="flex justify-center items-center h-screen">
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container className="py-8">
                <Typography variant="h4" component="h1" gutterBottom className="mb-6">
                    CAMPAÑAS
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                    className="mb-6"
                >
                    Nueva campaña
                </Button>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Descripción</TableCell>
                                <TableCell>Fecha creación</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Fecha inicio</TableCell>
                                <TableCell>Fecha fin</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {campaigns.map((campaign) => (
                                <TableRow key={campaign.campa_a_id}>
                                    <TableCell>{campaign.campa_a_id}</TableCell>
                                    <TableCell>{campaign.nombre_campa_a}</TableCell>
                                    <TableCell>{campaign.descripcion}</TableCell>
                                    <TableCell>{new Date(campaign.fecha_creacion).toLocaleString()}</TableCell>
                                    <TableCell>{campaign.estado_campa_a}</TableCell>
                                    <TableCell>{campaign.fecha_inicio ? new Date(campaign.fecha_inicio).toLocaleString() : 'N/A'}</TableCell>
                                    <TableCell>{campaign.fecha_fin ? new Date(campaign.fecha_fin).toLocaleString() : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleEditDialog(campaign)}>
                                            <EditIcon />
                                        </Button>
                                        <Button onClick={() => handleViewDialog(campaign)}>
                                            <VisibilityIcon />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>    {dialogMode === 'create' && 'Crear nueva campaña'}
                        {dialogMode === 'edit' && 'Editar campaña'}
                        {dialogMode === 'view' && 'Ver detalles de la campaña'}</DialogTitle>
                    <DialogContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <TextField
                                autoFocus
                                margin="dense"
                                name="nombre_campa_a"
                                label="Nombre de campaña"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={newCampaign.nombre_campa_a}
                                onChange={handleInputChange}
                                required
                                error={!!errors.nombre_campa_a}
                                helperText={errors.nombre_campa_a}
                                disabled={dialogMode === 'view'}
                            />
                            <TextField
                                margin="dense"
                                name="descripcion"
                                label="Descripcion"
                                type="text"
                                fullWidth
                                variant="outlined"
                                multiline
                                rows={3}
                                value={newCampaign.descripcion}
                                onChange={handleInputChange}
                                disabled={dialogMode === 'view'}
                            />
                            <Select
                                label="Estado"
                                fullWidth
                                margin="normal"
                                name="estado_campa_a"
                                value={newCampaign.estado_campaña}
                                onChange={handleInputChange}
                                required
                                disabled={(dialogMode === 'view') || (dialogMode === 'create')}
                            >
                                <SelectItem value="activa">Activa</SelectItem>
                                <SelectItem value="inactiva">Inactiva</SelectItem>
                            </Select>
                            <TextField
                                margin="dense"
                                name="mensaje_cliente"
                                label="Mensaje a cliente"
                                type="text"
                                fullWidth
                                variant="outlined"
                                multiline
                                rows={3}
                                value={newCampaign.mensaje_cliente}
                                onChange={handleInputChange}
                                required
                                error={!!errors.mensaje_cliente}
                                helperText={errors.mensaje_cliente}
                                disabled={dialogMode === 'view'}
                            />
                            <TextField
                                margin="dense"
                                name="num_clientes"
                                label="Número de clientes"
                                type="number"
                                fullWidth
                                variant="outlined"
                                value={newCampaign.num_clientes}
                                disabled
                            />
                            <DateTimePicker
                                label="Fecha inicio *"
                                value={newCampaign.fecha_inicio}
                                onChange={handleDateChange('fecha_inicio')}
                                disabled={dialogMode === 'view'}
                                error={!!errors.fecha_inicio}
                                helperText={errors.fecha_inicio}
                                renderInput={(params) => <TextField {...params} fullWidth
                                    error={!!errors.fecha_inicio}
                                    helperText={errors.fecha_inicio}
                                    disabled={dialogMode === 'view'}
                                />}
                            />
                            <DateTimePicker
                                label="Fecha fin"
                                value={newCampaign.fecha_fin}
                                onChange={handleDateChange('fecha_fin')}
                                disabled={dialogMode === 'view'}
                                renderInput={(params) => <TextField {...params} fullWidth
                                    disabled={dialogMode === 'view'} />}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cerrar</Button>
                        {dialogMode !== 'view' && (
                            <Button onClick={handleSubmit} variant="contained" color="primary">
                                {dialogMode === 'create' ? 'Crear' : 'Guardar'}
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>

                <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Container>
        </LocalizationProvider>
    );
}

