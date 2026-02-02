// 🎤 USE SPEECH HOOK
// Text-to-Speech (TTS) ve Speech-to-Text (STT)

import { useState, useCallback, useEffect, useRef } from 'react';

export const useSpeech = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const isCancelledRef = useRef(false);

  /**
   * Text-to-Speech - Metni seslendir
   */
  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text || !isEnabled) return;

    // Önceki konuşmayı durdur
    window.speechSynthesis.cancel();
    isCancelledRef.current = false;
    setIsSpeaking(true);

    // Metni temizle (markdown karakterlerini kaldır)
    const cleanText = text
      .replace(/[#*_`>-]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    // Cümlelere böl
    const chunks = cleanText
      .split(/[.!?]+/)
      .filter(c => c.trim().length > 0);

    // Chunk'ları sırayla konuş
    const speakChunk = (index) => {
      if (index >= chunks.length || isCancelledRef.current) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = 'tr-TR';
      utterance.volume = 1.0;
      utterance.rate = 0.88;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        if (!isCancelledRef.current) {
          setTimeout(() => speakChunk(index + 1), 150);
        } else {
          setIsSpeaking(false);
        }
      };

      utterance.onerror = (event) => {
        console.error('TTS Error:', event);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakChunk(0);
  }, [isEnabled]);

  /**
   * Konuşmayı durdur
   */
  const stopSpeaking = useCallback(() => {
    isCancelledRef.current = true;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  /**
   * TTS'yi aç/kapat
   */
  const toggleSpeech = useCallback(() => {
    setIsEnabled(prev => {
      const newState = !prev;
      if (!newState) {
        stopSpeaking();
      }
      return newState;
    });
  }, [stopSpeaking]);

  /**
   * Speech-to-Text - Dinlemeye başla
   */
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Tarayıcınız ses tanıma desteklemiyor');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      console.log('🎤 Dinleme başladı');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('📝 Algılanan:', transcript);

      // Input'a yaz (window.setSpeechInput callback'i)
      if (window.setSpeechInput) {
        window.setSpeechInput(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Ses tanıma hatası:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('🎤 Dinleme bitti');
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  /**
   * Dinlemeyi durdur
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  /**
   * Cleanup
   */
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [stopSpeaking, stopListening]);

  return {
    // TTS
    speak,
    stopSpeaking,
    isSpeaking,
    isEnabled,
    toggleSpeech,

    // STT
    startListening,
    stopListening,
    isListening
  };
};

export default useSpeech;
