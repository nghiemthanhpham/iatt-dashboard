/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import ProductDescriptionEditor from "./quill";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ProductService } from "@/services/product";
import { Loader, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Select from "react-select";
import { UploadService } from "@/services/upload";

export function ModalUpdateProduct({ data }: { data: any }) {
  const colorMap: { [key: string]: string } = {
    white: "#FFFFFF",
    black: "#000000",
    gold: "#FFD700",
    silver: "#C0C0C0",
    wood: "#8B5A2B",
  };

  const colorOpt = [
    { value: "white", label: "Trắng" },
    { value: "black", label: "Đen" },
    { value: "gold", label: "Gold" },
    { value: "silver", label: "Bạc" },
    { value: "wood", label: "Gỗ" },
  ];

  const customStyles = {
    option: (provided: any, state: { isFocused: boolean }) => ({
      ...provided,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: state.isFocused ? "#E5E7EB" : "white",
      color: "black",
    }),
    control: (provided: any) => ({
      ...provided,
      borderColor: "#CFCFCF",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#CFCFCF",
      },
    }),
  };

  const formatOptionLabel = ({
    value,
    label,
  }: {
    value: string;
    label: string;
  }) => (
    <div className="flex items-center gap-2">
      <span
        className="w-4 h-4 rounded-full border border-gray-300"
        style={{ backgroundColor: colorMap[value] }}
      ></span>
      {label}
    </div>
  );

  const selectedColors = colorOpt.filter((color) =>
    data?.color?.includes(color.value)
  );

  const { toast } = useToast();

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const secondaryImageInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingForDelete, setIsLoadingForDelete] = useState<boolean>(false);

  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [secondaryPreviews, setSecondaryPreviews] = useState<string[]>([]);

  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [introduction, setIntroduction] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [color, setColor] = useState<string[]>(data?.color ?? []);

  const handleMainImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File quá lớn. Vui lòng chọn file nhỏ hơn 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSecondaryImagesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const newPreviews: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} quá lớn. Vui lòng chọn file nhỏ hơn 5MB.`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert(`File ${file.name} không phải là hình ảnh.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setSecondaryPreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateMainImage = () => {
    mainImageInputRef.current?.click();
  };

  const handleUpdateSecondaryImages = () => {
    secondaryImageInputRef.current?.click();
  };

  const handleRemoveSecondaryImage = (index: number) => {
    setSecondaryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleColorChange = (selectedOptions: any) => {
    const selectedValues = selectedOptions.map((option: any) => option.value);
    setColor(selectedValues);
  };

  const validateForm = () => {
    if (!mainPreview) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn ảnh chính.",
      });
      return false;
    }

    if (secondaryPreviews.length === 0) {
      toast({
        variant: "destructive",
        title: "Vui lòng thêm ít nhất một ảnh phụ.",
      });
      return false;
    }

    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập tên.",
      });
      return false;
    }

    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập mô tả.",
      });
      return false;
    }

    if (!introduction.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập phần giới thiệu.",
      });
      return false;
    }

    if (!category.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn danh mục.",
      });
      return false;
    }

    if (!color) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn màu sắc.",
      });
      return false;
    }

    return true;
  };

  const handleImageUpload = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadResponse = await UploadService.uploadToCloudinary([file]);
      if (
        uploadResponse &&
        Array.isArray(uploadResponse) &&
        uploadResponse[0]
      ) {
        return uploadResponse[0]?.secure_url;
      } else {
        console.error("Upload failed or response is not as expected");
        return "";
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      return "";
    }
  }, []);

  const extractBase64Images = (htmlContent: string) => {
    const imgTagRegex =
      /<img[^>]+src=["'](data:image\/[^;]+;base64[^"']+)["'][^>]*>/g;
    const matches = [...htmlContent.matchAll(imgTagRegex)];
    return matches.map((match) => match[1]);
  };

  const replaceBase64WithCloudUrls = async (
    htmlContent: string,
    uploadFunc: (file: File) => Promise<string>
  ) => {
    const imgTagRegex =
      /<img[^>]+src=["'](data:image\/[^;]+;base64[^"']+)["'][^>]*>/g;
    let updatedContent = htmlContent;

    const matches = [...htmlContent.matchAll(imgTagRegex)];
    for (const match of matches) {
      const base64String = match[1];
      const file = base64ToFile(base64String);
      const uploadedUrl = await uploadFunc(file);
      updatedContent = updatedContent.replace(base64String, uploadedUrl);
    }

    return updatedContent;
  };

  const base64ToFile = (base64String: string): File => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], "image.png", { type: mime });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    const updatedDescription = await replaceBase64WithCloudUrls(
      description,
      handleImageUpload
    );
    const updatedIntroduction = await replaceBase64WithCloudUrls(
      introduction,
      handleImageUpload
    );

    const body = {
      name: name,
      description: updatedDescription,
      introduction: updatedIntroduction,
      price: price,
      category: category,
      color: color,
      thumbnail: mainPreview,
      images: secondaryPreviews,
    };
    await ProductService.updateProduct(data?._id, body);
    setIsLoading(false);
    window.location.href = "/?tab=product";
  };

  const handleDelete = async () => {
    setIsLoadingForDelete(true);
    await ProductService.deleteProduct(data?._id);
    setIsLoadingForDelete(false);
    window.location.href = "/?tab=product";
  };

  const updateDOM = () => {
    if (data) {
      setName(data?.name);
      setPrice(data?.price);
      setCategory(data?.category);
      setColor(data?.color);
      setDescription(data?.description);
      setIntroduction(data?.introduction);
      setMainPreview(data?.thumbnail);
      setSecondaryPreviews(data?.images);
    }
  };

  useEffect(() => {
    console.log("check cate: " + data?.category);
  }, [data]);

  return (
    <Dialog>
      <DialogTrigger asChild onClick={updateDOM}>
        <Button variant="outline">Chỉnh sửa</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px] h-screen"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Chỉnh sửa sản phẩm</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Chỉnh sửa thông tin sản phẩm và nhấn{" "}
              <strong className="text-orange-700">Cập nhật</strong> để lưu thông
              tin.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-3 gap-8">
          <div className="col-span-1">
            <div className="overflow-y-auto max-h-[80vh] scroll-bar-style">
              <div className="mb-6">
                <Label htmlFor="thumbnail" className="text-right !text-[16px]">
                  Hình chính
                </Label>
                <div className="mt-2">
                  {!mainPreview && (
                    <div
                      onClick={handleUpdateMainImage}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-16 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer"
                    >
                      <div className="flex flex-col items-center">
                        <span>+ Tải hình lên</span>
                        <span className="text-xs text-gray-500">
                          hoặc kéo thả file vào đây
                        </span>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={mainImageInputRef}
                    onChange={handleMainImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {mainPreview && (
                    <div className="mt-2">
                      <Image
                        src={mainPreview}
                        alt="main-preview"
                        className="w-full rounded-md mt-2"
                        width={1000}
                        height={1000}
                      />
                      <div
                        onClick={handleUpdateMainImage}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-3 mt-5 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer"
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-500">
                            Thay đổi hình ảnh
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Label htmlFor="images" className="text-right !text-[16px]">
                Hình phụ
              </Label>
              <div className="col-span-3 mt-2">
                <div
                  onClick={handleUpdateSecondaryImages}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer"
                >
                  <div className="flex flex-col items-center">
                    <span>+ Tải lên</span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={secondaryImageInputRef}
                  onChange={handleSecondaryImagesChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {secondaryPreviews?.map((preview: any, index: any) => (
                  <div key={index} className="relative">
                    <Image
                      src={preview}
                      alt={`secondary-preview-${index}`}
                      className="rounded-sm"
                      width={100}
                      height={100}
                    />
                    <button
                      onClick={() => handleRemoveSecondaryImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full text-xs"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <div className="flex flex-col justify-start items-start gap-2 overflow-y-auto max-h-[80vh] pr-4 scroll-bar-style">
              <Label htmlFor="description" className="text-[14.5px]">
                Tên sản phẩm
              </Label>
              <div className="w-full grid items-center gap-4">
                <textarea
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên sản phẩm"
                  className="col-span-3 p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                ></textarea>
              </div>
              <Label htmlFor="description" className="text-[14.5px] mt-2">
                Chọn danh mục
              </Label>
              <div className="w-full grid items-center gap-4">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                  }}
                  className="col-span-3 p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                >
                  <option value="">Chọn danh mục</option>
                  <option value="Plastic">Plastic</option>
                  <option value="Frame">Khung ảnh</option>
                  <option value="Album">Album</option>
                </select>
              </div>
              <Label htmlFor="description" className="text-[14.5px] mt-2">
                Giá sản phẩm
              </Label>
              <div className="w-full grid items-center gap-4">
                <input
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Giá"
                  className="col-span-3 p-2 border rounded border-[#CFCFCF] placeholder-custom focus:border-gray-500"
                ></input>
              </div>
              <Label htmlFor="description" className="text-[14.5px] mt-2">
                Chọn màu sắc
              </Label>
              <div className="w-full grid items-center gap-4">
                <Select
                  className="pl-[0.5px]"
                  options={colorOpt}
                  value={colorOpt.filter((colorOptItem) =>
                    color.includes(colorOptItem.value)
                  )}
                  isMulti={true}
                  placeholder="Chọn màu"
                  onChange={handleColorChange}
                  styles={customStyles}
                  formatOptionLabel={formatOptionLabel}
                />
              </div>
              <div className="w-full mt-2">
                <ProductDescriptionEditor
                  value={description}
                  onChange={setDescription}
                  title="Mô tả sản phẩm"
                />
              </div>
              <div className="w-full mt-2">
                <ProductDescriptionEditor
                  value={introduction}
                  onChange={setIntroduction}
                  title="Giới thiệu sản phẩm"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="w-full !flex !flex-row !justify-between !items-center">
          <Button
            onClick={handleDelete}
            type="submit"
            className="!px-8 !text-[16px] bg-orange-700 hover:bg-orange-800"
          >
            <Trash2 />
            Xoá
            {isLoadingForDelete && (
              <Loader className="animate-spin" size={48} />
            )}
          </Button>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="!px-10 !text-[16px]"
              >
                Huỷ
              </Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="!px-10 !text-[16px]"
            >
              Cập nhật
              {isLoading && <Loader className="animate-spin" size={48} />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
