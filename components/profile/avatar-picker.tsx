"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import Cropper, { Area } from "react-easy-crop";
import { useTranslations } from "next-intl"; // ✅ Import hook i18n
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCroppedImg } from "@/utils/canvas-utils";
import { getFullImageUrl } from "@/utils/image-utils";

interface AvatarPickerProps {
  onImageCropped: (blob: Blob | null) => void;
  initialImage?: string | null;
}

export function AvatarPicker({
  onImageCropped,
  initialImage,
}: AvatarPickerProps) {
  const t = useTranslations("Common.avatar_picker");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    getFullImageUrl(initialImage) || null
  );

  const [isCropOpen, setIsCropOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(getFullImageUrl(initialImage));
  }, [initialImage]);

  // 1. choose image
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setTempImageSrc(reader.result as string);
        setIsCropOpen(true);
      });
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  // 2. crop
  const handleCropConfirm = async () => {
    if (!tempImageSrc || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(tempImageSrc, croppedAreaPixels);
      if (croppedBlob) {
        const objectUrl = URL.createObjectURL(croppedBlob);
        setPreviewUrl(objectUrl);
        onImageCropped(croppedBlob);
        setIsCropOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. remove image
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onImageCropped(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Vùng hiển thị Avatar */}
      <div
        className="relative group cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar className="h-24 w-24 border-2 border-dashed border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 transition-colors">
          <AvatarImage src={previewUrl || undefined} className="object-cover" />
          <AvatarFallback className="bg-transparent">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Camera className="h-6 w-6 mb-1" />
              <span className="text-[10px]">{t("upload_text")}</span>{" "}
            </div>
          </AvatarFallback>
        </Avatar>

        {/* Nút xóa ảnh */}
        {previewUrl && (
          <div
            className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-1 cursor-pointer hover:bg-destructive/90 z-10"
            onClick={handleRemoveImage}
            title={t("remove_tooltip")} 
          >
            <X className="h-3 w-3" />
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Dialog Cắt ảnh */}
      <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("edit_dialog_title")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="relative h-80 w-full bg-black rounded-lg overflow-hidden">
              <Cropper
                image={tempImageSrc || ""}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                onZoomChange={setZoom}
                cropShape="round"
              />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("zoom_out")}</span>
                <span>{t("zoom_in")}</span>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(val) => setZoom(val[0])}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCropOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleCropConfirm}>{t("confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
