"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Plus,
  Trash2,
  Check,
  Loader2,
  ImageIcon,
  Sparkles,
  Palette,
  Layers,
  HelpCircle,
} from "lucide-react";
import { Product, ProductColor } from "@/lib/data/products";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSave: (product: Product, isNew: boolean) => Promise<void> | void;
}

const CATEGORIES = ["MEN", "WOMEN", "ACCESSORIES", "NEW ARRIVALS"] as const;
const GENDERS = ["Men", "Women", "Unisex"] as const;
const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

export function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
  onSave,
}: ProductFormModalProps) {
  const isEditing = Boolean(productToEdit);
  const [activeSubTab, setActiveSubTab] = useState<"general" | "media" | "specs">("general");

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState<"MEN" | "WOMEN" | "ACCESSORIES" | "NEW ARRIVALS">("MEN");
  const [gender, setGender] = useState<"Men" | "Women" | "Unisex">("Unisex");
  const [price, setPrice] = useState<number>(195);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [stockCount, setStockCount] = useState<number>(15);
  const [inStock, setInStock] = useState<boolean>(true);

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadFeedback, setUploadFeedback] = useState<{ provider: string; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Colors state
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#111111");
  const [newColorImage, setNewColorImage] = useState("");

  // Sizes state
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [customSizeInput, setCustomSizeInput] = useState("");

  // Details & Descriptions
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState<string[]>([
    "Precision architectural silhouette with clean lines",
    "Technical double-weave bonded canvas fabrication",
  ]);
  const [newDetailInput, setNewDetailInput] = useState("");
  const [shippingInfo, setShippingInfo] = useState("Complimentary global express shipping. 2-4 business days.");
  const [careInstructions, setCareInstructions] = useState("Specialist dry clean only. Cool iron under cloth.");

  // Badges
  const [isNew, setIsNew] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Populate form if editing
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSlug(productToEdit.slug);
      setSubtitle(productToEdit.subtitle || "");
      setCategory(productToEdit.category);
      setGender(productToEdit.gender || "Unisex");
      setPrice(productToEdit.price);
      setOriginalPrice(productToEdit.originalPrice);
      setStockCount(productToEdit.stockCount);
      setInStock(productToEdit.inStock);
      setImages(productToEdit.images || []);
      setColors(
        productToEdit.colors && productToEdit.colors.length > 0
          ? productToEdit.colors
          : [{ name: "Noir Black", hex: "#111111", image: productToEdit.images?.[0] || "" }]
      );
      setSizes(productToEdit.sizes || ["S", "M", "L", "XL"]);
      setDescription(productToEdit.description);
      setDetails(productToEdit.details || []);
      setShippingInfo(productToEdit.shippingInfo || "Complimentary global shipping.");
      setCareInstructions(productToEdit.careInstructions || "Specialist dry clean only.");
      setIsNew(productToEdit.isNew ?? true);
      setIsBestSeller(productToEdit.isBestSeller ?? false);
      setIsFeatured(productToEdit.isFeatured ?? false);
    } else {
      // Defaults for brand new product
      setName("");
      setSlug("");
      setSubtitle("Sculpted for movement & architectural presence.");
      setCategory("MEN");
      setGender("Unisex");
      setPrice(195);
      setOriginalPrice(undefined);
      setStockCount(15);
      setInStock(true);
      setImages([
        "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1200&auto=format&fit=crop",
      ]);
      setColors([
        {
          name: "Noir Black",
          hex: "#111111",
          image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1200&auto=format&fit=crop",
        },
      ]);
      setSizes(["S", "M", "L", "XL"]);
      setDescription(
        "An architectural atelier silhouette crafted from bonded technical wool. Tailored with ergonomic articulation, concealed hardware, and clean aesthetic lines."
      );
      setDetails([
        "Engineered technical fabrication with weather-resistant finishing",
        "Concealed RiRi dual-direction matte hardware",
        "Hand-finished in our atelier",
      ]);
      setShippingInfo("Complimentary global express shipping on all orders. 2-4 business days.");
      setCareInstructions("Specialist dry clean only. Store on shaped wooden hanger.");
      setIsNew(true);
      setIsBestSeller(false);
      setIsFeatured(false);
    }
    setActiveSubTab("general");
    setFormError("");
    setUploadError("");
  }, [productToEdit, isOpen]);

  // Auto-generate slug as user types name if slug is empty or matches previous slug
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing || !slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  // Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      const uploadedUrl = data.url;
      setImages((prev) => [...prev, uploadedUrl]);

      if (data.provider === "cloudinary") {
        setUploadFeedback({
          provider: "cloudinary",
          message: "Uploaded to Cloudinary CDN successfully",
        });
      } else {
        setUploadFeedback({
          provider: "local",
          message: "Saved to local storage. (Configure Cloudinary in .env.local to host on Cloudinary CDN)",
        });
      }

      // If colors has 1 color and no image, update color's image
      if (colors.length === 1 && !colors[0].image) {
        setColors([{ ...colors[0], image: uploadedUrl }]);
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Add Image via URL input
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  // Remove Image
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Add Colorway
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const colorToAdd: ProductColor = {
      name: newColorName.trim(),
      hex: newColorHex,
      image: newColorImage.trim() || images[0] || "",
    };
    setColors((prev) => [...prev, colorToAdd]);
    setNewColorName("");
    setNewColorHex("#111111");
    setNewColorImage("");
  };

  // Remove Colorway
  const handleRemoveColor = (indexToRemove: number) => {
    if (colors.length <= 1) return; // Keep at least one colorway
    setColors((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Toggle Size
  const handleToggleSize = (sizeOption: string) => {
    setSizes((prev) =>
      prev.includes(sizeOption)
        ? prev.filter((s) => s !== sizeOption)
        : [...prev, sizeOption]
    );
  };

  // Add Custom Size
  const handleAddCustomSize = () => {
    if (!customSizeInput.trim()) return;
    const clean = customSizeInput.trim().toUpperCase();
    if (!sizes.includes(clean)) {
      setSizes((prev) => [...prev, clean]);
    }
    setCustomSizeInput("");
  };

  // Add Detail Bullet
  const handleAddDetail = () => {
    if (!newDetailInput.trim()) return;
    setDetails((prev) => [...prev, newDetailInput.trim()]);
    setNewDetailInput("");
  };

  // Remove Detail Bullet
  const handleRemoveDetail = (index: number) => {
    setDetails((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Product name is required.");
      setActiveSubTab("general");
      return;
    }
    if (images.length === 0) {
      setFormError("At least one product image is required. Upload an image or enter a URL.");
      setActiveSubTab("media");
      return;
    }
    if (!description.trim()) {
      setFormError("Product description is required.");
      setActiveSubTab("specs");
      return;
    }

    setIsSubmitting(true);

    const generatedSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const finalProductData: Product = {
      id: productToEdit?.id || `noir-${generatedSlug}-${Date.now().toString().slice(-4)}`,
      slug: generatedSlug,
      name: name.trim(),
      subtitle: subtitle.trim(),
      category,
      gender,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      rating: productToEdit?.rating || 5.0,
      reviewCount: productToEdit?.reviewCount || 0,
      isNew,
      isBestSeller,
      isFeatured,
      inStock,
      stockCount: Number(stockCount),
      colors:
        colors.length > 0
          ? colors
          : [{ name: "Noir Black", hex: "#111111", image: images[0] }],
      sizes: sizes.length > 0 ? sizes : ["S", "M", "L"],
      description: description.trim(),
      details: details.length > 0 ? details : ["Precision tailored silhouette"],
      shippingInfo: shippingInfo.trim(),
      careInstructions: careInstructions.trim(),
      images,
    };

    try {
      const endpoint = isEditing ? `/api/products/${productToEdit?.id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalProductData),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || (resData.errors ? JSON.stringify(resData.errors) : "Failed to save product"));
      }

      await onSave(resData.data || finalProductData, !isEditing);
      onClose();
    } catch (err: any) {
      console.error("Save error:", err);
      setFormError(err.message || "Failed to persist product to database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#F5F3EF] border border-[#D8D5CF] shadow-2xl my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#D8D5CF] bg-[#EAE8E2] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-[#6B6B6B] block mb-1">
              // ATELIER CATALOGUE CURATION
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl uppercase tracking-tight text-[#111111]">
              {isEditing ? `Edit: ${name || productToEdit?.name}` : "Upload New Silhouette"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#6B6B6B] hover:text-[#111111] hover:bg-black/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex border-b border-[#D8D5CF] bg-white px-5 sm:px-6 shrink-0 gap-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab("general")}
            className={`py-3 text-xs uppercase tracking-wider font-medium border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === "general"
                ? "border-[#111111] text-[#111111]"
                : "border-transparent text-[#6B6B6B] hover:text-[#111111]"
            }`}
          >
            1. General & Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("media")}
            className={`py-3 text-xs uppercase tracking-wider font-medium border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === "media"
                ? "border-[#111111] text-[#111111]"
                : "border-transparent text-[#6B6B6B] hover:text-[#111111]"
            }`}
          >
            2. Images & Colorways ({images.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("specs")}
            className={`py-3 text-xs uppercase tracking-wider font-medium border-b-2 transition-all whitespace-nowrap ${
              activeSubTab === "specs"
                ? "border-[#111111] text-[#111111]"
                : "border-transparent text-[#6B6B6B] hover:text-[#111111]"
            }`}
          >
            3. Sizes & Editorial Details
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {formError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
              <span>{formError}</span>
              <button type="button" onClick={() => setFormError("")}>
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          )}

          {/* TAB 1: General & Pricing */}
          {activeSubTab === "general" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block mb-1">
                    Piece Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. NOIR KINETIC PARKA"
                    className="w-full bg-white border border-[#D8D5CF] px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. noir-kinetic-parka"
                    className="w-full bg-white border border-[#D8D5CF] px-3.5 py-2.5 text-xs text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block mb-1">
                  Editorial Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Engineered for fluid motion and cold-weather protection."
                  className="w-full bg-white border border-[#D8D5CF] px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block mb-1">
                    Category Department
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-white border border-[#D8D5CF] px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111] cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block mb-1">
                    Gender Orientation
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-white border border-[#D8D5CF] px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#111111] cursor-pointer"
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block mb-1">
                    Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-white border border-[#D8D5CF] px-3.5 py-2.5 text-xs text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block mb-1">
                    Compare Price ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Optional strike"
                    value={originalPrice ?? ""}
                    onChange={(e) =>
                      setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full bg-white border border-[#D8D5CF] px-3.5 py-2.5 text-xs text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block mb-1">
                    Inventory Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockCount}
                    onChange={(e) => setStockCount(Number(e.target.value))}
                    className="w-full bg-white border border-[#D8D5CF] px-3.5 py-2.5 text-xs text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block mb-1">
                    Stock Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setInStock(!inStock)}
                    className={`w-full py-2.5 text-xs uppercase tracking-wider font-medium border transition-colors ${
                      inStock
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-red-50 text-red-800 border-red-300"
                    }`}
                  >
                    {inStock ? "In Stock" : "Sold Out"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Images & Colorways */}
          {activeSubTab === "media" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Image Upload Dropzone */}
              <div className="p-4 sm:p-6 bg-white border border-dashed border-[#D8D5CF] space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#111111] text-[#F5F3EF] flex items-center justify-center shrink-0">
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
                        Upload Product Images
                      </h4>
                      <p className="text-[11px] text-[#6B6B6B]">
                        Select image from device (PNG, JPG, WEBP up to 10MB)
                      </p>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="product-file-upload"
                  />
                  <label
                    htmlFor="product-file-upload"
                    className="px-4 py-2 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-wider font-medium hover:bg-black cursor-pointer transition-colors shrink-0"
                  >
                    Choose Image File
                  </label>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 border border-red-200">
                    {uploadError}
                  </p>
                )}

                {uploadFeedback && (
                  <div
                    className={`p-2.5 text-xs flex items-center justify-between border ${
                      uploadFeedback.provider === "cloudinary"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                        : "bg-amber-50 border-amber-300 text-amber-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
                      <span className="font-medium">{uploadFeedback.message}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadFeedback(null)}
                      className="text-current opacity-70 hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Or paste URL */}
                <div className="pt-2 border-t border-[#D8D5CF]/60 flex gap-2">
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Or paste external image URL (e.g. Unsplash)..."
                    className="flex-1 bg-[#F5F3EF] border border-[#D8D5CF] px-3 py-2 text-xs text-[#111111] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3.5 py-2 border border-[#111111] text-xs uppercase font-medium hover:bg-[#111111] hover:text-[#F5F3EF] transition-colors"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Uploaded Gallery Grid */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block">
                  Product Image Gallery ({images.length})
                </span>
                {images.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#6B6B6B] bg-white border border-[#D8D5CF]">
                    No images uploaded yet. Upload at least 1 image to publish.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-[3/4] bg-[#EAE8E2] border border-[#D8D5CF] overflow-hidden"
                      >
                        <Image
                          src={img}
                          alt={`Product media ${idx}`}
                          fill
                          className="object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-[#111111] text-[#F5F3EF] text-[9px] uppercase px-1.5 py-0.5 font-mono">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute bottom-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Colorways Manager */}
              <div className="pt-4 border-t border-[#D8D5CF] space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs uppercase tracking-widest font-semibold text-[#111111]">
                      Product Colorways & Swatches
                    </h4>
                    <span className="text-[10px] text-[#6B6B6B]">
                      Each colorway links to an image and hex shade
                    </span>
                  </div>
                </div>

                {/* Existing Colors List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white border border-[#D8D5CF] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span
                          className="w-5 h-5 rounded-full border border-black/20 shrink-0 shadow-sm"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="truncate">
                          <span className="text-xs font-medium text-[#111111] block truncate">
                            {color.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#6B6B6B]">
                            {color.hex}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {color.image && (
                          <div className="relative w-7 h-7 rounded border border-[#D8D5CF] overflow-hidden">
                            <Image src={color.image} alt={color.name} fill className="object-cover" />
                          </div>
                        )}
                        {colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(idx)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Remove color"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Color Sub-form */}
                <div className="p-3 bg-[#EAE8E2]/60 border border-[#D8D5CF] grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                  <div>
                    <label className="text-[9px] uppercase font-mono text-[#6B6B6B] block mb-1">
                      Color Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bone Chalk"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className="w-full bg-white border border-[#D8D5CF] px-2.5 py-1.5 text-xs text-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-mono text-[#6B6B6B] block mb-1">
                      Hex Shade
                    </label>
                    <div className="flex items-center gap-1.5 bg-white border border-[#D8D5CF] px-2 py-1">
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-5 h-5 p-0 border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-full text-xs font-mono border-0 focus:outline-none text-[#111111]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-mono text-[#6B6B6B] block mb-1">
                      Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Default to main image"
                      value={newColorImage}
                      onChange={(e) => setNewColorImage(e.target.value)}
                      className="w-full bg-white border border-[#D8D5CF] px-2.5 py-1.5 text-xs text-[#111111]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="w-full py-2 bg-[#111111] text-[#F5F3EF] text-xs uppercase font-medium hover:bg-black transition-colors"
                  >
                    + Add Color
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Sizes & Editorial Details */}
          {activeSubTab === "specs" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Sizes Selection */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block">
                    Available Sizes (Selected: {sizes.join(", ") || "None"})
                  </label>
                  <span className="text-[10px] text-[#6B6B6B]">Click to toggle on/off</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PRESET_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleToggleSize(size)}
                      className={`px-3 py-1.5 text-xs font-mono font-medium border transition-colors ${
                        sizes.includes(size)
                          ? "bg-[#111111] text-[#F5F3EF] border-[#111111]"
                          : "bg-white text-[#111111] border-[#D8D5CF] hover:border-[#111111]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Custom size input */}
                <div className="flex gap-2 pt-1 max-w-xs">
                  <input
                    type="text"
                    placeholder="Custom size (e.g. 42 or 32W)"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    className="flex-1 bg-white border border-[#D8D5CF] px-2.5 py-1 text-xs text-[#111111]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="px-3 py-1 border border-[#111111] text-xs uppercase font-medium hover:bg-[#111111] hover:text-[#F5F3EF]"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block mb-1">
                  Editorial Garment Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the silhouette, fabrication, and design ethos..."
                  className="w-full bg-white border border-[#D8D5CF] p-3 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              {/* Details & Specs Bullets */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block">
                  Atelier Specifications & Craftsmanship Bullets
                </label>
                <div className="space-y-1.5">
                  {details.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 bg-white border border-[#D8D5CF] text-xs text-[#111111]"
                    >
                      <span className="truncate">• {bullet}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDetail(idx)}
                        className="text-red-600 hover:text-red-800 p-1 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add specification bullet (e.g. RiRi double zippers)..."
                    value={newDetailInput}
                    onChange={(e) => setNewDetailInput(e.target.value)}
                    className="flex-1 bg-white border border-[#D8D5CF] px-3 py-1.5 text-xs text-[#111111]"
                  />
                  <button
                    type="button"
                    onClick={handleAddDetail}
                    className="px-4 py-1.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase font-medium hover:bg-black"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Care & Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block mb-1">
                    Shipping Policy Note
                  </label>
                  <input
                    type="text"
                    value={shippingInfo}
                    onChange={(e) => setShippingInfo(e.target.value)}
                    className="w-full bg-white border border-[#D8D5CF] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block mb-1">
                    Care Instructions
                  </label>
                  <input
                    type="text"
                    value={careInstructions}
                    onChange={(e) => setCareInstructions(e.target.value)}
                    className="w-full bg-white border border-[#D8D5CF] px-3 py-2 text-xs text-[#111111]"
                  />
                </div>
              </div>

              {/* Badges / Merchandising Toggles */}
              <div className="pt-3 border-t border-[#D8D5CF] space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-[#6B6B6B] font-mono block">
                  Merchandising Flags & Placement
                </span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#111111]">
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      className="rounded border-[#D8D5CF]"
                    />
                    <span>New Piece / New Arrival</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#111111]">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="rounded border-[#D8D5CF]"
                    />
                    <span>Best Seller Badge</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#111111]">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-[#D8D5CF]"
                    />
                    <span>Featured in Homepage Showcase</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-5 border-t border-[#D8D5CF] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-[#6B6B6B]">
              <span>Tip: All details synchronize live to catalogue and MongoDB.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-5 py-2.5 border border-[#D8D5CF] text-xs uppercase tracking-wider text-[#111111] hover:bg-black/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-7 py-2.5 bg-[#111111] text-[#F5F3EF] text-xs uppercase tracking-wider font-medium hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Persisting...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEditing ? "Save & Update Piece" : "Publish Silhouette"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
