import { useEffect, useState } from "react";

function useQuotes() {
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    const initializeQuotes = async () => {
      try {
        const quotesResponse = await fetch("/bff/quotes", {
          credentials: "same-origin",
        });
        const data = await quotesResponse.json();
        setQuotes(data);
      } catch (error) {
        console.error("Error during app initialization:", error);
      }
    };

    initializeQuotes();
  }, []);

  return quotes;
}

export default useQuotes;
