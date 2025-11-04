import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { Box, Button, VStack, Text, Image, Progress, Alert, AlertIcon, HStack, IconButton, useToast } from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
export function PhotoUploader({ onUpload, maxFiles = 10, maxSizeMB = 5, acceptedFormats = ["image/jpeg", "image/jpg", "image/png"] }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState([]);
    const fileInputRef = useRef(null);
    const toast = useToast();
    const validateFile = (file) => {
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
    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files || []);
        const newErrors = [];
        const validFiles = [];
        // Validar cada archivo
        files.forEach(file => {
            const error = validateFile(file);
            if (error) {
                newErrors.push(error);
            }
            else {
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
    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };
    const handleUpload = async () => {
        if (selectedFiles.length === 0)
            return;
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
        }
        catch (error) {
            toast({
                title: "Error al subir fotos",
                description: "Intenta nuevamente",
                status: "error",
                duration: 4000,
            });
        }
        finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };
    return (_jsxs(VStack, { spacing: 4, w: "full", children: [_jsx(Box, { border: "2px dashed", borderColor: "gray.300", borderRadius: "md", p: 8, w: "full", textAlign: "center", cursor: "pointer", _hover: { borderColor: "blue.400", bg: "blue.50" }, onClick: () => fileInputRef.current?.click(), children: _jsxs(VStack, { spacing: 2, children: [_jsx(AddIcon, { boxSize: 8, color: "gray.400" }), _jsx(Text, { fontWeight: "bold", children: "Haz clic para seleccionar fotos" }), _jsxs(Text, { fontSize: "sm", color: "gray.500", children: ["Formatos: JPG, PNG \u2022 M\u00E1ximo: ", maxSizeMB, "MB por archivo \u2022 L\u00EDmite: ", maxFiles, " archivos"] })] }) }), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: "image/jpeg,image/jpg,image/png", onChange: handleFileSelect, style: { display: "none" } }), errors.length > 0 && (_jsxs(Alert, { status: "error", children: [_jsx(AlertIcon, {}), _jsx(VStack, { align: "start", spacing: 1, children: errors.map((error, index) => (_jsx(Text, { fontSize: "sm", children: error }, index))) })] })), selectedFiles.length > 0 && (_jsxs(VStack, { spacing: 2, w: "full", children: [_jsxs(Text, { fontWeight: "bold", children: ["Archivos seleccionados (", selectedFiles.length, ")"] }), selectedFiles.map((file, index) => (_jsxs(HStack, { w: "full", p: 2, bg: "gray.50", borderRadius: "md", children: [_jsx(Image, { src: URL.createObjectURL(file), alt: file.name, boxSize: "40px", objectFit: "cover", borderRadius: "md" }), _jsxs(VStack, { align: "start", flex: 1, spacing: 0, children: [_jsx(Text, { fontSize: "sm", fontWeight: "bold", noOfLines: 1, children: file.name }), _jsx(Text, { fontSize: "xs", color: "gray.500", children: formatFileSize(file.size) })] }), _jsx(IconButton, { "aria-label": "Eliminar archivo", icon: _jsx(DeleteIcon, {}), size: "sm", colorScheme: "red", variant: "ghost", onClick: () => removeFile(index) })] }, index)))] })), uploading && (_jsxs(VStack, { spacing: 2, w: "full", children: [_jsx(Text, { children: "Subiendo fotos..." }), _jsx(Progress, { value: uploadProgress, w: "full", colorScheme: "blue" }), _jsxs(Text, { fontSize: "sm", color: "gray.500", children: [uploadProgress, "%"] })] })), selectedFiles.length > 0 && !uploading && (_jsxs(Button, { colorScheme: "blue", size: "lg", w: "full", onClick: handleUpload, children: ["\uD83D\uDCF8 Subir ", selectedFiles.length, " foto(s)"] }))] }));
}
