import { Loader2, Plus, Send } from "lucide-react";
import { signOut } from "next-auth/react";
import React, {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import SelectedImages from "./selectedImages";
import { ChatRequestOptions } from "ai";
import messages from "./messages";
import { useChat } from "ai/react";

/*const Chat = () => {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/genai",
  });

  const chatContainer = useRef<HTMLDivElement>(null);

  const scroll = () => {
    if (chatContainer.current) {
      const { offsetHeight, scrollHeight, scrollTop } = chatContainer.current;
      if (scrollHeight >= scrollTop + offsetHeight) {
        chatContainer.current.scrollTo(0, scrollHeight + 200);
      }
    }
  };

  useEffect(() => {
    scroll();
  }, [messages]);
}*/
const handleSignOut = async () => {
  try {
    await signOut({ callbackUrl: "/" });
  } catch (error) {
    console.error("Sign out error:", error);
  }
};

type Props = {
  handleInputChange: ( e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement> ) => void;
  handleSubmit: ( e: FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions | undefined ) => void;
  input: string;
  isLoading: boolean;
  stop: () => void
};



const InputForm = ({
  handleInputChange,
  handleSubmit,
  input,
  isLoading,
  stop
}: Props) => {
  const [images, setImages] = useState<string[]>([]);
  const handleImageSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const imagePromises = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Process the file
      const reader = new FileReader();

      imagePromises.push(
        new Promise<string>((resolve, reject) => {
          // set onload on reader
          reader.onload = (e) => {
            const base64String = e.target?.result?.toString();
            // const base64String = e.target?.result?.toString().split(",")[1];
            resolve(base64String as string);
          };
          // set onerror on reader
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        })
      );
       
    }
    

    try {
      const base64Strings = await Promise.all(imagePromises); // Wait for all conversions
      // setImages(base64Strings as string[]);
      setImages((prevImages: string[]) => {
        // Explicitly type the result as a string array
        const updatedImages: string[] = [
          ...prevImages,
          ...(base64Strings as string[]),
        ];
        // const updatedImages: string[] = base64Strings as string[];
        return updatedImages;
      });
      
    } catch (error) {
      console.error("Error reading image:", error);
    }
  };

  
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit(event, {
          data: {
            images: JSON.stringify(images),
          },
        });
      }}
      className=" w-full flex flex-row gap-2 items-center h-full mt-5 "
    >
      <button
        onClick={handleSignOut}
        type="button"
        className="p-2 h-10 w-10 text-red-500 border border-red-500 rounded-full flex items-center justify-center"
        title="Sign Out"
      >
        ⏻ {/* Power icon */}
      </button>
      <div className="border  flex-row relative"
        title= "add Image"              >
        <Plus
          
          onClick={() => document.getElementById("fileInput")?.click()}
             // Click event handler
          className="cursor-pointer p-3 h-10 w-10 stroke-stone-500"
          
        />
        <SelectedImages images={images} setImages={setImages} />
      </div>
      <input
        className="hidden"
        id="fileInput"
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageSelection}
      />
      <input
        type="text"
        placeholder={isLoading ? "Generating . . ." : "ask something . . . "}
        value={input}
        disabled={isLoading}
        onChange={handleInputChange}
        className="border-b border-dashed outline-none w-full py-2 text-[#0842A0] placeholder:text-[#0842A099] text-center focus:placeholder-transparent disabled:bg-transparent "
      />
      <button
        type="submit"
        className= "send-button "//"rounded-full shadow-md border flex flex-row"
        title = "Submit Prompt"
      >
        {isLoading ? (
          <Loader2
            onClick={stop}
            className="p-3 h-10 w-10 stroke-stone-500 animate-spin"
          />
        ):""}
      </button>
    </form>
  );
};

export default InputForm;
