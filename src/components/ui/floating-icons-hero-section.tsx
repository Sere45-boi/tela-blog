"use client";

import * as React from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Briefcase, TrendingUp, BarChart3, PieChart, Globe, Wallet, ShieldCheck, Zap, MessageSquare, FileText, Video, MessageCircle, Layout } from 'lucide-react';

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
  iconColor?: string; // Optional custom color for the icon
}

export interface FloatingIconsHeroProps {
  title: string;
  subtitle?: string; // This is the small badge accent
  description?: string; // This is the narrative paragraph
  ctaText?: string;
  ctaHref?: string;
  icons: IconData[];
  children?: React.ReactNode;
}

const Icon = ({
  mouseX,
  mouseY,
  iconData,
  index,
}: {
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
  iconData: IconData;
  index: number;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const IconComponent = ICON_MAP[iconData.icon] || Globe;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 400, damping: 25 });
  const springY = useSpring(y, { stiffness: 400, damping: 25 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
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
          x.set(-Math.cos(angle) * force);
          y.set(-Math.sin(angle) * force);
        } else {
          x.set(0);
          y.set(0);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      key={iconData.id}
      style={{
        x: springX,
        y: springY,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.05,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn('absolute z-0 pointer-events-none group/icon', iconData.className)}
    >
      <motion.div
        className={cn(
          "flex items-center justify-center w-14 h-14 md:w-16 md:h-16 p-3 rounded-[1.5rem] shadow-[0_8px_32px_rgb(0,0,0,0.06)] border border-white/40 backdrop-blur-xl transition-all duration-500",
          iconData.bgColor || "bg-white/40"
        )}
        animate={{
          y: [0, -10, 0, 10, 0],
          x: [0, 5, 0, -5, 0],
          rotate: [0, 3, 0, -3, 0],
        }}
        transition={{
          duration: 6 + Math.random() * 4,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      >
        <IconComponent className={cn("w-7 h-7 md:w-8 md:h-8 transition-colors duration-500", iconData.iconColor || "text-[#093C15]")} />
      </motion.div>
    </motion.div>
  );
};

const FloatingIconsHero = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & FloatingIconsHeroProps
>(({ className, title, subtitle, description, ctaText, ctaHref, icons, children, ...props }, ref) => {
  // Refs to track the raw mouse position
  const mouseX = React.useRef(0);
  const mouseY = React.useRef(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    mouseX.current = event.clientX;
    mouseY.current = event.clientY;
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
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
            mouseX={mouseX}
            mouseY={mouseY}
            iconData={iconData}
            index={index}
          />
        ))}
      </div>

      {/* Container for the foreground content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {subtitle && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#41cc00]/10 border border-[#41cc00]/20 mb-8"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#41cc00] animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#093C15] uppercase">{subtitle}</span>
            </motion.div>
          )}

          <h1 className="text-5xl md:text-7xl lg:text-[76px] font-bold tracking-tight text-[#1d1d1f] leading-[1.05] mb-8">
            {title}
          </h1>

          {description && (
            <p className="max-w-2xl mx-auto text-xl md:text-[24px] text-[#1d1d1f]/60 leading-[1.5] font-medium mb-12 font-poppins">
              {description}
            </p>
          )}
          
          {children}

          {ctaText && ctaHref && (
            <div className="mt-12">
              <Link href={ctaHref}>
                <Button size="lg" className="h-14 px-10 rounded-full font-bold text-[16px] bg-[#093C15] hover:bg-[#093C15]/90 shadow-xl shadow-[#093C15]/10">
                  {ctaText}
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
});

FloatingIconsHero.displayName = 'FloatingIconsHero';

export { FloatingIconsHero };
