export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  quality = 0.8,
  maxWidth = 800 // Compress to max 800px width/height
): Promise<File | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Calculate bounding box of the rotated image
  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = {
    width: Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height),
    height: Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height),
  };

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using default canvas size to allow rendering
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // set canvas width to final desired crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0);

  // Scale down if necessary to compress
  if (canvas.width > maxWidth || canvas.height > maxWidth) {
    const scale = maxWidth / Math.max(canvas.width, canvas.height);
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = canvas.width * scale;
    scaledCanvas.height = canvas.height * scale;
    const scaledCtx = scaledCanvas.getContext('2d');
    if (scaledCtx) {
      // Draw from main canvas to scaled canvas
      scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
      
      // As a blob
      return new Promise((resolve, reject) => {
        scaledCanvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], 'product.webp', { type: 'image/webp' }));
          else reject(new Error('Canvas is empty'));
        }, 'image/webp', quality);
      });
    }
  }

  // As a blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(new File([blob], 'product.webp', { type: 'image/webp' }));
      else reject(new Error('Canvas is empty'));
    }, 'image/webp', quality);
  });
}
