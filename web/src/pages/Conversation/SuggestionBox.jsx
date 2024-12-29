import React from "react";
import { Button } from "@/components/components/ui/button";

const SuggestionBar = ({ suggestions, onSuggestionClick, className }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion}
          // variant="ghost"
          size="sm"
          onClick={() => onSuggestionClick(suggestion)}
          className="text-primary-foreground border-primary-foreground hover:bg-primary hover:text-primary-foreground"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
};

export default SuggestionBar;
