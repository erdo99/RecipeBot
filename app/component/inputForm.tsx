import { Loader2, Plus } from "lucide-react";
import { signOut } from "next-auth/react";
import React, { ChangeEvent, FormEvent, useState, useRef } from "react";
import SelectedImages from "./selectedImages";
import { ChatRequestOptions } from "ai";

type Props = {
  handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions | undefined) => void;
  input: string;
  isLoading: boolean;
  stop: () => void;
};

const handleSignOut = async () => {
  try {
    await signOut({ callbackUrl: "/" });
  } catch (error) {
    console.error("Sign out error:", error);
  }
};

const InputForm = ({
  handleInputChange,
  handleSubmit,
  input,
  isLoading,
  stop,
}: Props) => {
  const [images, setImages] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const formRef = useRef<HTMLFormElement>(null); // Form referansı

  const exampleMessages = [
    "Karnıyarık nasıl yapılır?",
    "Kolay mercimek çorbası tarifi nedir?",
    "How do you make a classic spaghetti carbonara?",
    "What is the recipe for a simple chicken curry?",
  ];

  // Öneri butonuna tıklanınca çalışacak fonksiyon
  const handleSuggestionClick = (suggestion: string) => {
    handleInputChange({ target: { value: suggestion } } as ChangeEvent<HTMLInputElement>);
    setShowSuggestions(false); // Önerileri gizler
    setTimeout(() => {
      formRef.current?.requestSubmit(); // Formu otomatik gönderir
    }, 100); // Biraz gecikme ekledik ki state güncellenebilsin
  };

  const handleImageSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const imagePromises = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      imagePromises.push(
        new Promise<string>((resolve, reject) => {
          reader.onload = (e) => {
            const base64String = e.target?.result?.toString();
            resolve(base64String as string);
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        })
      );
    }

    try {
      const base64Strings = await Promise.all(imagePromises);
      setImages((prevImages: string[]) => [...prevImages, ...base64Strings]);
    } catch (error) {
      console.error("Error reading image:", error);
    }
  };

  const handleSubmitWithHideSuggestions = (event: FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions) => {
    setShowSuggestions(false); // Önerileri gizler
    handleSubmit(event, chatRequestOptions);
  };

  return (
    <div className="input-form-container flex flex-col items-center">
      {/* Öneri Bölümü */}
      {showSuggestions && (
        <div className="suggestions-container grid grid-cols-2 gap-0.5 mb-4 border border-gray-300 rounded overflow-hidden shadow-md">
          {exampleMessages.map((msg, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(msg)}
              className="suggestion-button relative border border-gray-200 text-xs px-4 py-2 text-center w-full transition duration-300 ease-in-out hover:shadow-inner hover:bg-gradient-to-r hover:from-pink-500 hover:via-purple-500 hover:to-blue-500
              before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-pink-500 before:via-purple-500 before:to-blue-500 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-50 before:rounded-none"
            >
              <span className="relative z-10">{msg}</span>
            </button>
          ))}
        </div>
      )}

      <form
        ref={formRef} // Form referansı atanır
        onSubmit={(event) =>
          handleSubmitWithHideSuggestions(event, {
            data: {
              images: JSON.stringify(images),
            },
          })
        }
        className="w-full flex flex-row gap-2 items-center h-full mt-5 justify-center"
      >
        <button
          onClick={handleSignOut}
          type="button"
          className="p-2 h-10 w-10 text-red-500 border border-red-500 rounded-full flex items-center justify-center"
          title="Sign Out"
        >
          ⏻ {/* Güç simgesi */}
        </button>
        <div className="border flex-row relative" title="add Image">
          <Plus
            onClick={() => document.getElementById("fileInput")?.click()}
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
          className="border-b border-dashed outline-none w-full py-2 text-[#0842A0] placeholder:text-[#0842A099] text-center focus:placeholder-transparent disabled:bg-transparent"
        />
        <button type="submit" className="send-button" title="Submit Prompt">
          {isLoading ? (
            <Loader2
              onClick={stop}
              className="p-3 h-10 w-10 stroke-stone-500 animate-spin"
            />
          ) : null}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
