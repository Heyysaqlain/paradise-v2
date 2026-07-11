"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SpeechRecognitionEventType = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventType) => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const welcomeMessage =
  "Welcome to Paradise Collection. Aapki pasand ka khayal hum rakhenge. Bas aaj apni pasand ka item select kijiye, aur main aapki shopping mein madad karungi.";

const suggestions = [
  "₹2000 ke andar suits dikhao",
  "Black party wear dikhao",
  "Wedding collection dikhao",
  "New arrivals dikhao",
];

export default function AssistantPage() {
  const router = useRouter();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [assistantMessage, setAssistantMessage] = useState(welcomeMessage);
  const [muted, setMuted] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const hasWelcomed = useRef(false);

  function speak(text: string) {
    if (muted || typeof window === "undefined") return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "hi-IN";
    speech.rate = 0.92;
    speech.pitch = 1.05;

    speech.onstart = () => {
      setIsSpeaking(true);
    };

    speech.onend = () => {
      setIsSpeaking(false);
    };

    speech.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(speech);
  }

  useEffect(() => {
    if (hasWelcomed.current) return;

    hasWelcomed.current = true;

    const timer = window.setTimeout(() => {
      speak(welcomeMessage);
    }, 900);

    return () => {
      window.clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, []);

  function understandRequest(request: string) {
    const text = request.toLowerCase();

    if (text.includes("black") || text.includes("काला")) {
      return "Bilkul. Maine aapke liye black collection select kar li hai. Chaliye aapko matching products dikhati hoon.";
    }

    if (
      text.includes("2000") ||
      text.includes("2 thousand") ||
      text.includes("दो हजार")
    ) {
      return "Zaroor. Main aapko do hazaar rupaye ke budget ke andar available suits dikhaungi.";
    }

    if (text.includes("wedding") || text.includes("shaadi")) {
      return "Bahut khoobsurat choice. Main aapke liye Paradise Collection ki wedding range khol rahi hoon.";
    }

    if (text.includes("party")) {
      return "Perfect. Main aapko hamari premium party wear collection dikhati hoon.";
    }

    if (text.includes("new") || text.includes("latest")) {
      return "Bilkul. Chaliye Paradise Collection ke latest new arrivals dekhte hain.";
    }

    return `Maine aapki request suni: ${request}. Main aapko suitable collection dhoondhne mein madad karungi.`;
  }

  function handleCustomerRequest(request: string) {
    if (!request.trim()) return;

    setTranscript(request);

    const response = understandRequest(request);

    setAssistantMessage(response);

    speak(response);
  }

  function startListening() {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setAssistantMessage(
        "Voice search is browser mein available nahi hai. Google Chrome use kijiye."
      );

      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const recognition = new SpeechRecognitionAPI();

    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setAssistantMessage("Main sun rahi hoon...");
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;

      handleCustomerRequest(spokenText);
    };

    recognition.onerror = () => {
      setIsListening(false);

      setAssistantMessage(
        "Main aapki awaaz samajh nahi paayi. Kripya dobara try kijiye."
      );
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
  }

  function toggleMute() {
    if (!muted) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setMuted((previous) => !previous);
  }

  function goToShop() {
    window.speechSynthesis.cancel();
    router.push("/shop");
  }

  return (
    <main className="assistant-page">
      <div className="assistant-background" />
      <div className="assistant-overlay" />

      <header className="assistant-header">
        <div className="assistant-logo">
          <div className="assistant-logo-icon">P</div>

          <div>
            <strong>PARADISE</strong>
            <span>COLLECTION</span>
          </div>
        </div>

        <button className="enter-store-top" onClick={goToShop}>
          Enter Store
          <span>→</span>
        </button>
      </header>

      <section className="showroom-stage">
        <div className="showroom-light showroom-light-left" />
        <div className="showroom-light showroom-light-right" />

        <div className="assistant-character-section">
          <div className="character-glow" />

          <div
            className={`assistant-character ${
              isSpeaking ? "character-speaking" : ""
            }`}
          >
          <div className="character-image">
  <img
    src="/assistant.png"
    alt="Paradise Assistant"
    className={`assistant-real-image ${
      isSpeaking ? "assistant-speaking" : ""
    }`}
  />
</div>

            {isSpeaking && (
              <div className="voice-waves">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          <div className="assistant-name-card">
            <span className="online-dot" />

            <div>
              <strong>Your Paradise Assistant</strong>
              <small>
                {isListening
                  ? "Listening to you..."
                  : isSpeaking
                  ? "Speaking..."
                  : "Ready to help"}
              </small>
            </div>
          </div>
        </div>

        <div className="assistant-content">
          <p className="assistant-eyebrow">
            YOUR PERSONAL SHOPPING EXPERIENCE
          </p>

          <h1>
            Welcome To Your
            <br />
            <em>Paradise Collection.</em>
          </h1>

          <div className="assistant-message-box">
            <span className="quote-mark">“</span>

            <p>{assistantMessage}</p>

            {transcript && (
              <div className="customer-transcript">
                <small>YOU SAID</small>
                <strong>{transcript}</strong>
              </div>
            )}
          </div>

          <div className="assistant-actions">
            <button
              className={`voice-button ${
                isListening ? "voice-button-listening" : ""
              }`}
              onClick={startListening}
              disabled={isListening}
            >
              <span className="microphone-icon">●</span>

              <div>
                <strong>
                  {isListening ? "Listening..." : "Talk To Your Assistant"}
                </strong>

                <small>
                  {isListening
                    ? "Aap bol sakte hain"
                    : "Hindi, Hinglish or English"}
                </small>
              </div>
            </button>

            <button
              className="sound-control"
              onClick={() => speak(assistantMessage)}
              title="Replay message"
            >
              ↻
            </button>

            <button
              className="sound-control"
              onClick={toggleMute}
              title="Mute or unmute"
            >
              {muted ? "×" : "♪"}
            </button>
          </div>

          <div className="assistant-suggestions">
            <small>TRY SAYING</small>

            <div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleCustomerRequest(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <button className="explore-store-button" onClick={goToShop}>
            Explore Paradise Collection
            <span>→</span>
          </button>
        </div>
      </section>

      <div className="assistant-bottom-message">
        <span />

        <p>CURATED FASHION • PERSONALISED FOR YOU</p>

        <span />
      </div>
    </main>
  );
}