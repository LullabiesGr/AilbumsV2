import React, { useState } from 'react';
import { ArrowLeft, Copy, Download, RotateCcw, Eye, EyeOff, Check, Palette, ArrowLeftRight } from 'lucide-react';
import { Photo, ColorTransferResult } from '../types';
import { usePhoto } from '../context/PhotoContext';
import { useToast } from '../context/ToastContext';
import { ImageComparison, ImageComparisonImage, ImageComparisonSlider } from './ui/ImageComparison';

/* =========================
   Config & Helper utilities
   ========================= */
const API_URL: string =
  (import.meta as any)?.env?.VITE_API_URL || 'https://b455dac5621c.ngrok-free.app';

const cleanName = (n: string) =>
  n.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_').replace(/^_+|_+$/g, '');

const guessByExt = (name: string) => {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'tif' || ext === 'tiff') return 'image/tiff';
  return 'image/jpeg';
};

// Photo που μπορεί να έχει info άλμπουμ (όπως πριν)
type PhotoWithAlbum = Photo & {
  album?: string;      // π.χ. "lullabiesgr@gmail.com/reyb"
  album_path?: string; // ίδιο νόημα με άλλο όνομα
};

// Φτιάχνει URL backend για /album-photo
const buildAlbumUrl = (p: PhotoWithAlbum) => {
  const dir = p.album || p.album_path;
  if (!dir) return '';
  return `${API_URL}/album-photo?album_dir=${encodeURIComponent(dir)}&filename=${encodeURIComponent(p.filename)}`;
};

/** Κάνει fetch εικόνα -> Blob -> File (μόνο αν είναι image/*) */
async function urlToFile(url: string, filename: string): Promise<File> {
  const needsNgrokHeader = url.startsWith(API_URL);
  const res = await fetch(url, {
    mode: 'cors',
    headers: needsNgrokHeader ? { 'ngrok-skip-browser-warning': 'true' } : undefined,
  });
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`);

  const ct = (res.headers.get('content-type') || '').toLowerCase();
  const blob = await res.blob();
  const isImage = ct.startsWith('image/') || (blob.type && blob.type.startsWith('image/'));
  if (!isImage) throw new Error(`Not an image response (content-type: ${ct || blob.type || 'unknown'})`);

  const type = blob.type || guessByExt(filename);
  return new File([blob], cleanName(filename || 'image.jpg'), { type });
}

/** Παίρνει ΣΙΓΟΥΡΑ σωστό File από Photo:
 *  1) αν υπάρχει p.file με bytes -> το “φρεσκάρει”
 *  2) αλλιώς από p.url
 *  3) αλλιώς fallback στο /album-photo
 */
async function fileFromPhoto(p: PhotoWithAlbum): Promise<File> {
  // 1) ήδη File;
  if (p.file && p.file.size > 0) {
    const type = p.file.type && p.file.type !== 'application/octet-stream'
      ? p.file.type
      : guessByExt(p.filename);
    const buf = await p.file.arrayBuffer(); // fresh body
    return new File([buf], cleanName(p.filename), { type });
  }

  // 2) δοκίμασε από url
  if (p.url) {
    try {
      return await urlToFile(p.url, p.filename);
    } catch {
      /* πάμε fallback */
    }
  }

  // 3) fallback: backend /album-photo
  const fallback = buildAlbumUrl(p);
  if (!fallback) {
    throw new Error('Missing album info (album/album_path) for ' + p.filename);
  }
  return await urlToFile(fallback, p.filename);
}

interface CopyLookModeProps {
  onBack: () => void;
}

const CopyLookMode: React.FC<CopyLookModeProps> = ({ onBack }) => {
  const { photos } = usePhoto();
  const { showToast } = useToast();

  const [referencePhoto, setReferencePhoto] = useState<Photo | null>(null);
  const [targetPhotos, setTargetPhotos] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ColorTransferResult[]>([]);
  const [viewMode, setViewMode] = useState<Map<string, 'before' | 'after' | 'comparison'>>(new Map());

  const handleReferenceSelect = (photo: Photo) => {
    setReferencePhoto(photo);
    const newTargets = new Set(targetPhotos);
    newTargets.delete(photo.id);
    setTargetPhotos(newTargets);
  };

  const handleTargetToggle = (photo: Photo) => {
    if (referencePhoto?.id === photo.id) return;
    const next = new Set(targetPhotos);
    next.has(photo.id) ? next.delete(photo.id) : next.add(photo.id);
    setTargetPhotos(next);
  };

  const handleApplyCopyLook = async () => {
    if (!referencePhoto || targetPhotos.size === 0) {
      showToast('Please select a reference photo and target photos', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const targetPhotoObjects = photos.filter(p => targetPhotos.has(p.id));
      const outResults: { filename: string; image_base64: string }[] = [];

      console.log('Starting LUT & Apply:', {
        reference: referencePhoto.filename,
        targets: targetPhotoObjects.map(p => p.filename),
      });

      // 1) ετοίμασε ΜΙΑ φορά το reference
      const referenceFixed = await fileFromPhoto(referencePhoto as PhotoWithAlbum);

      // 2) για κάθε target: φτιάχνεις σωστά File(s) και POST
      for (const target of targetPhotoObjects) {
        const sourceFixed = await fileFromPhoto(target as PhotoWithAlbum);

        // apply_on: νέο File από το ίδιο buffer (να μην είναι consumed)
        const applyOnFixed = new File(
          [await sourceFixed.arrayBuffer()],
          cleanName(sourceFixed.name),
          { type: sourceFixed.type }
        );

        const fd = new FormData();
        fd.append('reference', referenceFixed, referenceFixed.name);
        fd.append('source',    sourceFixed,    sourceFixed.name);
        fd.append('apply_on',  applyOnFixed,   applyOnFixed.name);
        fd.append('strength',  '0.5');

        const resp = await fetch(`${API_URL}/lut_and_apply/`, {
          method: 'POST',
          body: fd,
          headers: { 'ngrok-skip-browser-warning': 'true' },
          mode: 'cors',
        });

        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`LUT and Apply failed for ${target.filename}: ${resp.status} ${errText || resp.statusText}`);
        }

        const data = await resp.json();

        // Αν γύρισε μόνο path, φέρε την εικόνα και κάν’ τη base64 για το UI
        let image_base64: string | undefined = data.result_image_base64;
        if (!image_base64 && data.result_image_file) {
          try {
            const imgResp = await fetch(`${API_URL}/${data.result_image_file}`, {
              headers: { 'ngrok-skip-browser-warning': 'true' },
              mode: 'cors',
            });
            if (imgResp.ok) {
              const blob = await imgResp.blob();
              const b64 = await new Promise<string>((resolve, reject) => {
                const r = new FileReader();
                r.onload = () => resolve(String(r.result));
                r.onerror = reject;
                r.readAsDataURL(blob);
              });
              image_base64 = b64.split(',')[1];
            }
          } catch (e) {
            console.warn('Could not fetch result image:', e);
          }
        }

        outResults.push({
          filename: target.filename,
          image_base64: image_base64 || '',
        });
      }

      setResults(outResults);
      showToast(`Color transfer completed for ${outResults.length} photos!`, 'success');
    } catch (err: any) {
      console.error('CopyLook error detail:', err);
      showToast(err?.message || 'Color transfer failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (result: ColorTransferResult) => {
    if (!result) return;
    try {
      const byteCharacters = atob(result.image_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `copy_look_${result.filename}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Photo downloaded!', 'success');
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Failed to download photo', 'error');
    }
  };

  const handleReset = () => {
    setReferencePhoto(null);
    setTargetPhotos(new Set());
    setResults([]);
    setViewMode(new Map());
  };

  const toggleViewMode = (filename: string) => {
    const m = new Map(viewMode);
    const cur = m.get(filename) || 'after';
    const next = cur === 'after' ? 'before' : cur === 'before' ? 'comparison' : 'after';
    m.set(filename, next);
    setViewMode(m);
  };

  const canApply = referencePhoto && targetPhotos.size > 0 && !isProcessing;

  /* ===== UI ===== */
  return (
    <div className="space-y-6">
      {/* ... ΟΛΟ το UI ΣΟΥ όπως ήταν (δεν το αλλάζω) ... */}
      {/* Για συντομία το παραλείπω εδώ – κράτα το UI block που ήδη έχεις */}
    </div>
  );
};

export default CopyLookMode;
