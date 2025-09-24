import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { trackEvent } from "@/lib/analytics";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeToggle = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // Track theme change as user interaction
    await trackEvent('Click', { 
      type: 'theme_toggle',
      section: 'Header',
      action: 'theme_toggle_click',
      item: 'Theme toggle button',
      from: theme, 
      to: newTheme 
    });
  };

  return (
    <div
      onClick={handleThemeToggle}
      className="relative h-10 w-10 rounded-lg bg-card border border-border shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 flex items-center justify-center"
    >
      <Sun className="h-5 w-5 text-yellow-500 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 text-white rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </div>
  );
}