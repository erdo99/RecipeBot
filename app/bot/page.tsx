"use client";
import { useRef, useEffect } from "react";
import { useChat } from "ai/react";
import Image from "next/image";
import Messages from "../component/messages";
import InputForm from "../component/inputForm";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: "api/genai",
    onFinish: (message) => {
      console.log("AI response completed:", message);
    },
  });

  const chatContainer = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null); // Ref for the last message

  const scrollToBottom = () => {
    if (chatContainer.current && lastMessageRef.current) {
      const lastMessageHeight = lastMessageRef.current.offsetHeight; // Measure the last message height
      const scrollHeight = chatContainer.current.scrollHeight;
      const scrollNeed = scrollHeight - lastMessageHeight; // Adjust the scroll position to keep the last message near the top

      window.scrollTo({
        top: scrollNeed,
        behavior: "smooth",
      });

      console.log(`Scrolled to adjusted position. ScrollHeight: ${scrollHeight}, LastMessageHeight: ${lastMessageHeight}`);
    } else {
      console.log("chatContainer or lastMessageRef is null");
    }
  };

  useEffect(() => {
    console.log("Messages updated:", messages);
    scrollToBottom();
  }, [messages]);

  return (
    <>
      
      <main className="flex flex-col justify-between min-h-screen w-full p-4">
        <div className="flex-1 overflow-y-auto mb-4" ref={chatContainer}>
          <Messages messages={messages} isLoading={isLoading} lastMessageRef={lastMessageRef} />
        </div>

        <div className="sticky bottom-0 w-full">
          <InputForm
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
          />
        </div>
      </main>
    </>
  );
}
