"use client";

import { useState, useRef, ChangeEvent } from "react";
import Cropper, { Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Camera, ImagePlus, Loader2 } from "lucide-react";
import { getCroppedImg } from "@/lib/canvas-utils"
import { toast } from "sonner";
// import { employeeService } from "@/services/employeeService"; // Import service upload của bạn

export function AvatarUploadDialog({
  children,
  currentAvatarUrl,
}: {
  children: React.ReactNode;
  currentAvatarUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý khi chọn file từ máy tính
  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
    }
  };

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  // Lưu lại tọa độ khi người dùng crop
  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Xử lý Upload
  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      // 1. Cắt ảnh thành Blob
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

      if (!croppedImageBlob) throw new Error("Could not crop image");

      // 2. Tạo FormData để gửi lên Server
      const formData = new FormData();
      // Đặt tên file là avatar.jpg
      const file = new File([croppedImageBlob], "avatar.jpg", {
        type: "image/jpeg",
      });
      formData.append("file", file);

      // 3. Gọi API (Ví dụ)
      // await employeeService.uploadAvatar(formData);

      // Giả lập API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Cập nhật ảnh đại diện thành công!");
      setOpen(false);
      setImageSrc(null); // Reset

      // Reload lại trang hoặc invalidate query để load ảnh mới
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi upload ảnh.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetDialog = () => {
    setImageSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetDialog();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cập nhật ảnh đại diện</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {!imageSrc ? (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors gap-3"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ImagePlus className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Nhấn để chọn ảnh
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, GIF tối đa 5MB
                </p>
              </div>
            </div>
          ) : (
            <div className="relative h-80 w-full bg-black rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} // Tỉ lệ 1:1 cho avatar
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round" // Hình tròn cho avatar
                showGrid={false}
              />
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            accept="image/*"
            className="hidden"
          />

          {imageSrc && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Thu nhỏ</span>
                <span>Phóng to</span>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                className="w-full"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {imageSrc && (
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Chọn ảnh khác
            </Button>
          )}
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="ghost" type="button">
                Hủy
              </Button>
            </DialogClose>
            <Button onClick={handleUpload} disabled={!imageSrc || isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
