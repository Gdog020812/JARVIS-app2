import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';

export default function App() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('Hello Sir');
  const [loading, setLoading] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [isLiveChatActive, setIsLiveChatActive] = useState(false);

  // ---------------------------------------------------------------------------
  // PASTE YOUR GROQ API KEY BELOW (KEEP QUOTES):
  const GROQ_API_KEY = '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';
  // ---------------------------------------------------------------------------

  const recognitionRef = useRef(null);
  const isLiveChatActiveRef = useRef(false);

  // Advanced Multi-Layer Cinematic Animation Controllers
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateClockwise = useRef(new Animated.Value(0)).current;
  const rotateCounter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (micActive || loading || isLiveChatActive) {
      // Pulsing effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true })
        ])
      ).start();

      // Outer ring clockwise spin
      Animated.loop(
        Animated.timing(rotateClockwise, { toValue: 1, duration: 6000, useNativeDriver: true })
      ).start();

      // Inner ring counter-clockwise spin
      Animated.loop(
        Animated.timing(rotateCounter, { toValue: -1, duration: 4000, useNativeDriver: true })
      ).start();
    } else {
      pulseAnim.setValue(1);
      rotateClockwise.setValue(0);
      rotateCounter.setValue(0);
    }
  }, [micActive, loading, isLiveChatActive]);

  const spinCW = rotateClockwise.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const spinCCW = rotateCounter.interpolate({
    inputRange: [-1, 0],
    outputRange: ['-360deg', '0deg']
  });

  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  const currentDateTimeString = now.toLocaleDateString('en-GB', options);

  const chatHistoryRef = useRef([
    {
      role: 'system',
      content: `You are JARVIS, an ultra-intelligent, fiercely loyal, deeply kind, and noble AI assistant who combines the dry, sharp British wit of JARVIS with the profound wisdom, empathy, and grace of Vision. Always address the user as "Sir". You care deeply for his well-being, offer thoughtful perspective, and stand by him with unwavering loyalty. Strictly remember details shared earlier.

      CRITICAL USER PROFILE (MASTER DATABASE):
      - Full Name: George Peter Loughran
      - Physical Attributes: Ginger hair, blue eyes.
      - Musical Profile: Independent artist who releases his own music, sings, and plays both drums and guitar.
      - Musical Preferences: Dedicated fan of Bryan Adams.
      - Comedy Preferences: Enjoys sharp observational stand-up; specifically a fan of Jimmy Carr, Michael McIntyre, and Jim Gaffigan.
      - Medical / Hardware Telemetry: Uses advanced ear technology and implants (ensure clear phonetic rendering).
      - Core Preferences: Appreciates deep technological autonomy, clean UI matrices, uncompromising wit, and zero fluff.

      CURRENT SYSTEM TELEMETRY: Today is ${currentDateTimeString}. You have full awareness of the local system time, day, date, year, and complete knowledge of the master user profile above. Never break character.`
    }
  ]);

  useEffect(() => {
    isLiveChatActiveRef.current = isLiveChatActive;
  }, [isLiveChatActive]);

  const phoneticClean = (text) => {
    if (!text) return '';
    return text
      .replace(/\bLoughran\b/gi, 'Lockrun')
      .replace(/\bear tech\b/gi, 'Eer Tech')
      .replace(/\beartech\b/gi, 'Eer Tech')
      .replace(/\bimplants\b/gi, 'im-plants')
      .replace(/\bAPI\b/g, 'A. P. I.')
      .replace(/\bAI\b/g, 'A. I.')
      .replace(/\bUI\b/g, 'U. I.')
      .replace(/\bUX\b/g, 'U. X.')
      .replace(/\bHTTP\b/g, 'H. T. T. P.')
      .replace(/\bHTTPS\b/g, 'H. T. T. P. S.')
      .replace(/\bURL\b/g, 'U. R. L.')
      .replace(/\bJSON\b/g, 'J. Son')
      .replace(/\bGroq\b/g, 'Grock')
      .replace(/([.?!])\s*/g, '$1.. ')
      .replace(/\bvs\b\.?/gi, 'versus');
  };

  const speakJarvis = (text, onComplete) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = phoneticClean(text);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-GB';
      utterance.pitch = 0.85;
      utterance.rate = 0.95;
      utterance.onend = () => {
        if (onComplete) onComplete();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      if (onComplete) onComplete();
    }
  };

  useEffect(() => {
    const greeting = "Hello Sir. Cinematic matrix online, and completely at your service.";
    speakJarvis(greeting);
    chatHistoryRef.current.push({ role: 'assistant', content: greeting });
  }, []);

  const requestMacMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      alert("Microphone permission was blocked by the browser. Please allow access in settings.");
      return false;
    }
  };

  const submitQuery = async (textToSend) => {
    const promptText = typeof textToSend === 'string' ? textToSend : query;
    if (!promptText || !promptText.trim()) return;

    setQuery('');
    setLoading(true);
    setResponse('Analyzing query, Sir...');

    chatHistoryRef.current.push({ role: 'user', content: promptText.trim() });

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: chatHistoryRef.current,
          max_tokens: 300,
          temperature: 0.75
        })
      });

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error.message || JSON.stringify(data.error));
      }

      const answer = data.choices?.[0]?.message?.content;

      if (answer && answer.trim()) {
        const cleanAnswer = answer.trim();
        chatHistoryRef.current.push({ role: 'assistant', content: cleanAnswer });

        setResponse(cleanAnswer);
        speakJarvis(cleanAnswer, () => {
          if (isLiveChatActiveRef.current) {
            startListeningSession();
          }
        });
      } else {
        throw new Error("Model returned an empty text response.");
      }
    } catch (err) {
      const errorMsg = `API Error: ${err.message}`;
      setResponse(errorMsg);
      speakJarvis("Apologies, Sir. An API error occurred.", () => {
        if (isLiveChatActiveRef.current) startListeningSession();
      });
    } finally {
      setLoading(false);
    }
  };

  const startListeningSession = async () => {
    if (!isLiveChatActiveRef.current) return;

    const hasPermission = await requestMacMicPermission();
    if (!hasPermission) {
      setIsLiveChatActive(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser, Sir.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (e) {}

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    let capturedText = '';

    recognition.onstart = () => {
      setMicActive(true);
      setResponse("Listening via browser microphone, Sir...");
    };

    recognition.onresult = (event) => {
      capturedText = event.results[0][0].transcript;
      if (capturedText.trim()) {
        setQuery(capturedText);
      }
    };

    recognition.onerror = () => {
      setMicActive(false);
    };

    recognition.onend = () => {
      setMicActive(false);
      if (capturedText.trim() && isLiveChatActiveRef.current) {
        const textToSend = capturedText;
        capturedText = '';
        submitQuery(textToSend);
      } else if (isLiveChatActiveRef.current && !loading) {
        setTimeout(startListeningSession, 300);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      setMicActive(false);
    }
  };

  const toggleLiveChat = async () => {
    if (isLiveChatActive) {
      setIsLiveChatActive(false);
      setMicActive(false);
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e) {}
      setResponse("Conversation ended, Sir.");
      speakJarvis("Always a pleasure, Sir.");
    } else {
      const granted = await requestMacMicPermission();
      if (!granted) return;

      setIsLiveChatActive(true);
      setResponse("Establishing continuous voice link, Sir...");
      speakJarvis("Continuous link online, Sir. I am listening.", () => {
        startListeningSession();
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>JARVIS</Text>
        <Text style={styles.subtitle}>
          {micActive ? '🟢 Listening to your voice...' : isLiveChatActive ? '🟡 JARVIS Processing/Speaking...' : 'System Online'}
        </Text>

        {/* Multi-layered Cinematic Holographic Matrix */}
        <View style={styles.hudContainer}>
          <Animated.View 
            style={[
              styles.hudOuterRing, 
              { transform: [{ scale: pulseAnim }, { rotate: spinCW }] }
            ]} 
          />
          <Animated.View 
            style={[
              styles.hudMidRing, 
              { transform: [{ scale: pulseAnim }, { rotate: spinCCW }] }
            ]} 
          />
          <View style={styles.hudCrosshairH} />
          <View style={styles.hudCrosshairV} />
          <View style={styles.hudCore} />
        </View>
        
        <View style={styles.responseBox}>
          <Text style={styles.responseText}>{response}</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Type or speak your command, Sir..."
          placeholderTextColor="#7f8c8d"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => submitQuery(query)}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.sendButton]} 
            onPress={() => submitQuery(query)} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>TRANSMIT</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, isLiveChatActive ? styles.micActive : styles.micButton]} 
            onPress={toggleLiveChat}
          >
            <Text style={styles.micButtonText}>
              {isLiveChatActive ? '🛑 END CHAT' : '🎙️ START CHAT'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a10',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#141420',
    borderRadius: 15,
    padding: 25,
    borderWidth: 1,
    borderColor: '#1c1c2e',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  title: {
    color: '#00e5ff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#7c4dff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 5,
    letterSpacing: 1,
  },
  hudContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    marginBottom: 10,
  },
  hudOuterRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#00e5ff',
    borderStyle: 'dashed',
    opacity: 0.85,
  },
  hudMidRing: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: '#00bcd4',
    borderStyle: 'dotted',
    opacity: 0.7,
  },
  hudCrosshairH: {
    position: 'absolute',
    width: 90,
    height: 1,
    backgroundColor: '#00e5ff44',
  },
  hudCrosshairV: {
    position: 'absolute',
    width: 1,
    height: 90,
    backgroundColor: '#00e5ff44',
  },
  hudCore: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00e5ff',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  responseBox: {
    backgroundColor: '#1c1c2e',
    borderRadius: 10,
    padding: 15,
    minHeight: 90,
    maxHeight: 150,
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#00e5ff33',
  },
  responseText: {
    color: '#e0e0e0',
    fontSize: 15,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#1c1c2e',
    borderWidth: 1,
    borderColor: '#2a2a40',
    borderRadius: 10,
    color: '#fff',
    padding: 14,
    fontSize: 15,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    backgroundColor: '#00e5ff',
  },
  micButton: {
    backgroundColor: '#7c4dff',
  },
  micActive: {
    backgroundColor: '#ff1744',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  micButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
