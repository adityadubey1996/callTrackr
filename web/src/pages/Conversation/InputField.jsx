import React, { useState } from "react";
import { Input } from "@/components/components/ui/input";
import { Button } from "@/components/components/ui/button";
import { useEffect } from "react";

const InputField = ({ placeholder, button, editMessage }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      button.onClick(message, editMessage);
      setMessage("");
    }
  };

  useEffect(() => {
    if (editMessage && editMessage.text) {
      setMessage(editMessage.text);
    }
  }, [editMessage, setMessage]);

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        type="text"
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-grow bg-secondary text-secondary-foreground"
      />
      <Button type="submit" variant="default">
        {button.text}
      </Button>
    </form>
  );
};

export default InputField;
