"use client"

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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ProductService } from "@/services/product";
import { UploadService } from "@/services/upload";
import { Loader, Plus, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import ProductDescriptionEditor from "./quill";

export function ModalCreateProduct() {

    const { toast } = useToast()

    const mainImageInputRef = useRef<HTMLInputElement>(null);
    const secondaryImageInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [mainPreview, setMainPreview] = useState<string | null>(null);
    const [secondaryPreviews, setSecondaryPreviews] = useState<string[]>([]);

    const [name, setName] = useState<string>('')
    const [price, setPrice] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [category, setCategory] = useState<string>('')
    const [color, setColor] = useState<string>('')

    const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
            return;
        }
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file hình ảnh');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setMainPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSecondaryImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        const newPreviews: string[] = [];
        Array.from(files).forEach(file => {
            // if (file.size > 5 * 1024 * 1024) {
            //     alert(`File ${file.name} quá lớn. Vui lòng chọn file nhỏ hơn 5MB.`);
            //     return;
            // }
            if (!file.type.startsWith('image/')) {
                alert(`File ${file.name} không phải là hình ảnh.`);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                if (newPreviews.length === files.length) {
                    setSecondaryPreviews(prev => [...prev, ...newPreviews]);
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
        setSecondaryPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        if (
            !mainPreview ||
            secondaryPreviews.length === 0 ||
            name === '' ||
            description === '' ||
            category === '' ||
            color === ''
        ) {
            toast({
                variant: "destructive",
                title: "Vui lòng điền đầy đủ thông tin",
            })
            return false;
        } else {
            return true
        }
    }

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsLoading(true)
        const uploadMainImage: any = await UploadService.uploadToCloudinary([mainPreview])
        const uploadSecondaryImages: any = await UploadService.uploadToCloudinary(secondaryPreviews)
        const body = {
            "name": name,
            "description": description,
            "price": price,
            "category": category,
            "color": [color],
            "sold": 0,
            "thumbnail": uploadMainImage[0]?.url || '',
            "images": uploadSecondaryImages?.map((image: any) => image.url)
        }
        await ProductService.createProduct(body)
        setIsLoading(false)
        window.location.href = '/?tab=product'
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-orange-700"
                >
                    <Plus size={16} className="mr-2" /> Thêm sản phẩm
                </button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[825px]"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>
                        <span className="!text-[20px]">Thêm sản phẩm mới</span>
                    </DialogTitle>
                    <DialogDescription>
                        <span className="!text-[16px]">Điền thông tin sản phẩm và nhấn <strong className="text-orange-700">Lưu</strong> để tạo sản phẩm mới.</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="w-full grid grid-cols-3 gap-8">
                    <div className="col-span-1">
                        <div className="mb-6">
                            <Label htmlFor="thumbnail" className="text-right !text-[16px]">
                                Hình chính
                            </Label>
                            {
                                mainPreview
                                    ?
                                    <Image
                                        src={mainPreview}
                                        alt="main-preview"
                                        className="w-full rounded-md mt-2"
                                        width={200}
                                        height={0}
                                    />
                                    :
                                    <div className="col-span-3 mt-2">
                                        <div
                                            onClick={handleUpdateMainImage}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-16 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer"
                                        >
                                            <div className="flex flex-col items-center">
                                                <span>+ Tải hình lên</span>
                                                <span className="text-xs text-gray-500">hoặc kéo thả file vào đây</span>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            ref={mainImageInputRef}
                                            onChange={handleMainImageChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>
                            }
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
                            {secondaryPreviews.map((preview, index) => (
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
                    <div className="flex flex-col justify-start items-start gap-4 col-span-2">
                        <div className="w-full grid items-center gap-4">
                            <textarea
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Tên sản phẩm"
                                className="col-span-3 p-2 border rounded"
                            >
                            </textarea>
                        </div>
                        <div className="w-full grid items-center gap-4">
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="col-span-3 p-2 border rounded"
                            >
                                <option value="">Chọn danh mục</option>
                                <option value="plastic">Plastic</option>
                                <option value="frame">Khung</option>
                                <option value="album">Album</option>
                            </select>
                        </div>
                        {/* <div className="w-full grid items-center gap-4">
                            <textarea
                                id="description"
                                rows={8}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Mô tả sản phẩm"
                                className="col-span-3 p-2 border rounded"
                            >
                            </textarea>
                        </div> */}
                        <ProductDescriptionEditor
                            value={description}
                            onChange={setDescription}
                        />
                        <div className="w-full grid items-center gap-4">
                            <input
                                id="price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="Giá"
                                className="col-span-3 p-2 border rounded"
                            >
                            </input>
                        </div>
                        <div className="w-full grid items-center gap-4">
                            <select
                                id="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="col-span-3 p-2 border rounded"
                            >
                                <option value="">Chọn màu</option>
                                <option value="white">Trắng</option>
                                <option value="black">Đen</option>
                                <option value="gold">Gold</option>
                                <option value="silver">Bạc</option>
                                <option value="wood">Gỗ</option>
                            </select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" className="!px-10 !text-[16px]">
                            Huỷ
                        </Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit} className="!px-10 !text-[16px]">
                        Lưu
                        {
                            isLoading && (
                                <Loader className="animate-spin" size={48} />
                            )
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
