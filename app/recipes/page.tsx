// app/recipe/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { PrismaClient } from "@prisma/client";
import Markdown from "@/app/component/markdown"; // Adjust the import path based on your project structure

const prisma = new PrismaClient();

type QuestionAnswer = {
  id: number;
  question: string;
  answer: string;
};

const RecipePage = () => {
  const [qaData, setQaData] = useState<QuestionAnswer[]>([]);

  // Fetch data from the database
  useEffect(() => {
    const fetchQAData = async () => {
      try {
        const response = await fetch("/api/recipes");
        const data: QuestionAnswer[] = await response.json();
        setQaData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchQAData();
  }, []);

  return (
    <div className="recipe-page-container">
      <h1 className="text-2xl font-bold mb-4">Recipe Questions and Answers</h1>
      <div className="qa-list">
        {qaData.map((item) => (
          <div key={item.id} className="qa-item mb-6 p-4 border rounded shadow">
            <h2 className="question font-semibold mb-2">{item.question}</h2>
            <Markdown text={item.answer} /> {/* Render the answer using the Markdown component */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipePage;