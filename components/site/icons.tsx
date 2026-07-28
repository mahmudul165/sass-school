/* আইকন রেজিস্ট্রি
   কনটেন্টে আইকন থাকে স্ট্রিং হিসেবে ("library", "flask")। এখানে সেটি কম্পোনেন্টে ম্যাপ হয়।
   শুধু ব্যবহৃত আইকনগুলোই named import — lucide tree-shake করে, তাই বান্ডল বাড়ে না।
   ব্র্যান্ড আইকন (WhatsApp/Messenger/Facebook) lucide-তে নেই — নিচে নিজস্ব SVG,
   যাতে লোগো সঠিক দেখায় (ভুল ব্র্যান্ড আইকন সাইটকে সঙ্গে সঙ্গে সস্তা দেখায়)। */
import {
  Library, FlaskConical, Monitor, Presentation, Bus, Home, Moon, Trophy, ShieldCheck,
  Heart, Utensils, Users, GraduationCap, BookOpen, Sparkles, Award, Camera,
  Phone, Mail, MapPin, Clock, ChevronDown, ChevronRight, ChevronLeft, Menu, X, Search,
  Download, ArrowRight, ArrowUpRight, Play, Quote, Star, Check, CalendarDays, FileText,
  ExternalLink, Plus, Minus, Building2, Newspaper, Images, UserCheck, ClipboardList,
  Banknote, Bell, Landmark, Target, Lightbulb, HandHeart, PhoneCall, AlertCircle,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };
export type IconComp = ComponentType<IconProps>;

const MAP: Record<string, IconComp> = {
  library: Library, flask: FlaskConical, monitor: Monitor, presentation: Presentation,
  bus: Bus, home: Home, moon: Moon, trophy: Trophy, shield: ShieldCheck, heart: Heart,
  utensils: Utensils, users: Users, graduation: GraduationCap, book: BookOpen,
  sparkles: Sparkles, award: Award, camera: Camera, phone: Phone, mail: Mail,
  mapPin: MapPin, clock: Clock, chevronDown: ChevronDown, chevronRight: ChevronRight,
  chevronLeft: ChevronLeft, menu: Menu, x: X, search: Search, download: Download,
  arrowRight: ArrowRight, arrowUpRight: ArrowUpRight, play: Play, quote: Quote,
  star: Star, check: Check, calendar: CalendarDays, file: FileText,
  external: ExternalLink, plus: Plus, minus: Minus, building: Building2,
  news: Newspaper, images: Images, userCheck: UserCheck, clipboard: ClipboardList,
  money: Banknote, bell: Bell, landmark: Landmark, target: Target, bulb: Lightbulb,
  handHeart: HandHeart, phoneCall: PhoneCall,
  /* ভুলের বার্তায় লাগে। আগে ছিল না বলে Icon-এর ফলব্যাক (Sparkles ✨)
     বসত — ভুল বোঝানোর জন্য সবচেয়ে খারাপ চিহ্ন। */
  alert: AlertCircle,
};

/** নাম দিয়ে আইকন — অজানা নাম হলে নিরাপদ ফলব্যাক (কখনো ক্র্যাশ নয়) */
export function Icon({ name, ...rest }: IconProps & { name?: string }) {
  const C = (name && MAP[name]) || Sparkles;
  return <C aria-hidden="true" {...rest} />;
}

export const hasIcon = (name?: string) => Boolean(name && MAP[name]);

/* ── ব্র্যান্ড আইকন ─────────────────────────────────────── */
export const WhatsAppIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.23 8.23 0 0 1 8.24 8.24c0 4.54-3.7 8.23-8.24 8.23z" />
  </svg>
);

export const MessengerIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.19.16.15.26.35.27.57l.05 1.78c.02.57.6.94 1.12.71l1.99-.88c.17-.07.36-.09.53-.04 .91.25 1.89.38 2.9.38 5.64 0 10-4.13 10-9.71C22 6.13 17.64 2 12 2zm6 7.46-2.94 4.66c-.47.74-1.47.93-2.18.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63l2.94-4.66c.47-.74 1.47-.93 2.18-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.63z" />
  </svg>
);

export const FacebookIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
  </svg>
);

export const YouTubeIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M23.5 6.9a3 3 0 0 0-2.1-2.1C19.5 4.3 12 4.3 12 4.3s-7.5 0-9.4.5A3 3 0 0 0 .5 6.9C0 8.8 0 12 0 12s0 3.2.5 5.1a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.1.5-5.1s0-3.2-.5-5.1zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
  </svg>
);

/** গুগল রিভিউ ব্যাজের জন্য */
export const GoogleIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path fill="#4285F4" d="M23 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.16a5.27 5.27 0 0 1-2.29 3.46v2.88h3.7C21.72 18.8 23 15.8 23 12.27z" />
    <path fill="#34A853" d="M12 23.5c3.1 0 5.7-1.03 7.6-2.79l-3.71-2.88c-1.03.69-2.35 1.1-3.89 1.1-2.99 0-5.52-2.02-6.43-4.73H1.74v2.97A11.49 11.49 0 0 0 12 23.5z" />
    <path fill="#FBBC05" d="M5.57 14.2a6.9 6.9 0 0 1 0-4.4V6.83H1.74a11.5 11.5 0 0 0 0 10.34l3.83-2.97z" />
    <path fill="#EA4335" d="M12 5.07c1.69 0 3.2.58 4.4 1.72l3.29-3.29C17.7 1.6 15.1.5 12 .5A11.49 11.49 0 0 0 1.74 6.83L5.57 9.8C6.48 7.09 9.01 5.07 12 5.07z" />
  </svg>
);
