import { useEffect } from "react";

/**
 * This component logs environment variables for debugging.
 * Use it to confirm if environment variables are loaded properly.
 */
const EnvCheck = () => {
  useEffect(() => {
    // Log environment variables
    console.log("Environment Variables Check:");
    console.log("VITE_CREATOR_FUND_WALLET:", import.meta.env.VITE_CREATOR_FUND_WALLET || "not set");
    console.log("VITE_APP_FUND_WALLET:", import.meta.env.VITE_APP_FUND_WALLET || "not set");
    console.log("NODE_ENV:", import.meta.env.NODE_ENV || "not set");
    
    // Log all env variables for debugging
    console.log("All environment variables:", import.meta.env);
  }, []);

  // This component doesn't render anything
  return null;
};

export default EnvCheck;