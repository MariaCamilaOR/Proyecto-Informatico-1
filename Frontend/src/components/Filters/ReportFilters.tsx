import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Button,
  Select,
  Input,
  Checkbox,
  CheckboxGroup,
  Stack,
  Divider,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb
} from "@chakra-ui/react";
import { FaFilter, FaCalendarAlt, FaChartLine, FaTimes } from "react-icons/fa";

interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  metrics: {
    recall: [number, number];
    coherence: [number, number];
  };
  tags: string[];
  sessions: {
    min: number;
    max: number;
  };
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface ReportFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  availableTags?: string[];
}

export function ReportFilters({ 
  onFiltersChange, 
  onClearFilters,
  availableTags = ["familia", "amigos", "vacaciones", "cumpleaños", "trabajo", "hogar"]
}: ReportFiltersProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: "",
      end: ""
    },
    metrics: {
      recall: [0, 100],
      coherence: [0, 100]
    },
    tags: [],
    sessions: {
      min: 0,
      max: 50
    },
    sortBy: "date",
    sortOrder: "desc"
  });

  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    onFiltersChange(tempFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const defaultFilters: FilterOptions = {
      dateRange: { start: "", end: "" },
      metrics: { recall: [0, 100], coherence: [0, 100] },
      tags: [],
      sessions: { min: 0, max: 50 },
      sortBy: "date",
      sortOrder: "desc"
    };
    
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    onClearFilters();
    onClose();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.metrics.recall[0] > 0 || filters.metrics.recall[1] < 100) count++;
    if (filters.metrics.coherence[0] > 0 || filters.metrics.coherence[1] < 100) count++;
    if (filters.tags.length > 0) count++;
    if (filters.sessions.min > 0 || filters.sessions.max < 50) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <>
      {/* Botón de filtros */}
      <HStack spacing={2}>
        <Button
          leftIcon={<FaFilter />}
          variant="outline"
          size="sm"
          onClick={onOpen}
        >
          Filtros
          {activeFiltersCount > 0 && (
            <Badge ml={2} colorScheme="blue" borderRadius="full">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <IconButton
            aria-label="Limpiar filtros"
            icon={<FaTimes />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={handleClearFilters}
          />
        )}
      </HStack>

      {/* Modal de filtros */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FaFilter />
              <Text>Filtros de Reportes</Text>
              {activeFiltersCount > 0 && (
                <Badge colorScheme="blue">{activeFiltersCount} activos</Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Filtros por fecha */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      <FaCalendarAlt />
                      <Text fontWeight="bold">Rango de Fechas</Text>
                    </HStack>
                    
                    <HStack spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">Desde:</FormLabel>
                        <Input
                          type="date"
                          value={tempFilters.dateRange.start}
                          onChange={(e) => handleFilterChange("dateRange", {
                            ...tempFilters.dateRange,
                            start: e.target.value
                          })}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel fontSize="sm">Hasta:</FormLabel>
                        <Input
                          type="date"
                          value={tempFilters.dateRange.end}
                          onChange={(e) => handleFilterChange("dateRange", {
                            ...tempFilters.dateRange,
                            end: e.target.value
                          })}
                        />
                      </FormControl>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Filtros por métricas */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack>
                      <FaChartLine />
                      <Text fontWeight="bold">Métricas</Text>
                    </HStack>
                    
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">
                          Recall (Memoria): {tempFilters.metrics.recall[0]}% - {tempFilters.metrics.recall[1]}%
                        </FormLabel>
                        <RangeSlider
                          value={tempFilters.metrics.recall}
                          onChange={(value) => handleFilterChange("metrics", {
                            ...tempFilters.metrics,
                            recall: value as [number, number]
                          })}
                          min={0}
                          max={100}
                          step={5}
                        >
                          <RangeSliderTrack>
                            <RangeSliderFilledTrack />
                          </RangeSliderTrack>
                          <RangeSliderThumb index={0} />
                          <RangeSliderThumb index={1} />
                        </RangeSlider>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">
                          Coherencia: {tempFilters.metrics.coherence[0]}% - {tempFilters.metrics.coherence[1]}%
                        </FormLabel>
                        <RangeSlider
                          value={tempFilters.metrics.coherence}
                          onChange={(value) => handleFilterChange("metrics", {
                            ...tempFilters.metrics,
                            coherence: value as [number, number]
                          })}
                          min={0}
                          max={100}
                          step={5}
                        >
                          <RangeSliderTrack>
                            <RangeSliderFilledTrack />
                          </RangeSliderTrack>
                          <RangeSliderThumb index={0} />
                          <RangeSliderThumb index={1} />
                        </RangeSlider>
                      </FormControl>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Filtros por etiquetas */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="bold">Etiquetas</Text>
                    
                    <CheckboxGroup
                      value={tempFilters.tags}
                      onChange={(values) => handleFilterChange("tags", values)}
                    >
                      <Stack spacing={2}>
                        {availableTags.map((tag) => (
                          <Checkbox key={tag} value={tag}>
                            {tag}
                          </Checkbox>
                        ))}
                      </Stack>
                    </CheckboxGroup>
                  </VStack>
                </CardBody>
              </Card>

              {/* Filtros por sesiones */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="bold">Número de Sesiones</Text>
                    
                    <HStack spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">Mínimo:</FormLabel>
                        <Input
                          type="number"
                          value={tempFilters.sessions.min}
                          onChange={(e) => handleFilterChange("sessions", {
                            ...tempFilters.sessions,
                            min: parseInt(e.target.value) || 0
                          })}
                          min={0}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel fontSize="sm">Máximo:</FormLabel>
                        <Input
                          type="number"
                          value={tempFilters.sessions.max}
                          onChange={(e) => handleFilterChange("sessions", {
                            ...tempFilters.sessions,
                            max: parseInt(e.target.value) || 50
                          })}
                          min={0}
                        />
                      </FormControl>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Ordenamiento */}
              <Card>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="bold">Ordenar por</Text>
                    
                    <HStack spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">Campo:</FormLabel>
                        <Select
                          value={tempFilters.sortBy}
                          onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                        >
                          <option value="date">Fecha</option>
                          <option value="recall">Recall</option>
                          <option value="coherence">Coherencia</option>
                          <option value="sessions">Sesiones</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel fontSize="sm">Orden:</FormLabel>
                        <Select
                          value={tempFilters.sortOrder}
                          onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                        >
                          <option value="desc">Descendente</option>
                          <option value="asc">Ascendente</option>
                        </Select>
                      </FormControl>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpiar Todo
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="blue" onClick={handleApplyFilters}>
                Aplicar Filtros
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
