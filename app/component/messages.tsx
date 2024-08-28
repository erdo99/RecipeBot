import React, { useRef, useEffect } from "react";
import Markdown from "./markdown";
import { Bot, User2 } from "lucide-react";
import { Message } from "ai/react";

type Props = {
  messages: Message[];
  isLoading: boolean;
  lastMessageRef: React.RefObject<HTMLDivElement>; // Add a ref type for the last message
};

const Messages = ({ messages, isLoading, lastMessageRef }: Props) => {
  return (
    <div
      id="chatbox"
      className="flex flex-col w-full text-left mt-4 gap-4 whitespace-pre-wrap"
    >
      {messages.map((m, index) => {
        const isLastMessage = index === messages.length - 1;
        return (
          <div
            key={index}
            ref={isLastMessage ? lastMessageRef : null} // Only attach ref to the last message
            className={`p-4 shadow-md rounded-md ml-10 relative ${
              m.role === "user" ? "bg-stone-300" : ""
            }`}
          >
            <Markdown text={m.content} />
            {m.role === "user" ? (
              <User2 className="absolute -left-10 top-2 border rounded-full p-1 shadow-lg" />
            ) : (
              <Bot
                className={`absolute top-2 -left-10 border rounded-full p-1 shadow-lg stroke-[#0842A0] ${
                  isLoading && isLastMessage ? "animate-bounce" : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
