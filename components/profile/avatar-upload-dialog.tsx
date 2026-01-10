/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, ChangeEvent } from "react";
import Cropper, { Area } from "react-easy-crop";
import { useTranslations } from "next-intl"; // ✅ Import hook
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
import { employeeService } from "@/services/employee-service";
import { UpdateEmployeeBody } from "@/lib/validations/employee";
import { useAuthStore } from "@/stores/auth-store";
import { getFullImageUrl } from "@/utils/image-utils";

export function AvatarUploadDialog({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentAvatarUrl,
}: {
  children: React.ReactNode;
  currentAvatarUrl?: string;
}) {
  const t = useTranslations("Profile.avatar_dialog");
  const { user, setUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
    if (!imageSrc || !croppedAreaPixels || !user) return;

    try {
      setIsUploading(true);

      // 1. crop
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) throw new Error(t("crop_error"));
      const file = new File([croppedImageBlob], "avatar.png", {
        type: "image/png",
      });

      // 2. upload
      const uploadData = await employeeService.uploadAvatar(file);

      // 3. prepare payload
      const updatePayload: UpdateEmployeeBody = {
        clientId: user.clientId,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        systemRole: user.systemRole,
        salary: user.salary,
        imageUrl: uploadData.path,
      };

      // 4. call api update
      await employeeService.updateEmployee(user.clientId, updatePayload);

      const constructedUrl = getFullImageUrl(uploadData.path);

      setUser({ ...user, imageUrl: constructedUrl });

      toast.success(t("success"));
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || t("error");
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
          <DialogTitle>{t("title")}</DialogTitle>
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
                  {t("click_to_upload")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("helper_text")}
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
                <span>{t("zoom_out")}</span>
                <span>{t("zoom_in")}</span>
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
              {t("change_image")}
            </Button>
          )}
          <div className="flex gap-2 w-full justify-end sm:w-auto">
            <DialogClose asChild>
              <Button variant="ghost" type="button" disabled={isUploading}>
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button onClick={handleUpload} disabled={!imageSrc || isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
