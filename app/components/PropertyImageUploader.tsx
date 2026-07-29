"use client";

import { ChangeEvent, useState } from "react";

type PropertyImageUploaderProps = {
  onImagesChange: (images: string[]) => void;
};

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 900;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        let width = image.width;
        let height = image.height;

        if (width > height && width > MAX_IMAGE_SIZE) {
          height = Math.round((height * MAX_IMAGE_SIZE) / width);
          width = MAX_IMAGE_SIZE;
        } else if (height > MAX_IMAGE_SIZE) {
          width = Math.round((width * MAX_IMAGE_SIZE) / height);
          height = MAX_IMAGE_SIZE;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("No se pudo procesar la imagen."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        const compressedImage = canvas.toDataURL("image/jpeg", 0.65);

        resolve(compressedImage);
      };

      image.onerror = () => {
        reject(new Error("No se pudo cargar la imagen."));
      };

      image.src = reader.result as string;
    };

    reader.onerror = () => {
      reject(new Error("No se pudo leer el archivo."));
    };

    reader.readAsDataURL(file);
  });
}

export default function PropertyImageUploader({
  onImagesChange,
}: PropertyImageUploaderProps) {
  const [images, setImages] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handleImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    setError("");

    const remainingSpaces = MAX_IMAGES - images.length;

    if (remainingSpaces <= 0) {
      setError(`Solo puedes subir un máximo de ${MAX_IMAGES} fotografías.`);
      event.target.value = "";
      return;
    }

    const selectedFiles = files.slice(0, remainingSpaces);

    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith("image/"),
    );

    if (invalidFile) {
      setError("Todos los archivos deben ser imágenes.");
      event.target.value = "";
      return;
    }

    try {
      setProcessing(true);

      const compressedImages = await Promise.all(
        selectedFiles.map((file) => compressImage(file)),
      );

      const updatedImages = [...images, ...compressedImages];

      setImages(updatedImages);
      onImagesChange(updatedImages);
    } catch {
      setError("Ocurrió un error procesando las fotografías.");
    } finally {
      setProcessing(false);
      event.target.value = "";
    }
  }

  function removeImage(index: number) {
    const updatedImages = images.filter(
      (_, imageIndex) => imageIndex !== index,
    );

    setImages(updatedImages);
    onImagesChange(updatedImages);
  }

  function makePrincipal(index: number) {
    const selectedImage = images[index];

    const updatedImages = [
      selectedImage,
      ...images.filter((_, imageIndex) => imageIndex !== index),
    ];

    setImages(updatedImages);
    onImagesChange(updatedImages);
  }

  return (
    <div>
      <label className="block">
        <span className="mb-2 block font-medium">
          Fotografías de la propiedad
        </span>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleImages}
          disabled={processing || images.length >= MAX_IMAGES}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </label>

      <p className="mt-2 text-sm text-slate-500">
        Puedes subir hasta {MAX_IMAGES} fotografías. La primera será la
        fotografía principal.
      </p>

      {processing && (
        <p className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
          Procesando fotografías...
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={`${image.slice(0, 40)}-${index}`}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="relative">
                <img
                  src={image}
                  alt={`Fotografía ${index + 1}`}
                  className="h-40 w-full object-cover"
                />

                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold text-white">
                    Principal
                  </span>
                )}
              </div>

              <div className="grid gap-2 p-3">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => makePrincipal(index)}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                  >
                    Hacer principal
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}