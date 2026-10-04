import { useState, useEffect, useRef, useCallback } from 'react';

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface UseVoiceRecognitionOptions {
  onResult?: (transcript: string) => void;
  lang?: string;
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
  const { onResult, lang = 'en-IN' } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== 'undefined' && 
    (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      if (event.results[0]?.isFinal && onResult) {
        onResult(currentTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access was denied. Please allow microphone permissions.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please speak clearly.');
      } else {
        setError(`Voice error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [isSupported, lang, onResult]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    setError(null);
    setTranscript('');
    try {
      recognitionRef.current?.start();
    } catch {
      // If already started, restart
      try {
        recognitionRef.current?.stop();
        setTimeout(() => recognitionRef.current?.start(), 150);
      } catch {
        // ignore
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    setTranscript,
  };
}
