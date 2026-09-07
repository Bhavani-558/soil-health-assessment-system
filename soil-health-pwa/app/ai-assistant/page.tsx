"use client";

import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useSoil, formatDeficiencies, formatFertilizers } from "../../lib/soil-context";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
};

function AIIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function MicIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  );
}

export default function AIAssistantPage() {
  const { latestResult, settings } = useSoil();
  const hasContext = !!latestResult;

  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: hasContext
        ? `Namaste! I am your AI Farm Assistant. I have loaded your latest soil report (${latestResult?.soil_type || "Soil"}, Health Score: ${latestResult?.soil_health_score || "N/A"}/100). Ask me any questions about fertilizer application, crop selection, or deficiency treatment!`
        : "Namaste! I am your AI Farm Assistant. You can ask me general questions about soil health, nitrogen/phosphorus deficiency, organic farming, or suitable crops. For personalized advice, analyze your soil on Home first!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const quickPrompts = [
    "Why is my soil health score low?",
    "What does nitrogen deficiency mean?",
    "Which crop is suitable for my soil?",
    "What fertilizer should I use?",
  ];

  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice("Voice input is not supported on this browser. Please type your question.");
      setTimeout(() => setVoiceNotice(null), 5000);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langCode =
        settings?.language === "hi"
          ? "hi-IN"
          : settings?.language === "kn"
          ? "kn-IN"
          : "en-IN";

      recognition.lang = langCode;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");

        if (transcript) {
          setInput(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const handleSend = (questionText?: string) => {
    const textToSend = questionText || input.trim();
    if (!textToSend) return;

    const userMsg: Message = {
      id: "u_" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput("");

    // Generate intelligent farmer-focused response based on soil context
    setTimeout(() => {
      let botResponse = "";

      const lower = textToSend.toLowerCase();

      if (lower.includes("score") || lower.includes("low")) {
        if (hasContext && latestResult?.soil_health_score) {
          botResponse = `Your current soil health score is ${latestResult.soil_health_score}/100 (${latestResult.soil_health_category || "Moderate"}). Score can decrease due to unbalanced chemical inputs, low organic carbon, or micro-nutrient deficiency like ${latestResult.nutrient_deficiency ? formatDeficiencies(latestResult.nutrient_deficiency) : "Nitrogen"}.`;
        } else {
          botResponse = "Soil health scores drop due to continuous intensive cropping without organic manure, excessive chemical fertilizers, improper pH levels, or moisture stress.";
        }
      } else if (lower.includes("nitrogen") || lower.includes("deficiency")) {
        botResponse = `Nitrogen deficiency causes yellowing of older leaves (chlorosis) and stunted plant growth. ${
          hasContext && latestResult?.fertilizer_dosage?.fertilizer
            ? `Recommended treatment: Apply ${formatFertilizers(latestResult.fertilizer_dosage.fertilizer, { useAmpersand: false })} at approximately ${latestResult.fertilizer_dosage.dosage_kg_per_acre} kg/acre.`
            : "Apply recommended Urea or Bio-fertilizer (Azotobacter) along with organic compost."
        }`;
      } else if (lower.includes("crop") || lower.includes("suitable")) {
        if (hasContext && latestResult?.crop_suitability && latestResult.crop_suitability.length > 0) {
          const topCrops = latestResult.crop_suitability
            .slice(0, 3)
            .map((c) => `${c.crop} (${c.suitability_score}/100)`)
            .join(", ");
          botResponse = `Based on your latest soil test, top suitable crops are: ${topCrops}.`;
        } else {
          botResponse = "Crop suitability depends on your soil texture, pH, and climate. Common resilient crops include Pulse legumes, Groundnut, Wheat, and Maize.";
        }
      } else if (lower.includes("fertilizer") || lower.includes("use")) {
        if (hasContext && latestResult?.fertilizer_dosage) {
          botResponse = `For your soil report, we recommend: ${latestResult.fertilizer_dosage.fertilizer ? formatFertilizers(latestResult.fertilizer_dosage.fertilizer, { useAmpersand: false }) : "NPK Blend"} at a dosage of ${latestResult.fertilizer_dosage.dosage_kg_per_acre || "50"} kg/acre.`;
        } else {
          botResponse = "Split fertilizer application into 2-3 doses (at sowing, tillering, and flowering stages) to minimize leaching and maximize crop absorption.";
        }
      } else {
        botResponse = `Thank you for your question. ${
          hasContext
            ? `Regarding your ${latestResult?.soil_type} soil: maintain optimal irrigation and apply organic manure regularly alongside the recommended ${latestResult?.fertilizer_dosage?.fertilizer ? formatFertilizers(latestResult.fertilizer_dosage.fertilizer, { useAmpersand: false }) : "fertilizer"}.`
            : "Maintain balanced NPK applications, test your soil regular, and add organic compost annually for healthy crop yield."
        }`;
      }

      const botMsg: Message = {
        id: "b_" + Date.now(),
        sender: "bot",
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-6rem)] flex-col space-y-4">
        {/* HEADER WITH CONTEXT INDICATOR */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-800 shrink-0">
              <AIIcon className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-900 leading-tight">
                AI Farm Assistant
              </h1>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                Get simple answers about your soil, crops, nutrients, and fertilizers.
              </p>
            </div>
          </div>

          {/* CONTEXT STATUS BADGE */}
          <div
            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold ${
              hasContext
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-amber-100 text-amber-800 border border-amber-300"
            }`}
          >
            <span className="h-2 w-2 rounded-full animate-pulse bg-current" />
            <span>
              {hasContext
                ? `Context: Active Soil Report (${latestResult?.soil_type})`
                : "Context: General Soil Knowledge"}
            </span>
          </div>
        </div>

        {/* CHAT MESSAGES WINDOW */}
        <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                  m.sender === "user"
                    ? "bg-green-700 text-white rounded-br-none"
                    : "bg-green-50 text-gray-800 border border-green-100 rounded-bl-none"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-75 font-semibold">
                  <span>{m.sender === "user" ? "You" : "Farm Assistant"}</span>
                  <span>{m.timestamp}</span>
                </div>
                <p>{m.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* QUICK PROMPT CHIPS */}
        <div className="flex flex-wrap gap-2 pt-1">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="rounded-xl border border-green-200 bg-green-50/80 px-3 py-1.5 text-xs font-semibold text-green-900 hover:bg-green-100 hover:border-green-400 transition"
            >
              💬 {prompt}
            </button>
          ))}
        </div>

        {voiceNotice && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-800 font-semibold text-center">
            {voiceNotice}
          </div>
        )}

        {/* INPUT BAR WITH VOICE MICROPHONE BUTTON */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your soil or crops..."
              className="w-full rounded-xl border border-gray-300 bg-white p-3.5 pr-12 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
            />
            <button
              type="button"
              onClick={toggleVoiceInput}
              title="Speak your question"
              aria-label="Speak your question"
              className={`absolute right-2.5 p-2 rounded-lg transition-all ${
                isListening
                  ? "bg-red-600 text-white animate-pulse shadow-md"
                  : "text-gray-500 hover:text-green-700 hover:bg-green-50"
              }`}
            >
              <MicIcon className="w-5 h-5" />
            </button>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-green-700 px-6 py-3.5 text-sm font-bold text-white shadow hover:bg-green-800 transition whitespace-nowrap"
          >
            Send ➔
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
