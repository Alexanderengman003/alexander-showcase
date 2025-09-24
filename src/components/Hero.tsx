import { ArrowDown, Download, Linkedin, Mail, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrackEvent } from "@/hooks/useTrackEvent";

export function Hero() {
  const { track } = useTrackEvent();
  
  return (
    <section 
      id="home" 
      className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-primary/10 pt-8 sm:pt-32 pb-12"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-primary/8 rounded-full blur-2xl animate-pulse-glow" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
          {/* Profile Image */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative">
              <img
                src="/lovable-uploads/fc819219-43d3-4817-b8da-08b472acd701.png"
                alt="Alexander Engman - Hardware Engineer and Technical Sales Professional in Stockholm, Sweden"
                className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full object-cover shadow-2xl ring-4 ring-white/10 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent to-primary/10 group-hover:to-primary/20 transition-all duration-500" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 text-left max-w-2xl">
            {/* Animated greeting */}
            <div className="animate-fade-up space-y-8 mb-8" style={{ animationDelay: "0.2s" }}>
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight font-modern mb-4">
                  <span className="text-gradient">Alexander Engman</span>
                </h1>
              
                <div className="relative space-y-2">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-medium text-muted-foreground">
                    Hardware engineering | Technical Sales
                  </h2>
                  <div className="flex items-center gap-2 text-lg text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span>Stockholm</span>
                  </div>
                  <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="animate-fade-up mb-6" style={{ animationDelay: "0.4s" }}>
              <p className="text-lg leading-relaxed text-muted-foreground max-w-2xl">
                Passionate about advancing semiconductor technology, with hands-on experience in hardware development and innovation. Specialized in advanced semiconductors, working across design, testing, and implementation of hardware solutions. Proven background in sales, bridging technical expertise with customer needs to drive business growth.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="animate-fade-up flex flex-col sm:flex-row gap-4 justify-start" style={{ animationDelay: "0.6s" }}>
              <Button 
                size="lg" 
                variant="blue-dark"
                className="hover-lift font-modern group"
                onClick={() => {
                  track('Click', { 
                    type: 'social_media',
                    section: 'Hero', 
                    action: 'linkedin_click',
                    item: 'LinkedIn profile button',
                    url: 'https://www.linkedin.com/in/alexanderengman'
                  });
                  window.open('https://www.linkedin.com/in/alexanderengman', '_blank');
                }}
              >
                LinkedIn
              </Button>
              <Button 
                size="lg" 
                variant="blue-medium" 
                className="hover-lift font-modern group"
                onClick={() => {
                  track('Click', { 
                    type: 'contact_button',
                    section: 'Hero', 
                    action: 'email_click',
                    item: 'Get in touch button',
                    url: 'mailto:alexander@engman.nu'
                  });
                  window.location.href = 'mailto:alexander@engman.nu?subject=Contact from website&body=Hello Alexander,';
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Get In Touch
              </Button>
              <Button 
                variant="blue-light" 
                size="lg" 
                className="hover-lift font-modern group"
                onClick={() => {
                  track('Click', { 
                    type: 'download',
                    section: 'Hero', 
                    action: 'cv_download',
                    item: 'CV Download button',
                    url: '/CV_Alexander_Engman_2025.pdf'
                  });
                  const link = document.createElement('a');
                  link.href = '/CV_Alexander_Engman_2025.pdf';
                  link.download = 'CV_Alexander_Engman_2025.pdf';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                Download Resume
              </Button>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
