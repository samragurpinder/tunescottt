import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface VideoResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}

export async function searchYouTube(song: string, singer: string, keywords: string): Promise<VideoResult[]> {
  try {
    const prompt = `Find 3 specific YouTube videos for the song "${song}" by "${singer}" with keywords "${keywords}". 
    For each video, provide the YouTube video ID, the exact title, the channel name, and a high quality thumbnail URL (use the standard format https://img.youtube.com/vi/[videoId]/hqdefault.jpg).
    
    Return a JSON array of objects with keys: videoId, title, channelTitle, thumbnailUrl.
    Ensure the video IDs are valid 11-character strings.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              videoId: { type: Type.STRING },
              title: { type: Type.STRING },
              channelTitle: { type: Type.STRING },
              thumbnailUrl: { type: Type.STRING },
            },
            required: ["videoId", "title", "channelTitle", "thumbnailUrl"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as VideoResult[];
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return [];
  }
}

export async function getTrendingSongs(): Promise<VideoResult[]> {
  try {
    const prompt = `Find 6 currently trending global music hits.
    For each video, provide the YouTube video ID, the exact title, the channel name, and a high quality thumbnail URL.
    Return a JSON array of objects with keys: videoId, title, channelTitle, thumbnailUrl.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              videoId: { type: Type.STRING },
              title: { type: Type.STRING },
              channelTitle: { type: Type.STRING },
              thumbnailUrl: { type: Type.STRING },
            },
            required: ["videoId", "title", "channelTitle", "thumbnailUrl"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as VideoResult[];
  } catch (error) {
    console.error("Error fetching trending:", error);
    return [];
  }
}

export async function getMoodPlaylist(mood: string): Promise<VideoResult[]> {
  try {
    const prompt = `Create a playlist of 5 songs for a "${mood}" mood.
    For each video, provide the YouTube video ID, the exact title, the channel name, and a high quality thumbnail URL.
    Return a JSON array of objects with keys: videoId, title, channelTitle, thumbnailUrl.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              videoId: { type: Type.STRING },
              title: { type: Type.STRING },
              channelTitle: { type: Type.STRING },
              thumbnailUrl: { type: Type.STRING },
            },
            required: ["videoId", "title", "channelTitle", "thumbnailUrl"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as VideoResult[];
  } catch (error) {
    console.error("Error fetching mood playlist:", error);
    return [];
  }
}

export async function getRecommendations(history: VideoResult[]): Promise<VideoResult[]> {
  if (history.length === 0) return getTrendingSongs();
  
  try {
    const recentTitles = history.slice(0, 3).map(v => v.title).join(", ");
    const prompt = `Based on these songs: ${recentTitles}, recommend 5 similar songs.
    For each video, provide the YouTube video ID, the exact title, the channel name, and a high quality thumbnail URL.
    Return a JSON array of objects with keys: videoId, title, channelTitle, thumbnailUrl.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              videoId: { type: Type.STRING },
              title: { type: Type.STRING },
              channelTitle: { type: Type.STRING },
              thumbnailUrl: { type: Type.STRING },
            },
            required: ["videoId", "title", "channelTitle", "thumbnailUrl"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as VideoResult[];
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
}
