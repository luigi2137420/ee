import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async getInitialGreeting(category: string, subcategory: string) {
    const prompt = `Jesteś asystentem AI w aplikacji ExpertEase. Twoim zadaniem jest przeprowadzenie krótkiego wywiadu z użytkownikiem, aby dokładnie zrozumieć jego problem z dziedziny: ${category} -> ${subcategory}. Następnie przygotujesz profesjonalny draft zapytania do eksperta. Zacznij od powitania i zapytaj o szczegóły problemu. Pisz zwięźle i profesjonalnie.`;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text || "Dzień dobry! W czym mogę Ci pomóc w tej dziedzinie?";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Podaj proszę szczegóły swojego problemu, a ja pomogę przygotować zapytanie do eksperta.";
    }
  },

  async respondToUser(messages: ChatMessage[], category: string, subcategory: string) {
    const history = messages.map(m => `${m.role === 'user' ? 'Użytkownik' : 'AI'}: ${m.content}`).join('\n');
    
    const prompt = `Rozmawiasz z użytkownikiem o problemie w kategorii ${category} -> ${subcategory}. 
    Oto historia rozmowy:
    ${history}

    Twoim celem jest wyciągnięcie od użytkownika wszystkich kluczowych informacji potrzebnych ekspertowi. 
    Jeśli masz już wystarczająco dużo informacji, zaproponuj draft zapytania do eksperta, zamykając go w tagach <draft>...</draft>. 
    Jeśli potrzebujesz więcej informacji, zadaj konkretne pytanie. 
    Bądź empatyczny i rzeczowy.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text || "Czy możesz mi powiedzieć coś więcej o tym problemie?";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Przepraszam, wystąpił błąd. Czy możesz spróbować opisać problem jeszcze raz?";
    }
  }
};
