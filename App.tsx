import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImageDisplay } from './components/ImageDisplay';
import { Footer } from './components/Footer';
import { generatePixelArt } from './services/geminiService';

const LOCAL_STORAGE_KEY = 'pixelArtState_v1';

// A check to see if we are in a production environment (like Vercel) and the API key is missing.
// We check for production mode via NODE_ENV, a standard environment variable.
const isApiKeyMissing = process.env.NODE_ENV === 'production' && !process.env.API_KEY;

// Helper to read file as base64 for preview
const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Helper to convert a data URL string back into a File object
const dataURLtoFile = (dataurl: string, filename: string): File | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    
    const mime = mimeMatch[1];
    try {
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    } catch (e) {
        console.error("Error converting base64 to File", e);
        return null;
    }
};


const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<{ file: File, previewUrl: string } | null>(null);
  
  // Effect to load state from localStorage on initial mount
  useEffect(() => {
    try {
        const savedStateJSON = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            if (savedState.imageUrl) setImageUrl(savedState.imageUrl);
            if (savedState.error) setError(savedState.error);
            if (savedState.sourceImage?.previewUrl && savedState.sourceImage?.fileName) {
                const file = dataURLtoFile(savedState.sourceImage.previewUrl, savedState.sourceImage.fileName);
                if (file) {
                    setSourceImage({
                        file: file,
                        previewUrl: savedState.sourceImage.previewUrl
                    });
                }
            }
        }
    } catch (e) {
        console.error("Failed to load state from localStorage", e);
        window.localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted state
    } finally {
        setIsInitialized(true);
    }
  }, []);

  // Effect to save state to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return; // Don't save until after initial load
    try {
        const stateToSave = {
            imageUrl,
            error,
            sourceImage: sourceImage ? {
                previewUrl: sourceImage.previewUrl,
                fileName: sourceImage.file.name,
            } : null,
        };
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
        console.error("Failed to save state to localStorage", e);
    }
  }, [imageUrl, error, sourceImage, isInitialized]);


  const handleImageSelect = useCallback(async (file: File) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        setError("Invalid file type. Please upload a PNG, JPEG, or WEBP image.");
        return;
    }
    try {
      const previewUrl = await getBase64(file);
      setSourceImage({ file, previewUrl });
      setError(null); // Clear previous errors
    } catch (err) {
      setError("Could not read the selected image file.");
      console.error(err);
    }
  }, []);

  const handleClearImage = useCallback(() => {
    setSourceImage(null);
    setImageUrl(null);
    setError(null);
  }, []);

  const handleGenerateClick = useCallback(async () => {
    if (!sourceImage || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const url = await generatePixelArt(sourceImage.file);
      setImageUrl(url);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sourceImage]);

  return (
    <div className="min-h-screen bg-gray-900 text-cyan-300 flex flex-col items-center p-4 selection:bg-fuchsia-500 selection:text-white">
      <div className="w-full max-w-2xl mx-auto flex flex-col flex-grow">
        <Header />
        
        {isApiKeyMissing ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-4 m-4 border-2 border-dashed border-red-500 rounded-lg bg-red-900/20">
                <h2 className="text-2xl font-bold text-red-400">Configuration Error</h2>
                <p className="mt-2 text-lg text-red-300">The Gemini API key is missing.</p>
                <p className="mt-4 text-md text-gray-400">
                    This application has been deployed, but the required <strong>API_KEY</strong> has not been set in the hosting environment (e.g., Vercel, Netlify).
                </p>
                 <p className="mt-2 text-md text-gray-400">
                    Please go to your project's dashboard, find the 'Environment Variables' settings, and add a variable named <code className="bg-gray-700 text-fuchsia-400 p-1 rounded">API_KEY</code> with your Google AI API key.
                </p>
            </div>
        ) : (
            <main className="flex-grow flex flex-col items-center w-full">
            <ImageUploader
                sourceImage={sourceImage?.previewUrl ?? null}
                onImageSelect={handleImageSelect}
                onClearImage={handleClearImage}
                isLoading={isLoading}
            />
            <div className="w-full flex justify-center mt-6">
                <button
                    onClick={handleGenerateClick}
                    disabled={isLoading || !sourceImage}
                    className="px-8 py-3 text-xl font-bold text-white bg-fuchsia-600 rounded-lg hover:bg-fuchsia-700 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 disabled:transform-none"
                >
                    {isLoading ? 'Generating...' : 'Generate Pixel Art'}
                </button>
            </div>
            <ImageDisplay
                imageUrl={imageUrl}
                isLoading={isLoading}
                error={error}
                sourceFileName={sourceImage?.file.name ?? null}
            />
            </main>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default App;