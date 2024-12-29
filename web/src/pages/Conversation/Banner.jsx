import React, { useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/components/ui/button";

const Banner = ({ visible, message, variant, dismissible }) => {
  const [isVisible, setIsVisible] = useState(visible);

  if (!isVisible) return null;

  return (
    <Alert variant={variant === "error" ? "destructive" : "default"}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {variant.charAt(0).toUpperCase() + variant.slice(1)}
      </AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          style={{ padding: "0px" }}
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
};

export default Banner;
