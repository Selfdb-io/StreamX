import React, { useState, useRef } from 'react';
import { Upload, X, FileAudio, FileVideo, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { selfdb, getBucketId, getTableId, TABLES, BUCKETS } from '../lib/selfdb';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export const UploadModal = ({ isOpen, onClose, onUploadComplete }: UploadModalProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUpload(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      handleUpload(files);
    }
  };

  const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // Extract duration from media file using HTML5 media element
  const extractDuration = (file: File, isVideo: boolean): Promise<number> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const media = isVideo ? document.createElement('video') : document.createElement('audio');
      
      media.preload = 'metadata';
      
      media.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        const duration = Math.round(media.duration);
        resolve(isNaN(duration) ? 0 : duration);
      };
      
      media.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(0); // Fallback to 0 if extraction fails
      };
      
      media.src = url;
    });
  };

  // Generate video thumbnail from first frame
  const generateVideoThumbnail = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        // Seek to 10% of video or 2 seconds, whichever is smaller
        video.currentTime = Math.min(video.duration * 0.1, 2);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 320;
          canvas.height = 180;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
            URL.revokeObjectURL(url);
            resolve(thumbnail);
          } else {
            URL.revokeObjectURL(url);
            resolve(null);
          }
        } catch {
          URL.revokeObjectURL(url);
          resolve(null);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };

      video.src = url;
    });
  };

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    setError(null);
    
    try {
      // Get bucket and table IDs first
      const bucketId = await getBucketId(BUCKETS.MEDIA);
      const tableId = await getTableId(TABLES.MEDIA);
      
      if (!bucketId) throw new Error(`Bucket "${BUCKETS.MEDIA}" not found. Please create it first.`);
      if (!tableId) throw new Error(`Table "${TABLES.MEDIA}" not found. Please create it first.`);

      for (const file of files) {
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');

        if (!isVideo && !isAudio) {
          throw new Error(`File ${file.name} is not a supported audio or video file.`);
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        // Extract duration from media file
        const duration = await extractDuration(file, isVideo);
        console.log(`Extracted duration for ${file.name}: ${duration} seconds`);

        setUploadProgress(prev => ({ ...prev, [file.name]: 15 }));

        // Generate thumbnail for video files
        let coverData: string | null = null;
        if (isVideo) {
          coverData = await generateVideoThumbnail(file);
          console.log(`Generated thumbnail for ${file.name}: ${coverData ? 'success' : 'failed'}`);
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 25 }));

        // Convert file to ArrayBuffer for upload
        const fileData = await fileToArrayBuffer(file);

        setUploadProgress(prev => ({ ...prev, [file.name]: 40 }));

        // 1. Upload file to SelfDB Storage (directly to bucket root)
        const uploadResult = await selfdb.storage.files.upload(bucketId, {
          filename: file.name,
          data: fileData,
          contentType: file.type
        });

        console.log('Upload result:', uploadResult);
        setUploadProgress(prev => ({ ...prev, [file.name]: 75 }));

        // 2. Extract basic metadata (Title from filename)
        const title = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
        
        // 3. Create record in media table
        // Store the path returned from upload (just the filename)
        const filePath = uploadResult.path || file.name;

        // 4. Determine cover image
        // - Video: use generated thumbnail or fallback
        // - Audio: use null (fallback icon will be shown in UI)
        const cover = isVideo 
          ? (coverData || null)  // Generated thumbnail or null for fallback
          : null;  // Audio: null triggers music icon fallback in UI
        
        // Note: id is auto-generated by database (gen_random_uuid())
        await selfdb.tables.data.insert(tableId, {
          title: title,
          artist: 'Unknown Artist',
          type: isAudio ? 'audio' : 'video',
          duration: duration,  // Now stored as integer (seconds)
          cover: cover,
          url: filePath
        });

        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }
      
      onUploadComplete();
      onClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload files. Make sure SelfDB is configured correctly.');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#0a0a0b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden elevation-3 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white tracking-tight">Add Media</h2>
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all active:scale-95 group disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl transition-all cursor-pointer group
              ${isDragging 
                ? 'border-accent bg-accent/10 scale-[1.02]' 
                : 'border-white/10 hover:border-accent/50 hover:bg-white/5'}
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileInput} 
              multiple 
              className="hidden" 
              accept="audio/*,video/*"
              disabled={isUploading}
            />
            
            <div className={`
              w-16 h-16 mb-6 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isDragging ? 'bg-accent text-white shadow-xl shadow-accent/40' : 'bg-white/5 text-gray-400 group-hover:text-accent-light group-hover:bg-accent/10'}
            `}>
              <Upload className={`w-8 h-8 ${isDragging ? 'animate-bounce' : ''}`} />
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold text-white mb-1">
                {isDragging ? 'Drop to upload' : 'Drag & drop media files'}
              </p>
              <p className="text-sm text-gray-400">
                Support for MP3, WAV, MP4, MKV and more
              </p>
            </div>

            {isUploading && (
              <div className="absolute inset-0 bg-[#0a0a0b]/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
                <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
                <p className="text-white font-medium">Uploading your media...</p>
                <p className="text-sm text-gray-400 mt-1">This may take a moment</p>
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="mt-4 w-64">
                    {Object.entries(uploadProgress).map(([filename, progress]) => (
                      <div key={filename} className="mb-2">
                        <p className="text-xs text-gray-500 truncate mb-1">{filename}</p>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-8 pb-8 flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <FileAudio className="w-3.5 h-3.5" />
            <span>High Quality Audio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileVideo className="w-3.5 h-3.5" />
            <span>4K Video Support</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
            <span>Synced to SelfDB</span>
          </div>
        </div>
      </div>
    </div>
  );
};




