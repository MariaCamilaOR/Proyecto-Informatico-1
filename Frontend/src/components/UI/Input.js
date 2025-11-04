import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input as ChakraInput } from "@chakra-ui/react";
export function Input({ label, ...props }) {
    return (_jsxs("div", { children: [label && _jsx("label", { children: label }), _jsx(ChakraInput, { ...props })] }));
}
