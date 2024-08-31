'use client';
import Link from 'next/link';
import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    const createStar = () => {
      const star = document.createElement('div');
      star.classList.add('star');
      star.style.left = `${Math.random() * 100}vw`;
      star.style.animationDuration = `${Math.random() * 5 + 5}s`; // Daha yavaş hız
      star.style.transform = `rotate(${Math.random() * 360}deg)`; // Rastgele yön
      document.body.appendChild(star);

      setTimeout(() => {
        star.remove();
      }, 10000); // Daha uzun süre için
    };

    const starInterval = setInterval(createStar, 300);

    // Cleanup function to stop the star creation
    return () => {
      clearInterval(starInterval);
      document.querySelectorAll('.star').forEach(star => star.remove());
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-gray-900 text-white overflow-hidden">
      <div className="text-center mt-16 z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Your Recipe Assistant</h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          AI-powered chatbot for delicious recipes, cooking tips, and kitchen hacks.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Link href="/bot" className="bg-green-600 hover:bg-green-700 text-white py-5 px-6 rounded-md text-lg">
            Chat with Recipe Assistant
          </Link>
          <Link href="/recipes" className="bg-amber-600 hover:bg-amber-700 text-white py-5 px-6 rounded-md text-lg">
            Explore Popular Recipes
          </Link>
        </div>
      </div>
      <style jsx global>{`
        body {
          margin: 0;
          overflow: hidden;
        }
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          top: -2px;
          box-shadow: 0 0 10px white, 0 0 20px white, 0 0 30px white, 0 0 40px white, 0 0 50px white; // Daha uzun iz efekti
          animation: fall linear infinite;
        }
        @keyframes fall {
          to {
            transform: translateY(100vh) translateX(50vw); // Daha sola kayma
          }
        }
      `}</style>
    </div>
  );
}
