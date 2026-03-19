import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CryptoNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export const fetchCryptoNews = async (): Promise<CryptoNews[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Fetch the latest top 5 cryptocurrency news stories from the last 24 hours. Provide them in a structured JSON format with: id, title, summary, source, timestamp, url, and sentiment (positive/negative/neutral). Use real current events.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return [];
    
    // Clean potential markdown code blocks
    const cleanedJson = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Error fetching crypto news:", error);
    return [];
  }
};

export const fetchMarketData = async (): Promise<MarketData[]> => {
  // Using a public API for real-time prices is better, but for this demo 
  // we'll use Gemini to get the latest approximate prices or simulate them.
  // In a real app, I'd use CoinGecko API.
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Provide current prices and 24h percentage changes for BTC, ETH, SOL, BNB, and XRP. Format as JSON array: [{symbol, name, price, change24h}].",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return [];
    const cleanedJson = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Error fetching market data:", error);
    return [];
  }
};
