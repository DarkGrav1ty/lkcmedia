// Runs only in the authenticated admin browser. Originals are never drawn over or re-encoded.
export async function prepareImage(file: Blob) {
  const bitmap = await createImageBitmap(file);
  if (bitmap.width * bitmap.height > 100000000) {
    bitmap.close();
    throw new Error("Image exceeds 100 megapixels.");
  }
  const form = new FormData();
  form.set("width", String(bitmap.width));
  form.set("height", String(bitmap.height));
  try {
    for (const [name, max, watermark] of [
      ["thumbnail", 640, true],
      ["preview", 1600, true],
      ["client_preview", 1600, false],
    ] as const) {
      const ratio = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Image preparation unavailable.");
      ctx.fillStyle = "#07090d";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      if (watermark) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 12);
        ctx.font = `bold ${Math.max(18, canvas.width / 24)}px Arial`;
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,255,255,.35)";
        ctx.shadowColor = "rgba(0,0,0,.8)";
        ctx.shadowBlur = 3;
        for (
          let y = -canvas.height;
          y < canvas.height;
          y += Math.max(80, canvas.height / 4)
        )
          for (
            let x = -canvas.width;
            x <= canvas.width;
            x += Math.max(220, canvas.width / 2)
          )
            ctx.fillText("LKC MEDIA", x, y);
        ctx.restore();
      }
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) =>
            b ? resolve(b) : reject(new Error("Image preparation failed.")),
          "image/jpeg",
          0.84,
        ),
      );
      form.set(name, blob, `${name}.jpg`);
    }
  } finally {
    bitmap.close();
  }
  return form;
}
