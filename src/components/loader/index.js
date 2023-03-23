import { Spinner, useTheme } from "@chakra-ui/react";

const Loader = () => {
  const { colors } = useTheme();
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        zIndex: "999",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Spinner
        thickness="6px"
        speed="0.8s"
        emptyColor="gray.200"
        size="xl"
        color={colors.primary}
      />
    </div>
  );
};

export default Loader;
