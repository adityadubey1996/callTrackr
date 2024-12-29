"use client";

import React, { Component } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/components/ui/dialog";
import { Textarea } from "@/components/components/ui/textarea";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/components/ui/alert";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // You can also log the error to an error reporting service here
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleSubmitFeedback = (event) => {
    event.preventDefault();
    const feedbackText = event.target.elements.feedback.value;
    // Here you would typically send this feedback to your server or error tracking service
    console.log("Feedback submitted:", feedbackText);
    // Reset the error state to allow the app to try and re-render
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Dialog
          open={this.state.hasError}
          onOpenChange={() => this.setState({ hasError: false })}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Oops! Something went wrong</DialogTitle>
              <DialogDescription>
                We're sorry for the inconvenience. Please provide any details
                about what you were doing when this error occurred.
              </DialogDescription>
            </DialogHeader>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {this.state.error && this.state.error.toString()}
              </AlertDescription>
            </Alert>
            <form onSubmit={this.handleSubmitFeedback}>
              <Textarea
                name="feedback"
                placeholder="Please describe what you were doing when the error occurred..."
                className="min-h-[100px]"
              />
              <DialogFooter className="mt-4">
                <Button type="submit">Submit Feedback</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
