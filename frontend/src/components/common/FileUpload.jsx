/**
 * FileUpload Component
 * Drag-and-drop file upload zone with preview.
 */
import { useState, useRef } from 'react';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';

export default function FileUpload({ onFileSelect, accept = '.pdf,.mp3,.wav,.ogg' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFile = (file) => {
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div>
      {!selectedFile ? (
        <div
          className="relative rounded-2xl p-8 text-center cursor-pointer transition-all duration-300"
          style={{
            border: `2px dashed ${isDragging ? '#3384ff' : 'rgba(51, 132, 255, 0.2)'}`,
            background: isDragging ? 'rgba(51, 132, 255, 0.05)' : 'rgba(15, 23, 42, 0.4)',
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          id="file-upload-zone"
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />
          <FiUploadCloud
            className="mx-auto mb-3"
            size={36}
            style={{ color: isDragging ? '#3384ff' : '#64748b' }}
          />
          <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>
            <span style={{ color: '#3384ff' }}>Click to upload</span> or drag and drop
          </p>
          <p className="text-xs mt-1" style={{ color: '#475569' }}>
            PDF, MP3, WAV, OGG (max 10MB)
          </p>
        </div>
      ) : (
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{
            background: 'rgba(51, 132, 255, 0.08)',
            border: '1px solid rgba(51, 132, 255, 0.2)',
          }}
        >
          <FiFile size={20} style={{ color: '#3384ff' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#e2e8f0' }}>
              {selectedFile.name}
            </p>
            <p className="text-xs" style={{ color: '#64748b' }}>
              {formatSize(selectedFile.size)}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleRemove(); }}
            className="p-1.5 rounded-lg bg-transparent border-none cursor-pointer transition-colors duration-200"
            style={{ color: '#64748b' }}
            onMouseEnter={(e) => e.target.style.color = '#ef4444'}
            onMouseLeave={(e) => e.target.style.color = '#64748b'}
            id="remove-file-button"
          >
            <FiX size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
