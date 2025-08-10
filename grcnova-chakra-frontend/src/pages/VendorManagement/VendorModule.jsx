import { Outlet } from "react-router-dom";
import { Box } from "@chakra-ui/react";

const VendorModule = () => {
  return (
    <Box>
      {/* Optional: Add header/breadcrumbs here */}
      <Outlet />
    </Box>
  );
};

export default VendorModule;