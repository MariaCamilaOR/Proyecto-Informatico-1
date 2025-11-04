import { jsx as _jsx } from "react/jsx-runtime";
import { Spinner, Box } from "@chakra-ui/react";
export function Loader({ size = "lg", color = "blue.500" }) {
    return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", p: 8, children: _jsx(Spinner, { size: size, color: color }) }));
}
