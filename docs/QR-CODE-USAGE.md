# QR Code Usage - Updated

**Changed from:** `qrcode.react` (doesn't support React 18)  
**Changed to:** `qrcode` (pure JS, works with all React versions)

---

## Installation

```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

---

## Usage Example

Instead of:
```tsx
import QRCode from 'qrcode.react';

<QRCode value="https://notrace.co.in/secret?id=abc#key=xyz" />
```

Use:
```tsx
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export function GenerateQRCode({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    }
  }, [value]);

  return <canvas ref={canvasRef} />;
}
```

---

## Or Use as Data URL

```tsx
import QRCode from 'qrcode';

const generateQRCodeImage = async (value: string) => {
  try {
    const dataUrl = await QRCode.toDataURL(value, {
      width: 256,
      margin: 2,
    });
    return dataUrl; // Use in <img src={dataUrl} />
  } catch (err) {
    console.error('QR Code generation failed:', err);
  }
};
```

---

## Benefits

✅ Works with React 18+  
✅ No peer dependency conflicts  
✅ Smaller bundle size  
✅ Better performance  
✅ More flexible (canvas, data URL, or file)  

---

## Next Steps

1. Download updated `package.json`
2. Replace in your notrace folder
3. Run: `npm install`
4. Update any QR code components (see examples above)
5. Push to GitHub
6. Vercel will auto-deploy!

