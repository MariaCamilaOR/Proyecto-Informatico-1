import { useState, useRef } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  Image,
  Progress,
  Alert,
  AlertIcon,
  HStack,
  IconButton,
  useToast,
  Badge
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

interface PhotoUploaderProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export function PhotoUploader({ 
  onUpload, 
  maxFiles = 10, 
  maxSizeMB = 5, 
  acceptedFormats = ["image/jpeg", "image/jpg", "image/png"] 
}: PhotoUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const validateFile = (file: File): string | null => {
    // Validar formato
    if (!acceptedFormats.includes(file.type)) {
      return `Formato no válido: ${file.name}. Solo se permiten JPG y PNG.`;
    }

    // Validar tamaño
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Archivo muy grande: ${file.name}. Máximo ${maxSizeMB}MB.`;
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Validar cada archivo
    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    // Verificar límite de archivos
    if (selectedFiles.length + validFiles.length > maxFiles) {
      newErrors.push(`Máximo ${maxFiles} archivos permitidos.`);
    }

    setErrors(newErrors);
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      toast({
        title: `${validFiles.length} archivo(s) seleccionado(s)`,
        status: "success",
        duration: 2000,
      });
    }

    if (newErrors.length > 0) {
      toast({
        title: "Errores de validación",
        description: newErrors[0],
        status: "error",
        duration: 4000,
      });
    }

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simular progreso de subida
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Llamar callback con archivos
      onUpload(selectedFiles);

      toast({
        title: "Fotos subidas exitosamente",
        description: `${selectedFiles.length} foto(s) procesada(s)`,
        status: "success",
        duration: 3000,
      });

      setSelectedFiles([]);
      setErrors([]);
    } catch (error) {
      toast({
        title: "Error al subir fotos",
        description: "Intenta nuevamente",
        status: "error",
        duration: 4000,
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <VStack spacing={4} w="full">
      {/* Área de subida */}
      <Box
        border="2px dashed"
        borderColor="gray.300"
        borderRadius="md"
        p={8}
        w="full"
        textAlign="center"
        cursor="pointer"
        _hover={{ borderColor: "blue.400", bg: "blue.50" }}
        onClick={() => fileInputRef.current?.click()}
      >
        <VStack spacing={2}>
          <AddIcon boxSize={8} color="gray.400" />
          <Text fontWeight="bold">Haz clic para seleccionar fotos</Text>
          <Text fontSize="sm" color="gray.500">
            Formatos: JPG, PNG • Máximo: {maxSizeMB}MB por archivo • Límite: {maxFiles} archivos
          </Text>
        </VStack>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {/* Errores */}
      {errors.length > 0 && (
        <Alert status="error">
          <AlertIcon />
          <VStack align="start" spacing={1}>
            {errors.map((error, index) => (
              <Text key={index} fontSize="sm">{error}</Text>
            ))}
          </VStack>
        </Alert>
      )}

      {/* Archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <VStack spacing={2} w="full">
          <Text fontWeight="bold">Archivos seleccionados ({selectedFiles.length})</Text>
          {selectedFiles.map((file, index) => (
            <HStack key={index} w="full" p={2} bg="gray.50" borderRadius="md">
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                boxSize="40px"
                objectFit="cover"
                borderRadius="md"
              />
              <VStack align="start" flex={1} spacing={0}>
                <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                  {file.name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {formatFileSize(file.size)}
                </Text>
              </VStack>
              <IconButton
                aria-label="Eliminar archivo"
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => removeFile(index)}
              />
            </HStack>
          ))}
        </VStack>
      )}

      {/* Progreso de subida */}
      {uploading && (
        <VStack spacing={2} w="full">
          <Text>Subiendo fotos...</Text>
          <Progress value={uploadProgress} w="full" colorScheme="blue" />
          <Text fontSize="sm" color="gray.500">{uploadProgress}%</Text>
        </VStack>
      )}

      {/* Botón de subir */}
      {selectedFiles.length > 0 && !uploading && (
        <Button
          colorScheme="blue"
          size="lg"
          w="full"
          onClick={handleUpload}
        >
          📸 Subir {selectedFiles.length} foto(s)
        </Button>
      )}
    </VStack>
  );
}
