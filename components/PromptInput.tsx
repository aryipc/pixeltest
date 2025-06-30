
'use client'
import { useState } from "react";

export default function PromptInput() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const generate = async () => {
    if (!imageFile) return;
    setError("");
    setOutputImage(null);
    const formData = new FormData();
    formData.append("image", imageFile);

    const res = await fetch("/api/generate-pokemon-card", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      setOutputImage("data:image/jpeg;base64," + data.image);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Upload an image to generate Pokémon card</h2>
      <input type="file" accept="image/*" onChange={handleFile} />
      <button onClick={generate} style={{ marginTop: 10 }}>Generate Card</button>
      {error && <pre style={{ color: "red" }}>{error}</pre>}
      {outputImage && <img src={outputImage} alt="Generated Card" style={{ marginTop: 20, maxWidth: "100%" }} />}
    </div>
  );
}
