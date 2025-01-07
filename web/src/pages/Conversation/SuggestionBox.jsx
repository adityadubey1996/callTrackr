import React from "react";
import { Button } from "@/components/components/ui/button";

const SuggestionBar = ({
  suggestions,
  onSuggestionClick,
  className,
  isLoadingSuggestion,
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          // variant="ghost"
          size="sm"
          onClick={() => onSuggestionClick(suggestion.name)}
          className="text-primary-foreground border-primary-foreground hover:bg-primary hover:text-primary-foreground"
        >
          {suggestion.name}
        </Button>
      ))}
    </div>
  );
};

export default SuggestionBar;
