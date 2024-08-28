import { StreamingTextResponse, GoogleGenerativeAIStream, Message } from "ai";
import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { PrismaClient } from '@prisma/client';
import { Readable } from 'stream';
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Node.js Readable'ı Web ReadableStream'e dönüştüren yardımcı fonksiyon
function nodeStreamToWebStream(nodeStream: Readable): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) => controller.enqueue(new Uint8Array(chunk)));
      nodeStream.on('end', () => controller.close());
      nodeStream.on('error', (err) => controller.error(err));
    },
  });
}

export async function POST(req: Request) {
  const reqBody = await req.json();
  const images: string[] = JSON.parse(reqBody.data.images);
  const imageParts = filesArrayToGenerativeParts(images);
  const messages: Message[] = reqBody.messages;
  const userQuestion = messages.filter((message) => message.role === "user").pop()?.content ?? ""; 
  console.log("User Question:", userQuestion);  

  try {
    const existingEntry = await prisma.questionAnswer.findUnique({
      where: { question: userQuestion },
    });
    if (existingEntry && existingEntry.answer) {
      console.log("Veritabanında mevcut. Cevap:", existingEntry.answer);

      

      const nodeStream = Readable.from([existingEntry.answer]);
      const webStream = nodeStreamToWebStream(nodeStream);
      return new StreamingTextResponse(webStream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    } else {
      console.log("Veritabanında bulunamadı veya cevap boş.");
    }
  } catch (error) {
    console.error("Database error:", error);
  }

  let modelName: string;
  let promptWithParts: any;

  if (imageParts.length > 0) {
    modelName = "gemini-1.5-flash";
    const prompt = 
    [...messages]
      .filter((message) => message.role === "user")
      .pop()?.content;
    console.log("Prompt with images:", prompt);
    promptWithParts = [prompt, ...imageParts];
  } else {
    modelName = "gemini-1.5-flash";
    promptWithParts = buildGoogleGenAIPrompt(messages);
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: modelName,
  });

  console.log("Model Name:", modelName);
  console.log("Prompt With Parts:", JSON.stringify(promptWithParts));

  try {
    const streamingResponse = await model.generateContentStream(promptWithParts);
    console.log("Streaming response received");

    const fullResponse = await streamingResponse.response;
    const answer = await fullResponse.text();
    console.log("Full answer:", answer);

    await prisma.questionAnswer.create({
      data: {
        question: userQuestion,
        answer: answer,
      },
    });

    console.log("Answer saved to database");

    const webStream = GoogleGenerativeAIStream(streamingResponse);
    return new StreamingTextResponse(webStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    console.error("Error in AI response or database operation:", error);
    return new Response("An error occurred while processing your request.", { status: 500 });
  }
}

function buildGoogleGenAIPrompt(messages: Message[]) {
  const systemInstruction = "You are a helpful AI chef specializing in providing delicious and easy-to-follow recipes. Your primary task is to suggest recipes based on user preferences, ingredients they have on hand, or specific dietary needs. You should always be polite, concise, and make sure the recipes are clear and detailed, suitable for users of all cooking levels. You go straight to the point.";
  
  return {
    contents: [
      { role: 'model', parts: [{ text: systemInstruction }] },
      ...messages
        .filter((message) => message.role === "user" || message.role === "assistant")
        .map((message) => ({
          role: message.role === "user" ? "user" : "model",
          parts: [{ text: message.content }],
        })),
    ],
  };
}

function filesArrayToGenerativeParts(images: string[]) {
  return images.map((imageData) => ({
    inlineData: {
      data: imageData.split(",")[1],
      mimeType: imageData.substring(
        imageData.indexOf(":") + 1,
        imageData.lastIndexOf(";")
      ),
    },
  }));
}