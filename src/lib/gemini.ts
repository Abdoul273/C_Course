
import { GoogleGenAI, Modality, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Multi-turn Chat helper
export async function getChatMentor(history: any[], message: string) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview", // Base model for general chat
    config: {
      systemInstruction: "Tu es un mentor expert en langage C. Ta mission est d'aider l'étudiant à comprendre les concepts, déboguer son code et fournir des explications claires et pédagogiques. Utilise des analogies si nécessaire.",
    }
  });
  
  // Format history for Gemini
  // In a real app, you'd pass the whole history. 
  // For simplicity here, we assume history is already in the right format if needed, 
  // but ai.chats handles its own state if we keep the instance. 
  // For this implementation, we'll use generateContent with history if preferred, or just the chat object.
  const response = await chat.sendMessage({ message });
  return response.text;
}

// Complex reasoning chat (Pro model)
export async function getComplexExplanation(topic: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Tu es un expert mondial du langage C. Explique en profondeur le concept suivant : ${topic}. 
    Inclus des détails sur la gestion mémoire au niveau CPU/RAM, les pièges courants, et des bonnes pratiques de niveau industriel. 
    Réponds en français avec un ton professionnel et passionné.`,
  });
  return response.text;
}

// C Code Execution Simulation
export async function simulateCRun(code: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Tu es un compilateur et exécuteur C virtuel. 
    Voici un code source C :
    \`\`\`c
    ${code}
    \`\`\`
    
    Exécute mentalement ce code. Si le code est valide, fournis UNIQUEMENT l'output exact tel qu'il apparaîtrait dans une console.
    S'il y a des erreurs de compilation ou d'exécution, décris-les brièvement mais précisément comme le ferait GCC ou Clang.
    Si le code contient des pointeurs, simule des adresses logiques réalistes (ex: 0x7ffe...).`,
  });
  return response.text;
}

// Generate Quiz for Lesson
export async function generateQuiz(lessonTitle: string, lessonContent: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          correctIndex: { type: Type.NUMBER },
          explanation: { type: Type.STRING }
        },
        required: ["question", "options", "correctIndex", "explanation"]
      }
    },
    contents: `Génère un quiz à choix multiple (QCM) sur le sujet suivant : ${lessonTitle}. 
    Contenu de la leçon : ${lessonContent}. 
    Fournis une question, 4 options, l'index de la bonne réponse (0-3) et une explication pédagogique en français.`
  });
  
  if (response.text) {
    return JSON.parse(response.text.trim());
  }
  return null;
}

// Text to Speech
export async function generateTTS(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Lis ceci clairement en français : ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // The TTS model returns raw PCM (24kHz, 16-bit, mono).
      // We must add a WAV header for the browser <audio> tag to play it correctly.
      const pcmData = atob(base64Audio);
      const buffer = new ArrayBuffer(44 + pcmData.length);
      const view = new DataView(buffer);
      
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + pcmData.length, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, 24000, true); // Sample rate
      view.setUint32(28, 24000 * 2, true); // Byte rate
      view.setUint16(32, 2, true); // Block align
      view.setUint16(34, 16, true); // Bits per sample
      writeString(36, 'data');
      view.setUint32(40, pcmData.length, true);

      for (let i = 0; i < pcmData.length; i++) {
        view.setUint8(44 + i, pcmData.charCodeAt(i));
      }

      const blob = new Blob([buffer], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
  return null;
}

// Image Generation
export async function generateConceptImage(prompt: string, size: "1K" | "2K" | "4K" = "1K") {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: `Create a technical educational illustration about C programming: ${prompt}. Clean, professional, schematic style.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: size
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image Generation Error:", error);
  }
  return null;
}
