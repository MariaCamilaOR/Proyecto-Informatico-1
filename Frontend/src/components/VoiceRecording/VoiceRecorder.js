import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Button, VStack, Text, HStack, Progress, Alert, AlertIcon, IconButton, useToast, Badge, Card, CardBody } from "@chakra-ui/react";
import { FaMicrophone, FaStop, FaPlay, FaPause, FaTrash, FaDownload } from "react-icons/fa";
export function VoiceRecorder({ onRecordingComplete, maxDurationSeconds = 300, // 5 minutos
patientId, photoId }) {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioRef = useRef(null);
    const toast = useToast();
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);
    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setRecordingTime(prev => {
                if (prev >= maxDurationSeconds) {
                    stopRecording();
                    return maxDurationSeconds;
                }
                return prev + 1;
            });
        }, 1000);
    };
    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const startRecording = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                // Llamar callback con el audio
                onRecordingComplete(audioBlob, recordingTime);
                // Detener el stream
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorder.start();
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);
            startTimer();
            toast({
                title: "Grabación iniciada",
                description: "Habla claramente y describe lo que ves en la foto",
                status: "info",
                duration: 3000,
            });
        }
        catch (err) {
            setError("No se pudo acceder al micrófono. Verifica los permisos.");
            toast({
                title: "Error de micrófono",
                description: "Verifica que tengas permisos para usar el micrófono",
                status: "error",
                duration: 4000,
            });
        }
    };
    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            if (isPaused) {
                mediaRecorderRef.current.resume();
                startTimer();
                setIsPaused(false);
            }
            else {
                mediaRecorderRef.current.pause();
                stopTimer();
                setIsPaused(true);
            }
        }
    };
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            stopTimer();
            toast({
                title: "Grabación completada",
                description: `Duración: ${formatTime(recordingTime)}`,
                status: "success",
                duration: 3000,
            });
        }
    };
    const playRecording = () => {
        if (audioUrl && audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            }
            else {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };
    const deleteRecording = () => {
        setAudioBlob(null);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }
        setRecordingTime(0);
        setIsPlaying(false);
    };
    const downloadRecording = () => {
        if (audioBlob && audioUrl) {
            const link = document.createElement('a');
            link.href = audioUrl;
            link.download = `descripcion_${patientId}_${Date.now()}.wav`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    const progressPercentage = (recordingTime / maxDurationSeconds) * 100;
    return (_jsxs(VStack, { spacing: 4, w: "full", children: [_jsx(Card, { w: "full", children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, children: [_jsx(Text, { fontWeight: "bold", fontSize: "lg", children: "\uD83C\uDFA4 Grabaci\u00F3n de Voz" }), error && (_jsxs(Alert, { status: "error", children: [_jsx(AlertIcon, {}), error] })), _jsxs(HStack, { spacing: 4, children: [_jsx(Badge, { colorScheme: isRecording ? "red" : "gray", fontSize: "sm", p: 2, children: isRecording ? "🔴 Grabando" : "⏹️ Detenido" }), _jsx(Text, { fontSize: "lg", fontWeight: "bold", children: formatTime(recordingTime) }), isRecording && (_jsxs(Badge, { colorScheme: "blue", children: [Math.round(progressPercentage), "% del l\u00EDmite"] }))] }), isRecording && (_jsx(Progress, { value: progressPercentage, w: "full", colorScheme: progressPercentage > 80 ? "red" : "blue", size: "lg" })), _jsx(HStack, { spacing: 4, children: !isRecording ? (_jsx(Button, { leftIcon: _jsx(FaMicrophone, {}), colorScheme: "red", size: "lg", onClick: startRecording, children: "Iniciar Grabaci\u00F3n" })) : (_jsxs(_Fragment, { children: [_jsx(IconButton, { "aria-label": isPaused ? "Reanudar" : "Pausar", icon: isPaused ? _jsx(FaPlay, {}) : _jsx(FaPause, {}), colorScheme: "yellow", size: "lg", onClick: pauseRecording }), _jsx(IconButton, { "aria-label": "Detener grabaci\u00F3n", icon: _jsx(FaStop, {}), colorScheme: "red", size: "lg", onClick: stopRecording })] })) }), audioBlob && audioUrl && (_jsxs(VStack, { spacing: 3, w: "full", children: [_jsx(Text, { fontWeight: "bold", children: "Grabaci\u00F3n completada:" }), _jsxs(HStack, { spacing: 2, children: [_jsx(IconButton, { "aria-label": isPlaying ? "Pausar" : "Reproducir", icon: isPlaying ? _jsx(FaPause, {}) : _jsx(FaPlay, {}), colorScheme: "blue", onClick: playRecording }), _jsx(IconButton, { "aria-label": "Descargar", icon: _jsx(FaDownload, {}), colorScheme: "green", onClick: downloadRecording }), _jsx(IconButton, { "aria-label": "Eliminar", icon: _jsx(FaTrash, {}), colorScheme: "red", onClick: deleteRecording })] }), _jsx("audio", { ref: audioRef, src: audioUrl, onEnded: () => setIsPlaying(false), style: { display: "none" } })] }))] }) }) }), _jsx(Card, { w: "full", children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 2, align: "start", children: [_jsx(Text, { fontWeight: "bold", children: "\uD83D\uDCDD Instrucciones:" }), _jsxs(VStack, { align: "start", spacing: 1, fontSize: "sm", color: "gray.600", children: [_jsx(Text, { children: "\u2022 Describe detalladamente lo que ves en la foto" }), _jsx(Text, { children: "\u2022 Menciona personas, lugares, objetos y eventos" }), _jsx(Text, { children: "\u2022 Habla con claridad y a un ritmo normal" }), _jsx(Text, { children: "\u2022 Puedes pausar y reanudar la grabaci\u00F3n" }), _jsxs(Text, { children: ["\u2022 M\u00E1ximo ", Math.floor(maxDurationSeconds / 60), " minutos de grabaci\u00F3n"] })] })] }) }) })] }));
}
