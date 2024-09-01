import { Loader2, Plus } from "lucide-react";
import { signOut } from "next-auth/react";
import React, { ChangeEvent, FormEvent, useState } from "react";
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
  const [showSuggestions, setShowSuggestions] = useState(true); // Suggestion visibility state

  const exampleMessages = [
    "What are the trending memecoins today?",
    "What is the price of $DOGE right now?",
    "I would like to buy 42 $DOGE",
    "What are some recent events about $DOGE?",
  ];

  // Suggestion click handler
  const handleSuggestionClick = (suggestion: string) => {
    handleInputChange({ target: { value: suggestion } } as ChangeEvent<HTMLInputElement>);
    setShowSuggestions(false); // Hide suggestions on click
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
    setShowSuggestions(false); // Hide suggestions on submit
    handleSubmit(event, chatRequestOptions);
  };

  return (
    <div className="input-form-container">
      {/* Suggestion Section */}
      {showSuggestions && (
        <div className="suggestions-container flex flex-col items-center gap-2 mb-2">
          {exampleMessages.map((msg, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(msg)}
              className="suggestion-button border px-4 py-2 rounded hover:bg-gray-200 text-center w-full max-w-sm"
            >
              {msg}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(event) =>
          handleSubmitWithHideSuggestions(event, {
            data: {
              images: JSON.stringify(images),
            },
          })
        }
        className="w-full flex flex-row gap-2 items-center h-full mt-5"
      >
        <button
          onClick={handleSignOut}
          type="button"
          className="p-2 h-10 w-10 text-red-500 border border-red-500 rounded-full flex items-center justify-center"
          title="Sign Out"
        >
          ⏻ {/* Power icon */}
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
        <button
          type="submit"
          className="send-button"
          title="Submit Prompt"
        >
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
