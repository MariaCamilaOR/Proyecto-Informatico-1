import { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  HStack,
  Progress,
  Alert,
  AlertIcon,
  IconButton,
  useToast,
  Badge,
  Card,
  CardBody
} from "@chakra-ui/react";
import { 
  FaMicrophone, 
  FaStop, 
  FaPlay, 
  FaPause, 
  FaTrash,
  FaDownload 
} from "react-icons/fa";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  maxDurationSeconds?: number;
  patientId: string;
  photoId?: string;
}

export function VoiceRecorder({ 
  onRecordingComplete, 
  maxDurationSeconds = 300, // 5 minutos
  patientId,
  photoId 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  const formatTime = (seconds: number): string => {
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

    } catch (err) {
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
      } else {
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
      } else {
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

  return (
    <VStack spacing={4} w="full">
      {/* Controles de grabación */}
      <Card w="full">
        <CardBody>
          <VStack spacing={4}>
            <Text fontWeight="bold" fontSize="lg">
              🎤 Grabación de Voz
            </Text>
            
            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {/* Estado de grabación */}
            <HStack spacing={4}>
              <Badge 
                colorScheme={isRecording ? "red" : "gray"} 
                fontSize="sm"
                p={2}
              >
                {isRecording ? "🔴 Grabando" : "⏹️ Detenido"}
              </Badge>
              
              <Text fontSize="lg" fontWeight="bold">
                {formatTime(recordingTime)}
              </Text>
              
              {isRecording && (
                <Badge colorScheme="blue">
                  {Math.round(progressPercentage)}% del límite
                </Badge>
              )}
            </HStack>

            {/* Barra de progreso */}
            {isRecording && (
              <Progress 
                value={progressPercentage} 
                w="full" 
                colorScheme={progressPercentage > 80 ? "red" : "blue"}
                size="lg"
              />
            )}

            {/* Controles */}
            <HStack spacing={4}>
              {!isRecording ? (
                <Button
                  leftIcon={<FaMicrophone />}
                  colorScheme="red"
                  size="lg"
                  onClick={startRecording}
                >
                  Iniciar Grabación
                </Button>
              ) : (
                <>
                  <IconButton
                    aria-label={isPaused ? "Reanudar" : "Pausar"}
                    icon={isPaused ? <FaPlay /> : <FaPause />}
                    colorScheme="yellow"
                    size="lg"
                    onClick={pauseRecording}
                  />
                  <IconButton
                    aria-label="Detener grabación"
                    icon={<FaStop />}
                    colorScheme="red"
                    size="lg"
                    onClick={stopRecording}
                  />
                </>
              )}
            </HStack>

            {/* Audio grabado */}
            {audioBlob && audioUrl && (
              <VStack spacing={3} w="full">
                <Text fontWeight="bold">Grabación completada:</Text>
                
                <HStack spacing={2}>
                  <IconButton
                    aria-label={isPlaying ? "Pausar" : "Reproducir"}
                    icon={isPlaying ? <FaPause /> : <FaPlay />}
                    colorScheme="blue"
                    onClick={playRecording}
                  />
                  <IconButton
                    aria-label="Descargar"
                    icon={<FaDownload />}
                    colorScheme="green"
                    onClick={downloadRecording}
                  />
                  <IconButton
                    aria-label="Eliminar"
                    icon={<FaTrash />}
                    colorScheme="red"
                    onClick={deleteRecording}
                  />
                </HStack>

                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  style={{ display: "none" }}
                />
              </VStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Instrucciones */}
      <Card w="full">
        <CardBody>
          <VStack spacing={2} align="start">
            <Text fontWeight="bold">📝 Instrucciones:</Text>
            <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
              <Text>• Describe detalladamente lo que ves en la foto</Text>
              <Text>• Menciona personas, lugares, objetos y eventos</Text>
              <Text>• Habla con claridad y a un ritmo normal</Text>
              <Text>• Puedes pausar y reanudar la grabación</Text>
              <Text>• Máximo {Math.floor(maxDurationSeconds / 60)} minutos de grabación</Text>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
