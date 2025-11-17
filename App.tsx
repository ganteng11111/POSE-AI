import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImageGrid } from './components/ImageGrid';
import { Loader } from './components/Loader';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { generatePosesFromImage } from './services/geminiService';
import type { UploadedFile } from './types';

// Declare JSZip for use from CDN
declare var JSZip: any;

function App() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [prompt, setPrompt] = useState<string>('posing in a futuristic city');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [numPoses, setNumPoses] = useState<number>(9);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: UploadedFile) => {
    setUploadedFile(file);
    setGeneratedImages([]);
    setError(null);
  };

  const handleGenerateClick = useCallback(async () => {
    if (!uploadedFile) {
      setError('Please upload an image first.');
      return;
    }
    if (!prompt) {
      setError('Please enter a prompt describing the scene or theme.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      await generatePosesFromImage(
        uploadedFile.base64,
        uploadedFile.type,
        prompt,
        aspectRatio,
        numPoses,
        setLoadingMessage,
        (imageB64) => {
           setGeneratedImages(prev => [...prev, `data:image/png;base64,${imageB64}`]);
        }
      );
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [uploadedFile, prompt, aspectRatio, numPoses]);

  const handleDownloadAll = async () => {
      if (generatedImages.length === 0) return;

      setIsZipping(true);
      try {
        const zip = new JSZip();
        
        const fetchAsBlob = (url: string) => fetch(url).then(res => res.blob());

        const imagePromises = generatedImages.map((src, index) => {
          return fetchAsBlob(src).then(blob => {
            zip.file(`pose_${index + 1}.png`, blob);
          });
        });

        await Promise.all(imagePromises);

        const zipBlob = await zip.generateAsync({ type: 'blob' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = 'generated_poses.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch(e) {
        console.error("Error zipping files:", e);
        setError("Could not create zip file for download.");
      } finally {
        setIsZipping(false);
      }
    };
    
  const generateButtonText = () => {
    if (isLoading) return 'Generating...';
    if (numPoses === 1) return 'Generate 1 Pose';
    return `Generate ${numPoses} Poses`;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              AI Pose Generator
            </span>
          </h1>
          <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
            Upload a photo, describe a theme, and watch AI create unique poses for you.
          </p>
        </header>
        
        <div className="max-w-4xl mx-auto bg-gray-800/50 rounded-2xl shadow-xl p-6 md:p-8 backdrop-blur-sm border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-6">
              <ImageUploader onImageUpload={handleImageUpload} />
            </div>
            <div className="flex flex-col gap-6">
               <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                  2. Describe the Theme or Scene
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'at a coffee shop', 'exploring a fantasy forest'"
                  className="w-full h-28 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors placeholder-gray-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Poses
                    </label>
                    <div className="flex space-x-2 rounded-lg bg-gray-900 p-1">
                    {[1, 3, 9].map((num) => (
                        <button
                        key={num}
                        onClick={() => setNumPoses(num)}
                        className={`w-full rounded-md py-2 text-sm font-semibold transition-colors ${
                            numPoses === num
                            ? 'bg-purple-600 text-white'
                            : 'bg-transparent text-gray-400 hover:bg-gray-700'
                        }`}
                        >
                        {num}
                        </button>
                    ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                    Aspect Ratio
                    </label>
                    <div className="flex space-x-2 rounded-lg bg-gray-900 p-1">
                    {['1:1', '9:16', '16:9'].map((ratio) => (
                        <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`w-full rounded-md py-2 text-sm font-semibold transition-colors ${
                            aspectRatio === ratio
                            ? 'bg-purple-600 text-white'
                            : 'bg-transparent text-gray-400 hover:bg-gray-700'
                        }`}
                        >
                        {ratio}
                        </button>
                    ))}
                    </div>
                </div>
              </div>
              <button
                onClick={handleGenerateClick}
                disabled={isLoading || !uploadedFile}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
              >
                <SparklesIcon />
                {generateButtonText()}
              </button>
            </div>
          </div>
          {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </div>

        {isLoading && <Loader message={loadingMessage} progress={generatedImages.length} total={numPoses} />}
        
        {!isLoading && generatedImages.length > 0 && (
          <div className="mt-12">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-center">Generated Poses</h2>
                <button
                    onClick={handleDownloadAll}
                    disabled={isZipping}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all"
                    aria-label="Download all generated images as a zip file"
                >
                    <DownloadIcon className="w-5 h-5" />
                    {isZipping ? 'Zipping...' : 'Download All'}
                </button>
            </div>
            <ImageGrid images={generatedImages} />
          </div>
        )}
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
          <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
}

export default App;