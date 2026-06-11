import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface FrameworkOption {
  value: string;
  label: string;
  description: string;
  logo: React.ReactNode;
}

// Inline SVGs for beautiful brand representation
const ViteLogo = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 410 410" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M380.08 72.88L211.59 389.28C209.68 392.83 204.6 392.81 202.72 389.24L34.1 68.74C32.17 65.07 35.17 60.84 39.31 61.34L206.59 81.33C207.28 81.41 207.97 81.41 208.66 81.33L374.83 61.37C378.97 60.87 381.99 65.13 380.08 72.88Z" fill="url(#vite-bg-grad)" />
    <path d="M228.61 14.52L201.76 137.98C201.27 140.23 203.4 142.1 205.5 141.18L262.24 116.4C265.41 115.01 268.42 118.82 266.38 121.65L173.86 249.71C172.07 252.19 174.45 255.43 177.21 254.34L228.68 234.02C231.81 232.78 234.79 236.42 232.89 239.14L157.41 346.7C154.55 350.78 148.16 347.88 149.33 342.94L183.1 199.98C183.58 197.94 181.67 196.22 179.79 197.02L131.67 217.47C128.53 218.8 125.5 214.94 127.65 212.06L220.73 87.79C222.51 85.41 220.25 82.16 217.48 83.18L165.73 102.16C162.61 103.3 159.66 99.69 161.48 96.97L219.04 11.23C220.89 8.48 225.26 10.45 224.28 13.8L228.61 14.52Z" fill="url(#vite-bolt-grad)" />
    <defs>
      <linearGradient id="vite-bg-grad" x1="41.35" y1="61" x2="330.45" y2="340.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#41D1FF" />
        <stop offset="1" stopColor="#BD34FE" />
      </linearGradient>
      <linearGradient id="vite-bolt-grad" x1="171" y1="11" x2="161" y2="346" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF7E00" />
        <stop offset="0.5" stopColor="#FF007A" />
        <stop offset="1" stopColor="#FFEA00" />
      </linearGradient>
    </defs>
  </svg>
);

const NextjsLogo = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="90" cy="90" r="88" fill="#000000" stroke="#333333" strokeWidth="4" />
    <path d="M149.508 157.52L69.142 54H54v72h14.4V68.736l66.528 85.523c4.896-4.608 9.216-9.792 12.96-15.12z" fill="url(#nextjs-grad)" />
    <rect x="111.6" y="54" width="14.4" height="72" fill="url(#nextjs-grad)" />
    <defs>
      <linearGradient id="nextjs-grad" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

const ExpressLogo = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="28" fill="#141416" stroke="#2a2a2d" strokeWidth="4" />
    <path d="M24 38H56V48H38V58H52V68H38V78H56V88H24V38Z" fill="#FFFFFF" />
    <path d="M64 38L78 64L64 90H78L88 72L98 90H112L98 64L112 38H98L88 56L78 38H64Z" fill="#FFFFFF" />
  </svg>
);

const PythonLogo = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M51.2 5C28.2 5 29.8 14.9 29.8 14.9L29.9 25.1H51.7V28.2H21.5C21.5 28.2 5 26.6 5 49.3C5 72 18.2 71.3 18.2 71.3H26.1V60.2C26.1 45.4 37.6 44.9 37.6 44.9H59.5V23.7C59.5 23.7 61.5 5 51.2 5Z" fill="#3776AB" />
    <path d="M59 105C82 105 80.4 95.1 80.4 95.1L80.3 84.9H58.5V81.8H88.7C88.7 81.8 105.2 83.4 105.2 60.7C105.2 38 92 38.7 92 38.7H84.1V49.8C84.1 64.6 72.6 65.1 72.6 65.1H50.7V86.3C50.7 86.3 48.7 105 59 105Z" fill="#FFE873" />
    <circle cx="39.5" cy="14.5" r="3.5" fill="#ffffff" />
    <circle cx="70.5" cy="95.5" r="3.5" fill="#3776AB" />
  </svg>
);

const OtherLogo = () => (
  <svg className="w-5 h-5 flex-shrink-0 text-stone-400 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

export const FRAMEWORK_OPTIONS: FrameworkOption[] = [
  {
    value: "vite",
    label: "Vite",
    description: "Vite (React, Vue, Svelte, etc.)",
    logo: <ViteLogo />,
  },
  {
    value: "nextjs",
    label: "Next.js",
    description: "Framework React NextJS",
    logo: <NextjsLogo />,
  },
  {
    value: "express",
    label: "Express",
    description: "Node.js Express Server",
    logo: <ExpressLogo />,
  },
  {
    value: "python",
    label: "Python",
    description: "Python Serverless Application",
    logo: <PythonLogo />,
  },
  {
    value: "detect",
    label: "Other",
    description: "Auto-detect or Static HTML layout",
    logo: <OtherLogo />,
  },
];

interface FrameworkDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function FrameworkDropdown({ value, onChange }: FrameworkDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fallback if current value is not in our list
  const currentOption =
    FRAMEWORK_OPTIONS.find((opt) => opt.value === value) ||
    FRAMEWORK_OPTIONS.find((opt) => opt.value === "detect") ||
    FRAMEWORK_OPTIONS[0];

  // Close dropdown on outside focus click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full select-none" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-4 bg-stone-900/50 hover:bg-stone-800/50 border border-white/5 hover:border-white/10 rounded-xl font-sans text-sm text-stone-200 flex items-center justify-between transition-all shadow-inner outline-none focus:border-white/20 select-none cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-black/40">
            {currentOption.logo}
          </div>
          <div className="flex items-center leading-none text-left">
            <span className="text-stone-200 font-semibold text-sm">{currentOption.label}</span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Floating Dropdown List Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-full z-10 rounded-2xl border border-white/10 bg-stone-950/95 backdrop-blur-xl shadow-2xl p-2 animate-modal-entrance flex flex-col gap-1">
          {FRAMEWORK_OPTIONS.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between gap-3 text-left hover:bg-white/5 transition-all select-none ${
                  isSelected ? "bg-white/[0.03]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-black/40">
                    {option.logo}
                  </div>
                  <div className="flex items-center leading-none">
                    <span className={`text-sm font-semibold ${isSelected ? "text-white" : "text-stone-300"}`}>
                      {option.label}
                    </span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
