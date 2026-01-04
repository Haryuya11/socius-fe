/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getCroppedImg } from "@/lib/canvas-utils";
import { employeeService } from "@/services/employee-service";
import { UpdateEmployeeBody } from "@/lib/validations/employee";
import { useAuthStore } from "@/stores/auth-store";
import { getFullImageUrl } from "@/utils/image-utils";

export function AvatarUploadDialog({
  children,
  currentAvatarUrl,
}: {
  children: React.ReactNode;
  currentAvatarUrl?: string;
}) {
  const { user, setUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ... (Các hàm onFileChange, readFile, onCropComplete GIỮ NGUYÊN như cũ)
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

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const resetDialog = () => {
    setImageSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  // --- HÀM UPLOAD ĐƯỢC CẬP NHẬT ---
  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels || !user) return;

    try {
      setIsUploading(true);

      // 1. Cắt ảnh
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) throw new Error("Could not crop image");
      const file = new File([croppedImageBlob], "avatar.png", {
        type: "image/png",
      });

      // 2. Upload lấy Path
      const uploadData = await employeeService.uploadAvatar(file);

      // 3. Chuẩn bị data update với Type an toàn
      const updatePayload: UpdateEmployeeBody = {
        clientId: user.clientId, // Body yêu cầu clientId
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        systemRole: user.systemRole, // Type SystemRole khớp với Enum
        salary: user.salary,
        imageUrl: uploadData.path, // Path ảnh mới từ server
      };

      // 4. Gọi API Update
      await employeeService.updateEmployee(user.clientId, updatePayload);

      const constructedUrl = getFullImageUrl(uploadData.path);

      setUser({ ...user, imageUrl: constructedUrl });

      toast.success("Cập nhật ảnh đại diện thành công!");
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || "Có lỗi xảy ra.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
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
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
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
              disabled={isUploading}
            >
              Chọn ảnh khác
            </Button>
          )}
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="ghost" type="button" disabled={isUploading}>
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
