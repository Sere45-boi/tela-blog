"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Briefcase, TrendingUp, BarChart3, PieChart, Globe, Wallet, ShieldCheck, Zap, MessageSquare, FileText, Video, MessageCircle, Layout } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// --- Icon Definitions (Client Side) ---

const IconStripe = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.144 11.233c0-2.836-1.503-4.144-3.794-4.144-2.275 0-3.857 1.341-3.857 3.968 0 3.012 2.21 3.551 3.987 4.09 1.148.35 1.5.7 1.5 1.258 0 .49-.403.823-1.05.823-.823 0-1.295-.368-1.47-.578v2.713c.42.193.998.368 1.698.368 2.52 0 4.016-1.33 4.016-3.964 0-2.852-1.925-3.64-4.156-4.253-.98-.28-1.295-.543-1.295-.98 0-.35.315-.665.893-.665.665 0 1.103.245 1.278.42v-2.583c-.35-.14-.858-.263-1.418-.263-2.31 0-3.71 1.278-3.71 3.868 0 2.8 1.873 3.623 4.148 4.235 1.103.315 1.488.63 1.488 1.12 0 .56-.49.91-1.225.91-.77 0-1.365-.333-1.663-.613v2.853c.455.21 1.05.385 1.768.385 2.625 0 4.156-1.348 4.156-4.043z" fill="currentColor"/>
  </svg>
);

const IconVercel = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 22h20L12 2z"/>
  </svg>
);

const IconSlack = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" fill="currentColor"/><path d="M9 15.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="currentColor"/><path d="M14 8.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" fill="currentColor"/><path d="M15.5 15a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" fill="currentColor"/><path d="M10 14h4v-1.5a1.5 1.5 0 0 0-1.5-1.5h-1a1.5 1.5 0 0 0-1.5 1.5V14Z" fill="currentColor"/><path d="M8.5 14a1.5 1.5 0 0 0 1.5 1.5h1.5v-1a1.5 1.5 0 0 0-1.5-1.5H8.5v1Z" fill="currentColor"/><path d="M15.5 10a1.5 1.5 0 0 0-1.5-1.5H12.5v4a1.5 1.5 0 0 0 1.5 1.5h1.5v-4Z" fill="currentColor"/><path d="M14 8.5a1.5 1.5 0 0 0-1.5-1.5h-1v4a1.5 1.5 0 0 0 1.5 1.5h1v-4Z" fill="currentColor"/>
  </svg>
);

const ICON_MAP: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  stripe: IconStripe,
  vercel: IconVercel,
  slack: IconSlack,
  briefcase: Briefcase,
  trending: TrendingUp,
  chart: BarChart3,
  pie: PieChart,
  globe: Globe,
  wallet: Wallet,
  shield: ShieldCheck,
  zap: Zap,
  message: MessageSquare,
  file: FileText,
  video: Video,
  circle: MessageCircle,
  layout: Layout
};

interface IconData {
  id: number;
  icon: string;
  className: string;
  bgColor?: string;
  iconColor?: string;
}

export interface FloatingIconsHeroProps {
  title: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  icons: IconData[];
  children?: React.ReactNode;
}

const Icon = ({
  iconData,
  index,
}: {
  iconData: IconData;
  index: number;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const IconComponent = ICON_MAP[iconData.icon] || Globe;

  useGSAP(() => {
    if (!containerRef.current || !innerRef.current) return;

    // Initial entrance animation
    gsap.fromTo(containerRef.current, 
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.8, delay: index * 0.05, ease: "power4.out" }
    );

    // Floating animation
    gsap.to(innerRef.current, {
      y: "random(-10, 10)",
      x: "random(-5, 5)",
      rotation: "random(-3, 3)",
      duration: 4 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const iconCenterX = rect.left + rect.width / 2;
      const iconCenterY = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(e.clientX - iconCenterX, 2) +
        Math.pow(e.clientY - iconCenterY, 2)
      );

      if (distance < 250) {
        const angle = Math.atan2(
          e.clientY - iconCenterY,
          e.clientX - iconCenterX
        );
        const force = (1 - distance / 250) * 80;
        gsap.to(containerRef.current, {
          x: -Math.cos(angle) * force,
          y: -Math.sin(angle) * force,
          duration: 0.6,
          ease: "power2.out",
        });
      } else {
        gsap.to(containerRef.current, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className={cn('absolute z-0 pointer-events-none group/icon', iconData.className)}
      style={{ opacity: 0 }} // Hidden initially until GSAP kicks in
    >
      <div
        ref={innerRef}
        className={cn(
          "flex items-center justify-center w-14 h-14 md:w-16 md:h-16 p-3 rounded-[1.5rem] shadow-[0_8px_32px_rgb(0,0,0,0.06)] border border-white/40 backdrop-blur-xl transition-all duration-500",
          iconData.bgColor || "bg-white/40"
        )}
      >
        <IconComponent className={cn("w-7 h-7 md:w-8 md:h-8 transition-colors duration-500", iconData.iconColor || "text-[#093C15]")} />
      </div>
    </div>
  );
};

const FloatingIconsHero = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & FloatingIconsHeroProps
>(({ className, title, description, ctaText, ctaHref, icons, children, ...props }, ref) => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!contentRef.current) return;
    
    const elements = contentRef.current.children;
    gsap.fromTo(elements, 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "power4.out", delay: 0.2 }
    );
  }, { scope: contentRef });

  return (
    <section
      ref={ref}
      className={cn(
        'relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden bg-transparent',
        className
      )}
      {...props}
    >
      {/* Container for the background floating icons */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {icons.map((iconData, index) => (
          <Icon
            key={iconData.id}
            iconData={iconData}
            index={index}
          />
        ))}
      </div>

      {/* Container for the foreground content */}
      <div ref={contentRef} className="relative z-10 text-center px-6 max-w-5xl mx-auto py-20">
        <h1 className="text-5xl md:text-7xl lg:text-[76px] font-bold tracking-tight text-[#1d1d1f] leading-[1.05] mb-8 opacity-0 font-bricolage">
          {title}
        </h1>

        {description && (
          <p className="max-w-2xl mx-auto text-xl md:text-[24px] text-[#1d1d1f]/60 leading-[1.5] font-medium mb-12 font-poppins opacity-0">
            {description}
          </p>
        )}
        
        <div className="opacity-0">
          {children}
        </div>

        {ctaText && ctaHref && (
          <div className="mt-12 opacity-0">
            <Link href={ctaHref}>
              <Button size="lg" className="h-14 px-10 rounded-full font-bold text-[16px] bg-[#093C15] hover:bg-[#093C15]/90 shadow-xl shadow-[#093C15]/10">
                {ctaText}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
});

FloatingIconsHero.displayName = 'FloatingIconsHero';

export { FloatingIconsHero };
