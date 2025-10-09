import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { PhotoCamera, Add, Visibility } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const PhotosPage: React.FC = () => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setOpenDialog(true);
      }
    }
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Simular subida de foto
    const newPhoto = {
      id: Date.now().toString(),
      filename: selectedFile.name,
      description,
      uploadedAt: new Date(),
      url: URL.createObjectURL(selectedFile),
    };

    setPhotos(prev => [...prev, newPhoto]);
    setOpenDialog(false);
    setSelectedFile(null);
    setDescription('');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Fotos Familiares
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Sube y gestiona las fotografías que se utilizarán para la evaluación cognitiva
        </Typography>
      </Box>

      {/* Área de subida de fotos */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? '#f5f5f5' : 'transparent',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <input {...getInputProps()} />
            <PhotoCamera sx={{ fontSize: 48, color: '#666', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive
                ? 'Suelta la foto aquí...'
                : 'Arrastra una foto aquí o haz clic para seleccionar'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Formatos soportados: JPG, PNG (máximo 10MB)
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Lista de fotos */}
      {photos.length === 0 ? (
        <Alert severity="info">
          Aún no hay fotos subidas. Sube algunas fotos familiares para comenzar.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {photos.map((photo) => (
            <Grid item xs={12} sm={6} md={4} key={photo.id}>
              <Card>
                <Box
                  component="img"
                  src={photo.url}
                  alt={photo.filename}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                  }}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {photo.filename}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {photo.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      variant="outlined"
                    >
                      Ver
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                    >
                      Eliminar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog para subir foto */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subir Foto</DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Archivo seleccionado:
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Descripción de la foto"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe las personas, lugares y eventos en la foto..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleUpload} variant="contained">
            Subir Foto
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PhotosPage;
