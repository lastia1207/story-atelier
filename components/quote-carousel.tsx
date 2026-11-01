"use client";

import { useEffect, useState } from "react";

interface Quote {
  text: string;
  author: string;
}

const QUOTES: Quote[] = [
  { text: "Fill your paper with the breathings of your heart.", author: "William Wordsworth" },
  { text: "There is no greater power on this earth than story.", author: "Libba Bray" },
  { text: "It is not down in any map; true places never are.", author: "Herman Melville" },
  { text: "I'm a writer. I write not only for a living, I write because I'm a writer.", author: "Gary Jennings" },
  { text: "If there's a book that you want to read, but it hasn't been written yet, then you must write it.", author: "Toni Morrison" },
];

const INTERVAL_MS = 10_000;

export function QuoteCarousel() {
  const [index, setIndex] = useState(0);

  // Cycle every 10s; setState runs in the interval callback (a timer), which is
  // a legitimate external-system subscription — not a setState-in-effect issue.
  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % QUOTES.length), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const quote = QUOTES[index];

  return (
    <figure key={index} className="quote-fade mt-3 min-h-[72px] max-w-xl">
      <blockquote className="text-lg leading-7 text-ink-dim">
        “{quote.text}” — <span className="font-medium text-lilac">{quote.author}</span>
      </blockquote>
    </figure>
  );
}
