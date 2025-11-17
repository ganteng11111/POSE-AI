import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function getPoseIdeas(theme: string, numPoses: number): Promise<string[]> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the theme "${theme}", generate a JSON array of ${numPoses} unique, simple, and distinct full-body pose descriptions for a person. Only return a valid JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "A description of a person's pose."
          }
        }
      }
    });

    const jsonText = response.text.trim();
    const ideas = JSON.parse(jsonText);
    if (Array.isArray(ideas) && ideas.every(item => typeof item === 'string')) {
      return ideas;
    }
    throw new Error("Invalid format for pose ideas.");
  } catch (error) {
    console.error("Error generating pose ideas:", error);
    throw new Error("Could not generate pose ideas. The model may be unavailable or the prompt may be inappropriate.");
  }
}

async function generateSinglePose(base64Image: string, mimeType: string, posePrompt: string, theme: string, aspectRatio: string): Promise<string | null> {
    try {
        let aspectRatioInstruction = '';
        switch (aspectRatio) {
            case '9:16':
                aspectRatioInstruction = 'CRITICAL: The generated image MUST have a 9:16 aspect ratio (vertical portrait). Re-frame the entire scene to fit this vertical format.';
                break;
            case '16:9':
                aspectRatioInstruction = 'CRITICAL: The generated image MUST have a 16:9 aspect ratio (horizontal landscape). Re-frame the entire scene to fit this widescreen format.';
                break;
            case '1:1':
            default:
                aspectRatioInstruction = 'CRITICAL: The generated image MUST have a 1:1 aspect ratio (a perfect square).';
                break;
        }

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: `${aspectRatioInstruction} Create a high-quality, photorealistic image of the person from the input photo. Their face must be clearly visible and very similar to the original. They are in the following pose: '${posePrompt}'. The background is a scene based on the theme: '${theme}'.`,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        return null; // Return null if no image part is found
    } catch (error) {
        console.error(`Error generating pose for prompt "${posePrompt}":`, error);
        return null; // Return null on failure to not break Promise.allSettled
    }
}

export async function generatePosesFromImage(
  base64Image: string,
  mimeType: string,
  theme: string,
  aspectRatio: string,
  numPoses: number,
  setLoadingMessage: (message: string) => void,
  onImageGenerated: (imageB64: string) => void
): Promise<void> {

  setLoadingMessage("Generating creative pose ideas...");
  const poseIdeas = await getPoseIdeas(theme, numPoses);

  if (poseIdeas.length === 0) {
    throw new Error("Failed to generate any pose ideas.");
  }

  setLoadingMessage(`Got ${poseIdeas.length} ideas! Now generating images...`);

  let completedCount = 0;

  const generationPromises = poseIdeas.map((idea, index) => {
    return (async () => {
      const result = await generateSinglePose(base64Image, mimeType, idea, theme, aspectRatio);
      completedCount++;
      setLoadingMessage(`Generating images... (${completedCount}/${poseIdeas.length})`);
      if (result) {
        onImageGenerated(result);
      }
    })();
  });

  await Promise.all(generationPromises);
}