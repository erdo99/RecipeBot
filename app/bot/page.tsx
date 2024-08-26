"use client";
import { useChat } from "ai/react";

import { useEffect, useRef } from "react";
import { SignOutButton } from '../component/authButton';
import { signIn, signOut } from '@/auth';
import { PowerIcon } from '@heroicons/react/24/outline';

import {
  Bot,
  Loader,
  Loader2,
  MoreHorizontal,
  Plus,
  Send,
  User2,
  X,
} from "lucide-react";
import Image from "next/image";
import Markdown from "@/app/component/markdown";
import { ChangeEvent, useState } from "react";
import SelectedImages from "../component/selectedImages";
import InputForm from "../component/inputForm";
import Messages from "../component/messages";
import { FcGoogle } from "react-icons/fc";


export default function Home() {

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat({
      api: "api/genai",
    });

    
    
      const chatContainer = useRef<HTMLDivElement>(null);
    
      const scrollToBottom = () => {
        if (chatContainer.current) {
          chatContainer.current.scrollTo(0, chatContainer.current.scrollHeight);
        }
      };
    
      useEffect(() => {
        // Messages dizisini console.log ile yazdır
        console.log("Messages:", messages.length);
    
        // Kaydırma fonksiyonunu çağır
        scrollToBottom();
      }, [messages]);
    
      

      
    

  return (
    <main className="flex min-h-screen flex-col items-center p-12 text-lg">
      <nav className="flex justify-between  flex-col items-center p-4">
      
          <Image src="/logo.png" alt="Recipe Logo" width={75} height={20} />
          <h1 className="text-xl font-semibold ml-4">
            Talk to <span className="highlighted-text">The Recipe Bot</span>
          </h1>
        
        
      </nav>
      {messages && <Messages messages={messages} isLoading={isLoading} />}
      
      
      <InputForm
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
      />
      
    </main>
  );
}
