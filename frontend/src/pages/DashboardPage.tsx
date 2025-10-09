import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
} from '@mui/material';
import {
  PhotoCamera,
  Assessment,
  Notifications,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const dashboardItems = [
    {
      title: 'Fotos Familiares',
      description: 'Subir y gestionar fotografías para evaluación cognitiva',
      icon: <PhotoCamera sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/photos',
    },
    {
      title: 'Reportes',
      description: 'Ver informes de progreso y análisis cognitivo',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: '#388e3c',
      path: '/reports',
    },
    {
      title: 'Notificaciones',
      description: 'Recordatorios y alertas del sistema',
      icon: <Notifications sx={{ fontSize: 40 }} />,
      color: '#f57c00',
      path: '/notifications',
    },
    {
      title: 'Perfil',
      description: 'Gestionar información personal y configuración',
      icon: <Person sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
      path: '/profile',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bienvenido, {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Panel de control - {user?.role === 'patient' ? 'Paciente' : 
                              user?.role === 'caregiver' ? 'Cuidador' : 
                              user?.role === 'doctor' ? 'Médico' : 'Usuario'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {dashboardItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => navigate(item.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box
                  sx={{
                    color: item.color,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {item.description}
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 2, color: item.color, borderColor: item.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.path);
                  }}
                >
                  Acceder
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Información adicional según el rol */}
      {user?.role === 'patient' && (
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actividades Recomendadas
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Complete las actividades de evaluación cognitiva para mantener un seguimiento 
                de su progreso. Las actividades son simples y pueden realizarse desde la 
                comodidad de su hogar.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {user?.role === 'caregiver' && (
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gestión del Paciente
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Como cuidador, puede subir fotos familiares, configurar recordatorios y 
                monitorear el progreso del paciente. Su participación es fundamental para 
                el éxito del tratamiento.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {user?.role === 'doctor' && (
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Panel Médico
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Acceda a reportes detallados, configure alertas y monitoree el progreso 
                de sus pacientes. El sistema le proporcionará insights valiosos para 
                tomar decisiones clínicas informadas.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default DashboardPage;
