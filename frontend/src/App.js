import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Tabs, Tab, Table, TableBody, TableCell,
  TableHead, TableRow, Typography, TextField, IconButton, Tooltip
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';

const endpoints = [
  { label: 'Usuarios', url: '/api/inv/GetAllUsers' },
  { label: 'Estrategias', url: '/api/inv/GetAllStrategies' },
  { label: 'Mis Estrategias', url: '/api/inv/GetStrategiesByUser', requiresUserId: true }
];

function App() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // Para la ordenación
  const [sortedColumn, setSortedColumn] = useState(null); // Para la columna ordenada

  useEffect(() => {
    if (endpoints[tab].requiresUserId && !userId) {
      setData([]); // Si no hay USER_ID, no hacemos la solicitud
      return;
    }

    const url = endpoints[tab].requiresUserId
      ? `${endpoints[tab].url}?USER_ID=${userId}` // Agregar el parámetro a la URL
      : endpoints[tab].url;

    axios.get(url)
      .then(res => {
        const result = res.data?.value || res.data || [];
        setData(Array.isArray(result) ? result : []);
      })
      .catch(err => {
        console.error('Error al obtener los datos:', err);
      });
  }, [tab, userId]);

  // Función para manejar la ordenación de columnas
  const handleSort = (column) => {
    const newSortDirection = sortedColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newSortDirection);
    setSortedColumn(column);

    const sortedData = [...data].sort((a, b) => {
      if (a[column] < b[column]) return newSortDirection === 'asc' ? -1 : 1;
      if (a[column] > b[column]) return newSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setData(sortedData);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Tabs value={tab} onChange={(e, newTab) => setTab(newTab)}>
        {endpoints.map((ep, i) => <Tab key={i} label={ep.label} />)}
      </Tabs>

      {endpoints[tab].requiresUserId && (
        <Box sx={{ mt: 2 }}>
          <TextField
            label="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            variant="outlined"
            fullWidth
          />
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        {data.length > 0 ? (
          <Table size="small" sx={{ minWidth: 650, borderCollapse: 'collapse' }}>
            <TableHead>
              <TableRow>
                {Object.keys(data[0]).map((key) => (
                  <TableCell key={key} sx={{
                    fontWeight: 'bold',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }} onClick={() => handleSort(key)}>
                    <Tooltip title="Ordenar por esta columna">
                      <IconButton size="small">
                        <SortIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {key}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i} sx={{
                  '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                  '&:hover': { backgroundColor: '#f1f1f1' }
                }}>
                  {Object.values(row).map((val, j) => (
                    <TableCell key={j} sx={{ textAlign: 'center' }}>
                      {JSON.stringify(val)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {endpoints[tab].requiresUserId && !userId
              ? 'Ingresa un USER_ID para ver resultados.'
              : 'No hay datos disponibles.'}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default App;
