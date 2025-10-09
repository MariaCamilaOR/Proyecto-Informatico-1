import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
} from '@mui/material';
import { Assessment, Download, Share } from '@mui/icons-material';

const ReportsPage: React.FC = () => {
  // Datos simulados para los reportes
  const reports = [
    {
      id: '1',
      title: 'Reporte de Línea Base',
      date: '2024-01-15',
      type: 'baseline',
      status: 'completed',
    },
    {
      id: '2',
      title: 'Reporte de Progreso - Enero 2024',
      date: '2024-02-01',
      type: 'progress',
      status: 'completed',
    },
    {
      id: '3',
      title: 'Reporte de Progreso - Febrero 2024',
      date: '2024-03-01',
      type: 'progress',
      status: 'pending',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reportes
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Visualiza y descarga los informes de evaluación cognitiva
        </Typography>
      </Box>

      {reports.length === 0 ? (
        <Alert severity="info">
          Aún no hay reportes disponibles. Los reportes se generarán automáticamente 
          después de completar las actividades de evaluación.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {reports.map((report) => (
            <Grid item xs={12} md={6} key={report.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h2">
                      {report.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Fecha: {new Date(report.date).toLocaleDateString('es-ES')}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Tipo: {report.type === 'baseline' ? 'Línea Base' : 'Progreso'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    {report.status === 'completed' ? (
                      <>
                        <Button
                          size="small"
                          startIcon={<Assessment />}
                          variant="outlined"
                        >
                          Ver Reporte
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Download />}
                          variant="outlined"
                        >
                          Descargar PDF
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Share />}
                          variant="outlined"
                        >
                          Compartir
                        </Button>
                      </>
                    ) : (
                      <Alert severity="warning" sx={{ width: '100%' }}>
                        Reporte en proceso de generación
                      </Alert>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Información adicional */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información sobre los Reportes
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Los reportes proporcionan un análisis detallado del progreso cognitivo basado 
              en las actividades realizadas. Incluyen métricas como:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" color="textSecondary">
                <strong>Memory Recall:</strong> Capacidad de recordar detalles específicos
              </Typography>
              <Typography component="li" variant="body2" color="textSecondary">
                <strong>Narrative Coherence:</strong> Coherencia en la descripción de eventos
              </Typography>
              <Typography component="li" variant="body2" color="textSecondary">
                <strong>Detail Accuracy:</strong> Precisión en los detalles mencionados
              </Typography>
              <Typography component="li" variant="body2" color="textSecondary">
                <strong>Emotional Recognition:</strong> Reconocimiento de emociones en las fotos
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ReportsPage;
