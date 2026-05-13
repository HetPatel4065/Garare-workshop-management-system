import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, Save, RotateCw, ZoomIn, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getCroppedImgBlob } from "../../utils/cropImage";

const LogoCropperModal = ({ isOpen, image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onRotationChange = (rotation) => {
    setRotation(rotation);
  };

  const onCropCompleteInternal = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const croppedImageBlob = await getCroppedImgBlob(
        image,
        croppedAreaPixels,
        rotation
      );
      onCropComplete(croppedImageBlob);
    } catch (e) {
      console.error("Crop Error:", e);
      alert("Failed to crop image. This usually happens if the image server doesn't allow cross-origin access.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-2xl rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[98vh] md:max-h-[90vh]"
        >
          <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900">Crop Logo</h3>
              <p className="text-xs md:text-sm text-slate-500">Adjust your logo for the best appearance</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative flex-1 bg-slate-50 min-h-62.5 md:min-h-87.5">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteInternal}
              onZoomChange={onZoomChange}
              onRotationChange={onRotationChange}
              cropShape="square"
              showGrid={true}
            />
          </div>

          <div className="p-4 md:p-8 bg-white space-y-4 md:space-y-6 shrink-0 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><ZoomIn size={14}/> Zoom</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 md:h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><RotateCw size={14}/> Rotation</span>
                  <span>{rotation}°</span>
                </div>
                <input
                  type="range"
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  aria-labelledby="Rotation"
                  onChange={(e) => onRotationChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 md:h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-2 md:pt-0">
              <button
                onClick={onCancel}
                className="order-2 md:order-1 px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="order-1 md:order-2 flex-1 flex items-center justify-center gap-2 px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {isProcessing ? "Saving..." : "Save & Apply"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LogoCropperModal;
