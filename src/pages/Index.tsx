import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { Professional } from "@/components/Professional";
import { Skills } from "@/components/Skills";
import { Education } from "@/components/Education";
import { Contact } from "@/components/Contact";
import { useAnalytics } from "@/hooks/useAnalytics";
import ProtectedAnalytics from "@/components/ProtectedAnalytics";
import { BarChart } from "lucide-react";

const Index = () => {
  // Track page views automatically
  useAnalytics();
  
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Secret key combination: Ctrl + Shift + A (desktop) or tap sequence on mobile
  useEffect(() => {
    let tapCount = 0;
    let tapTimer: NodeJS.Timeout;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        
        // Track desktop analytics access
        import('@/hooks/useTrackEvent').then(({ useTrackEvent }) => {
          const { track } = useTrackEvent();
          track('Link click', {
            type: 'analytics',
            section: 'Analytics Access',
            item: 'Analytics dashboard',
            method: 'keyboard_shortcut',
            source: 'ctrl_shift_a'
          });
        });
        
        setShowAnalytics(true);
      }
    };

    const handleMobileTap = (event: TouchEvent) => {
      // Only trigger on footer taps to avoid interfering with normal usage
      const target = event.target as HTMLElement;
      if (target.closest('footer')) {
        tapCount++;
        
        if (tapCount === 1) {
          tapTimer = setTimeout(() => {
            tapCount = 0;
          }, 3000); // Reset after 3 seconds
        }
        
        if (tapCount === 7) { // 7 taps in footer area
          clearTimeout(tapTimer);
          tapCount = 0;
          
          // Track mobile analytics access
          import('@/hooks/useTrackEvent').then(({ useTrackEvent }) => {
            const { track } = useTrackEvent();
            track('Link click', {
              type: 'analytics',
              section: 'Analytics Access',
              item: 'Analytics dashboard',
              method: 'tap_sequence',
              source: 'footer'
            });
          });
          
          setShowAnalytics(true);
        }
      }
    };

    // Desktop: keyboard shortcut
    window.addEventListener('keydown', handleKeyPress);
    
    // Mobile: touch sequence
    window.addEventListener('touchstart', handleMobileTap);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('touchstart', handleMobileTap);
      if (tapTimer) clearTimeout(tapTimer);
    };
  }, []);

  // Prevent body scroll when analytics is open
  useEffect(() => {
    if (showAnalytics) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAnalytics]);

  return (
    <div className="smooth-scroll">
      <Header />
      <main>
        <Hero />
        <About />
        <Professional />
        <Projects />
        <Education />
        <Skills />
        <Contact />
      </main>
      
      {/* Footer */}
      <footer className="bg-card border-t border-border/50 py-12 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Alexander Engman
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <a
                href="https://www.linkedin.com/in/alexanderengman"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <a
                href="mailto:alexander@engman.nu?subject=Contact from website"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Email
              </a>
            </div>
            {/* Hidden mobile access - small analytics icon */}
            <div className="mt-3 flex justify-center sm:hidden">
              <div className="p-2 rounded-full hover:bg-muted/20 transition-colors cursor-pointer">
                <BarChart className="h-3 w-3 text-muted-foreground/30" />
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Hidden Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 z-50 overflow-auto">
          <ProtectedAnalytics onClose={() => setShowAnalytics(false)} />
        </div>
      )}
    </div>
  );
};

export default Index;
