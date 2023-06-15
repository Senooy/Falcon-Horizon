import React from "react";
import {
  InputGroup,
  useColorModeValue,
} from "@chakra-ui/react";
export function SearchBar(props) {
  // Pass the computed styles into the `__css` prop
  const { variant, background, children, placeholder, borderRadius, ...rest } =
    props;
  // Chakra Color Mode
  return (
    <InputGroup w={{ base: "100%", md: "10px" }} {...rest}>
    
    
    </InputGroup>
  );
}
