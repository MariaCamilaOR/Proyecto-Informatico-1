import { jsx as _jsx } from "react/jsx-runtime";
import { Button as ChakraButton } from "@chakra-ui/react";
export function Button({ children, ...props }) {
    return _jsx(ChakraButton, { ...props, children: children });
}
