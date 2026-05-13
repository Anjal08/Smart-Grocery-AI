"use client";

import { useState, useEffect, useRef } from "react";

export const useSpeechToText = (lang: string = "en-IN") => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorType, setErrorType] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = lang;

        recognition.onresult = (event: any) => {
          const result = event.results[0][0].transcript;
          setTranscript(result);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          
          if (event.error === "network") {
            setIsError(true);
            setErrorType("network");
          } else {
            setErrorType(event.error);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setIsError(false);
      setErrorType(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        console.error("Microphone start failed:", err);
        setIsError(true);
        setErrorType("blocked");
        setIsListening(false);
      }
    }
  };

  return {
    transcript,
    isListening,
    isError,
    errorType,
    toggleListening,
    setTranscript,
  };
};
