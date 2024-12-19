"use client";

import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Snackbar,
    Alert,
    Button,
    TablePagination
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useRouter } from 'next/navigation';

export default function ClientsManagement() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [totalClients, setTotalClients] = useState(0); // Total de clientes
    const [page, setPage] = useState(0); // Página actual
    const [pageSize, setPageSize] = useState(10); // Tamaño de página
    const router = useRouter();

    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `api/clients?page=${page + 1}&pageSize=${pageSize}`
                  );
                const data = await response.json();
                console.log("data : ",data)
                setClients(data.clientes);
                setTotalClients(data.totalClientes)
            } catch (err) {
                setError('No se pudieron cargar los datos de los clientes');
                setSnackbarMessage('Error al cargar clientes');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            } finally{
                setLoading(false);
            }
        };

        fetchClients();
    }, [page, pageSize]);

    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangePageSize = (event) => {
      setPageSize(parseInt(event.target.value, 10));
      setPage(0); // Reinicia a la primera página
    };

    const handleViewDetails = (id) => {
        router.push(`/clientes/${id}`); // Redirige a la página de detalles del cliente
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setOpenSnackbar(false);
    };

    return (
        <Container className="py-8">
          <Typography variant="h4" gutterBottom>
            Clientes
          </Typography>
    
          {loading ? (
            <Container className="flex justify-center items-center h-screen">
              <CircularProgress />
            </Container>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Celular</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Bound</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.cliente_id}>
                        <TableCell>{client.nombre}</TableCell>
                        <TableCell>{client.celular}</TableCell>
                        <TableCell>{client.estado}</TableCell>
                        <TableCell>
                          {client.bound === true ? "IN" : "OUT"}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleViewDetails(client.cliente_id)}
                            startIcon={<InfoIcon />}
                            variant="outlined"
                            color="primary"
                          >
                            Detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
    
              {/* Paginación */}
              <TablePagination
                component="div"
                count={totalClients} // Total de clientes
                page={page}
                rowsPerPage={pageSize}
                onPageChange={handleChangePage}
                rowsPerPageOptions={[5, 10, 20]}
                onRowsPerPageChange={handleChangePageSize}
              />
            </>
          )}
        </Container>
      );
}
