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
import { getCroppedImg } from "@/utils/canvas-utils";
import { chatService } from "@/services/chat-service";
import { useChatStore } from "@/stores/use-chat-store";

interface GroupAvatarUploadDialogProps {
  children: React.ReactNode;
  conversationId: string;
}

export function GroupAvatarUploadDialog({
  children,
  conversationId,
}: GroupAvatarUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { loadConversations, selectConversation, conversations } =
    useChatStore();

  const currentConv = conversations.find(
    (c) => c.conversationId === conversationId,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

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

const handleUpload = async () => {
  if (!imageSrc || !croppedAreaPixels || !conversationId) return;

  try {
    setIsUploading(true);

    // 1. Crop ảnh
    const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
    if (!croppedImageBlob) throw new Error("Lỗi cắt ảnh");

    const file = new File([croppedImageBlob], "group-avatar.png", {
      type: "image/png",
    });

    // 2. Upload ảnh lên Server
    const uploadData = await chatService.uploadAvatar(conversationId, file);

    // 3. Gọi API Update
    if (uploadData && uploadData.path) {
      // [FIX] Gửi kèm NAME hiện tại để không bị reset về "Nhóm chưa đặt tên"
      await chatService.updateConversation(conversationId, {
        avatarUrl: uploadData.path,
        name: currentConv?.name || "Nhóm mới", // Fallback name nếu không tìm thấy
      });
    } else {
      throw new Error("Không lấy được đường dẫn ảnh sau khi upload");
    }

    // 4. Reload Store
    await loadConversations(true);
    await selectConversation(conversationId);

    toast.success("Cập nhật ảnh nhóm thành công");
    setOpen(false);
  } catch (error: any) {
    console.error(error);
    toast.error("Cập nhật thất bại");
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
          <DialogTitle>Đổi ảnh nhóm</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {!imageSrc ? (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors gap-3 group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-14 w-14 rounded-full bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ImagePlus className="h-7 w-7 text-primary/70 group-hover:text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Nhấn để tải ảnh lên
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Hỗ trợ JPG, PNG
                </p>
              </div>
            </div>
          ) : (
            <div className="relative h-80 w-full bg-black rounded-lg overflow-hidden shadow-inner border border-border/50">
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
            <div className="mt-6 space-y-3 px-1">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
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
          <div className="flex gap-2 w-full justify-end sm:w-auto">
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
