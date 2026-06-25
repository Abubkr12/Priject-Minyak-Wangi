import {
  BadgeCheck,
  Citrus,
  Droplets,
  Flame,
  Flower2,
  Leaf,
  Moon,
  Sparkles,
  Sprout
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ScentFamily =
  | "Fresh"
  | "Floral"
  | "Woody"
  | "Sweet"
  | "Aquatic"
  | "Musky"
  | "Spicy"
  | "Citrus";

export type Perfume = {
  id: string;
  name: string;
  collection: string;
  family: ScentFamily;
  mood: string;
  notes: string[];
  strength: "Soft" | "Medium" | "Strong";
  longevity: string;
  priceFrom: number;
  stock: number;
  variants: string[];
  match: string;
  color: string;
};

export type AromaOption = {
  label: ScentFamily | "All";
  icon: LucideIcon;
};

export type CustomRequest = {
  id: string;
  customer: string;
  summary: string;
  status: "Baru" | "Diproses" | "Butuh review" | "Selesai";
  source: "Chat AI" | "Form request" | "Upload gambar";
  value: string;
};

export const aromaOptions: AromaOption[] = [
  { label: "All", icon: Sparkles },
  { label: "Fresh", icon: Leaf },
  { label: "Floral", icon: Flower2 },
  { label: "Woody", icon: Sprout },
  { label: "Sweet", icon: BadgeCheck },
  { label: "Aquatic", icon: Droplets },
  { label: "Musky", icon: Moon },
  { label: "Spicy", icon: Flame },
  { label: "Citrus", icon: Citrus }
];

export const perfumes: Perfume[] = [
  {
    id: "pf-001",
    name: "Velvet Rose Musk",
    collection: "Signature Mix",
    family: "Floral",
    mood: "Romantis, bersih, feminin",
    notes: ["Rose", "White musk", "Lychee", "Soft amber"],
    strength: "Medium",
    longevity: "6-8 jam",
    priceFrom: 35000,
    stock: 42,
    variants: ["10ml", "30ml", "50ml"],
    match: "Cocok buat daily, date night, dan hadiah.",
    color: "rose"
  },
  {
    id: "pf-002",
    name: "Citrus Neroli Clean",
    collection: "Fresh Daily",
    family: "Citrus",
    mood: "Segar, rapi, ringan",
    notes: ["Bergamot", "Neroli", "Green tea", "Clean musk"],
    strength: "Soft",
    longevity: "4-6 jam",
    priceFrom: 32000,
    stock: 35,
    variants: ["10ml", "30ml", "50ml", "100ml"],
    match: "Aman buat kantor, kuliah, dan cuaca panas.",
    color: "amber"
  },
  {
    id: "pf-003",
    name: "Noir Oud Reserve",
    collection: "Premium Blend",
    family: "Woody",
    mood: "Mewah, bold, dewasa",
    notes: ["Oud", "Saffron", "Patchouli", "Dark vanilla"],
    strength: "Strong",
    longevity: "8-10 jam",
    priceFrom: 58000,
    stock: 18,
    variants: ["10ml", "30ml", "50ml"],
    match: "Kuat buat malam, event, dan signature personal.",
    color: "teal"
  },
  {
    id: "pf-004",
    name: "Ocean Linen Mist",
    collection: "Clean Fresh",
    family: "Aquatic",
    mood: "Sejuk, bersih, effortless",
    notes: ["Sea salt", "Linen", "Lavender", "Soft woods"],
    strength: "Medium",
    longevity: "5-7 jam",
    priceFrom: 34000,
    stock: 28,
    variants: ["10ml", "30ml", "50ml"],
    match: "Bagus buat yang nggak suka aroma terlalu manis.",
    color: "blue"
  },
  {
    id: "pf-005",
    name: "Vanilla Skin Glow",
    collection: "Comfort Mix",
    family: "Sweet",
    mood: "Manis, hangat, dekat di kulit",
    notes: ["Vanilla", "Caramel", "Milk accord", "Skin musk"],
    strength: "Medium",
    longevity: "6-8 jam",
    priceFrom: 37000,
    stock: 31,
    variants: ["10ml", "30ml", "50ml"],
    match: "Cocok buat customer yang suka aroma gourmand.",
    color: "cream"
  },
  {
    id: "pf-006",
    name: "Spiced Amber Club",
    collection: "Evening Mix",
    family: "Spicy",
    mood: "Hangat, percaya diri, maskulin",
    notes: ["Cardamom", "Amber", "Tonka", "Cedar"],
    strength: "Strong",
    longevity: "7-9 jam",
    priceFrom: 45000,
    stock: 22,
    variants: ["10ml", "30ml", "50ml"],
    match: "Lebih cocok buat malam dan ruangan dingin.",
    color: "copper"
  }
];

export const recentRequests: CustomRequest[] = [
  {
    id: "REQ-2406-014",
    customer: "Nadia",
    summary: "Minta aroma fresh manis, tidak menusuk, mirip vibe body mist premium.",
    status: "Baru",
    source: "Chat AI",
    value: "Rp37.000"
  },
  {
    id: "REQ-2406-013",
    customer: "Aldi",
    summary: "Upload referensi parfum woody spicy, ingin versi lebih kalem untuk kantor.",
    status: "Butuh review",
    source: "Upload gambar",
    value: "Rp58.000"
  },
  {
    id: "REQ-2406-012",
    customer: "Maya",
    summary: "Racikan vanilla musky dengan rose tipis, ukuran 30ml.",
    status: "Diproses",
    source: "Form request",
    value: "Rp42.000"
  },
  {
    id: "REQ-2406-011",
    customer: "Rizky",
    summary: "Repeat order Ocean Linen Mist 50ml, tambah sedikit citrus.",
    status: "Selesai",
    source: "Form request",
    value: "Rp52.000"
  }
];

export const dashboardStats = [
  { label: "Order bulan ini", value: "128", trend: "+18%" },
  { label: "Request custom", value: "46", trend: "+31%" },
  { label: "Chat AI", value: "392", trend: "+44%" },
  { label: "Estimasi omzet", value: "Rp8,7 jt", trend: "+22%" }
];

export const topAromas = [
  { label: "Fresh", value: 82 },
  { label: "Floral", value: 68 },
  { label: "Sweet", value: 57 },
  { label: "Woody", value: 43 },
  { label: "Musky", value: 39 }
];

export const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
