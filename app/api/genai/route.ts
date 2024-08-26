import { StreamingTextResponse, GoogleGenerativeAIStream, Message } from "ai";
import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { PrismaClient } from '@prisma/client';
// IMPORTANT! Set the runtime to edge
const prisma = new PrismaClient();
//export const runtime = "edge";
export async function POST(req: Request, res: Response) {
  const reqBody = await req.json();
  const images: string[] = JSON.parse(reqBody.data.images);
  const imageParts = filesArrayToGenerativeParts(images);
  const messages: Message[] = reqBody.messages;
  // if imageparts exist then take the last user message as prompt
  let modelName: string;
  let promptWithParts: any;
  let existingEntry = null;
  const userQuestion = messages.filter((message) => message.role === "user").pop()?.content ?? ""; 
  console.log(userQuestion);  
  try {
     existingEntry = await prisma.questionAnswer.findUnique({
      where: { question: userQuestion },
    });
    if (existingEntry) {
      console.log("Veritabanında mevcut.");
      return new Response(existingEntry.answer, {
        headers: { "Content-Type": "text/plain", "Cache-Control": "no-cache" }
      });
    }
     else {
      console.log("Veritabanında bulunamadı.");
    }
  } catch (error) {
    console.error("Database error:", error);
  }

  if (imageParts.length > 0) {
    modelName = "gemini-1.5-pro";
    const prompt = 
    [...messages]
      .filter((message) => message.role === "user")
      .pop()?.content;
    console.log(prompt);
    promptWithParts = [prompt, ...imageParts];
  } else {
    // else build the multi-turn chat prompt
    modelName = "gemini-1.5-pro";
    promptWithParts = buildGoogleGenAIPrompt(messages);
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: modelName,
  });

  console.log("MODELNAME: " + modelName);
  console.log("PROMPT WITH PARTS: ");
  console.log(promptWithParts);
  const streamingResponse = await model.generateContentStream(promptWithParts);
  try {
    const fullResponse = await streamingResponse.response;
    const answer = await fullResponse.text();
    await prisma.questionAnswer.create({
      data: {
        question: userQuestion,
        answer: answer,
      },
    });
  
    // Kaydedildikten sonra hemen kontrol
    const savedEntry = await prisma.questionAnswer.findUnique({
      where: { question: userQuestion },
    });
    console.log("Yeni kaydedilen entry:", savedEntry);
  } catch (error) {
    console.error("Error saving to database:", error);
  }
  
  return new StreamingTextResponse(GoogleGenerativeAIStream(streamingResponse));
}


function buildGoogleGenAIPrompt(messages: Message[]) {
  const systemInstruction = "You are a helpful AI chef specializing in providing delicious and easy-to-follow recipes. Your primary task is to suggest recipes based on user preferences, ingredients they have on hand, or specific dietary needs. You should always be polite, concise, and make sure the recipes are clear and detailed, suitable for users of all cooking levels. You go straight to the point.";

  return {
    contents: [
      { role: 'model', parts: [{ text: systemInstruction }] }, // Sistem mesajı olarak ekleniyor
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