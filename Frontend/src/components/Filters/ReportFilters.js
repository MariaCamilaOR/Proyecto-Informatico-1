import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { VStack, HStack, Text, Card, CardBody, Button, Select, Input, Checkbox, CheckboxGroup, Stack, Badge, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, FormControl, FormLabel, RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb } from "@chakra-ui/react";
import { FaFilter, FaCalendarAlt, FaChartLine, FaTimes } from "react-icons/fa";
export function ReportFilters({ onFiltersChange, onClearFilters, availableTags = ["familia", "amigos", "vacaciones", "cumpleaños", "trabajo", "hogar"] }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [filters, setFilters] = useState({
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
    const [tempFilters, setTempFilters] = useState(filters);
    const handleFilterChange = (key, value) => {
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
        const defaultFilters = {
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
        if (filters.dateRange.start || filters.dateRange.end)
            count++;
        if (filters.metrics.recall[0] > 0 || filters.metrics.recall[1] < 100)
            count++;
        if (filters.metrics.coherence[0] > 0 || filters.metrics.coherence[1] < 100)
            count++;
        if (filters.tags.length > 0)
            count++;
        if (filters.sessions.min > 0 || filters.sessions.max < 50)
            count++;
        return count;
    };
    const activeFiltersCount = getActiveFiltersCount();
    return (_jsxs(_Fragment, { children: [_jsxs(HStack, { spacing: 2, children: [_jsxs(Button, { leftIcon: _jsx(FaFilter, {}), variant: "outline", size: "sm", onClick: onOpen, children: ["Filtros", activeFiltersCount > 0 && (_jsx(Badge, { ml: 2, colorScheme: "blue", borderRadius: "full", children: activeFiltersCount }))] }), activeFiltersCount > 0 && (_jsx(IconButton, { "aria-label": "Limpiar filtros", icon: _jsx(FaTimes, {}), size: "sm", variant: "ghost", colorScheme: "red", onClick: handleClearFilters }))] }), _jsxs(Modal, { isOpen: isOpen, onClose: onClose, size: "xl", children: [_jsx(ModalOverlay, {}), _jsxs(ModalContent, { children: [_jsx(ModalHeader, { children: _jsxs(HStack, { children: [_jsx(FaFilter, {}), _jsx(Text, { children: "Filtros de Reportes" }), activeFiltersCount > 0 && (_jsxs(Badge, { colorScheme: "blue", children: [activeFiltersCount, " activos"] }))] }) }), _jsx(ModalCloseButton, {}), _jsx(ModalBody, { children: _jsxs(VStack, { spacing: 6, align: "stretch", children: [_jsx(Card, { children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsxs(HStack, { children: [_jsx(FaCalendarAlt, {}), _jsx(Text, { fontWeight: "bold", children: "Rango de Fechas" })] }), _jsxs(HStack, { spacing: 4, children: [_jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Desde:" }), _jsx(Input, { type: "date", value: tempFilters.dateRange.start, onChange: (e) => handleFilterChange("dateRange", {
                                                                                ...tempFilters.dateRange,
                                                                                start: e.target.value
                                                                            }) })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Hasta:" }), _jsx(Input, { type: "date", value: tempFilters.dateRange.end, onChange: (e) => handleFilterChange("dateRange", {
                                                                                ...tempFilters.dateRange,
                                                                                end: e.target.value
                                                                            }) })] })] })] }) }) }), _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsxs(HStack, { children: [_jsx(FaChartLine, {}), _jsx(Text, { fontWeight: "bold", children: "M\u00E9tricas" })] }), _jsxs(VStack, { spacing: 4, children: [_jsxs(FormControl, { children: [_jsxs(FormLabel, { fontSize: "sm", children: ["Recall (Memoria): ", tempFilters.metrics.recall[0], "% - ", tempFilters.metrics.recall[1], "%"] }), _jsxs(RangeSlider, { value: tempFilters.metrics.recall, onChange: (value) => handleFilterChange("metrics", {
                                                                                ...tempFilters.metrics,
                                                                                recall: value
                                                                            }), min: 0, max: 100, step: 5, children: [_jsx(RangeSliderTrack, { children: _jsx(RangeSliderFilledTrack, {}) }), _jsx(RangeSliderThumb, { index: 0 }), _jsx(RangeSliderThumb, { index: 1 })] })] }), _jsxs(FormControl, { children: [_jsxs(FormLabel, { fontSize: "sm", children: ["Coherencia: ", tempFilters.metrics.coherence[0], "% - ", tempFilters.metrics.coherence[1], "%"] }), _jsxs(RangeSlider, { value: tempFilters.metrics.coherence, onChange: (value) => handleFilterChange("metrics", {
                                                                                ...tempFilters.metrics,
                                                                                coherence: value
                                                                            }), min: 0, max: 100, step: 5, children: [_jsx(RangeSliderTrack, { children: _jsx(RangeSliderFilledTrack, {}) }), _jsx(RangeSliderThumb, { index: 0 }), _jsx(RangeSliderThumb, { index: 1 })] })] })] })] }) }) }), _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsx(Text, { fontWeight: "bold", children: "Etiquetas" }), _jsx(CheckboxGroup, { value: tempFilters.tags, onChange: (values) => handleFilterChange("tags", values), children: _jsx(Stack, { spacing: 2, children: availableTags.map((tag) => (_jsx(Checkbox, { value: tag, children: tag }, tag))) }) })] }) }) }), _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsx(Text, { fontWeight: "bold", children: "N\u00FAmero de Sesiones" }), _jsxs(HStack, { spacing: 4, children: [_jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "M\u00EDnimo:" }), _jsx(Input, { type: "number", value: tempFilters.sessions.min, onChange: (e) => handleFilterChange("sessions", {
                                                                                ...tempFilters.sessions,
                                                                                min: parseInt(e.target.value) || 0
                                                                            }), min: 0 })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "M\u00E1ximo:" }), _jsx(Input, { type: "number", value: tempFilters.sessions.max, onChange: (e) => handleFilterChange("sessions", {
                                                                                ...tempFilters.sessions,
                                                                                max: parseInt(e.target.value) || 50
                                                                            }), min: 0 })] })] })] }) }) }), _jsx(Card, { children: _jsx(CardBody, { children: _jsxs(VStack, { spacing: 4, align: "stretch", children: [_jsx(Text, { fontWeight: "bold", children: "Ordenar por" }), _jsxs(HStack, { spacing: 4, children: [_jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Campo:" }), _jsxs(Select, { value: tempFilters.sortBy, onChange: (e) => handleFilterChange("sortBy", e.target.value), children: [_jsx("option", { value: "date", children: "Fecha" }), _jsx("option", { value: "recall", children: "Recall" }), _jsx("option", { value: "coherence", children: "Coherencia" }), _jsx("option", { value: "sessions", children: "Sesiones" })] })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Orden:" }), _jsxs(Select, { value: tempFilters.sortOrder, onChange: (e) => handleFilterChange("sortOrder", e.target.value), children: [_jsx("option", { value: "desc", children: "Descendente" }), _jsx("option", { value: "asc", children: "Ascendente" })] })] })] })] }) }) })] }) }), _jsx(ModalFooter, { children: _jsxs(HStack, { spacing: 2, children: [_jsx(Button, { variant: "outline", onClick: handleClearFilters, children: "Limpiar Todo" }), _jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancelar" }), _jsx(Button, { colorScheme: "blue", onClick: handleApplyFilters, children: "Aplicar Filtros" })] }) })] })] })] }));
}
