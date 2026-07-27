/* বাংলা ↔ ইংরেজি অঙ্ক
   আলাদা ফাইলে রাখার কারণ: ক্লায়েন্ট কম্পোনেন্ট (CountUp, Lightbox) শুধু এই দুটি
   ফাংশনই চায়। lib/content.ts থেকে আমদানি করলে গোটা ডিফল্ট-কনটেন্ট ফাইল
   (বাংলা + ইংরেজি, কয়েকশ কিলোবাইট টেক্সট) ব্রাউজার বান্ডলে চলে যেত। */
const BN = "০১২৩৪৫৬৭৮৯";
export const toBnDigits = (s: string) => s.replace(/\d/g, (d) => BN[Number(d)]);
export const toEnDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN.indexOf(d)));
