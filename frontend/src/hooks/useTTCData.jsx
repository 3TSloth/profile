import { useEffect, useState } from "react";

function useTTCData() {
  const [TTCData, setTTCData] = useState([]);

  useEffect(() => {
    const getTTCData = async () => {
      try {
        const TTCDataResponse = await fetch(
          "/bff/ttc_subway_delay_data",
          { credentials: "same-origin" },
        );
        if (!TTCDataResponse.ok) {
          throw new Error(`HTTP error! status: ${TTCDataResponse.status}`);
        }

        const data = await TTCDataResponse.json();
        setTTCData(data);
      } catch (error) {
        console.error("Error when retrieving TTC Data:", error);
      }
    };

    getTTCData();
  }, []);

  return TTCData;
}

export default useTTCData;
