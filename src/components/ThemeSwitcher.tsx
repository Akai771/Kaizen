import React, { useState, useEffect } from "react";
import { Palette } from "lucide-react";

interface Theme {
  name: string;
  displayName: string;
  color1: string;
  color2: string;
}

const themes: Theme[] = [
  {
    name: "default",
    displayName: "Default",
    color1: "hsl(47.9 95.8% 53.1%)",
    color2: "hsl(20 14.3% 4.1%)",
  },
  {
    name: "theme1",
    displayName: "Cloud Flare",
    color1: "hsl(9, 100%, 60%)",
    color2: "hsl(51, 100%, 50%)",
  },
  {
    name: "theme2",
    displayName: "ShadCN Rose",
    color1: "hsl(346.8 77.2% 49.8%)",
    color2: "hsl(20 14.3% 4.1%)",
  },
  {
    name: "theme3",
    displayName: "Discord",
    color1: "hsl(226.73 58.43% 65.1%)",
    color2: "hsl(217.5 9.09% 17.25%)",
  },
  {
    name: "theme4",
    displayName: "Claude",
    color1: "hsl(18 57% 44%)",
    color2: "hsl(60 3.53% 16.67%)",
  },
  {
    name: "theme5",
    displayName: "Supabase",
    color1: "hsl(150.24 50% 40%)",
    color2: "hsl(0 0% 6.67%)",
  },
  {
    name: "theme6",
    displayName: "Github",
    color1: "hsl(210 25% 95%)",
    color2: "hsl(220 23% 5%)",
  },
  {
    name: "theme7",
    displayName: "HiTown Red",
    color1: "hsl(355.63 90.57% 58.43%)",
    color2: "hsl(229 41% 4%)",
  },
];

const ThemeSwitcher: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  // Function to handle theme change
  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const themeName = event.target.value;
    const selectedTheme = themes.find((theme) => theme.name === themeName);
    if (!selectedTheme) return;

    // Remove old theme class
    if (currentTheme.name !== "default") {
      document.documentElement.classList.remove(currentTheme.name);
    }

    // Add new theme class (except for default)
    if (selectedTheme.name !== "default") {
      document.documentElement.classList.add(selectedTheme.name);
    }

    setCurrentTheme(selectedTheme);
    localStorage.setItem("selectedTheme", themeName);
  };

  // Load the saved theme on initial render
  useEffect(() => {
    const savedThemeName = localStorage.getItem("selectedTheme") || "default";
    const savedTheme =
      themes.find((theme) => theme.name === savedThemeName) || themes[0];

    setCurrentTheme(savedTheme);

    if (savedTheme.name !== "default") {
      document.documentElement.classList.add(savedTheme.name);
    }
  }, []);

  return (
    <div className="w-full">
      <label className="flex items-center gap-2 text-sm font-medium mb-2">
        <Palette className="h-4 w-4" />
        Choose Theme
      </label>
      <div className="relative">
        <select
          value={currentTheme.name}
          onChange={handleThemeChange}
          className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
        >
          {themes.map((theme) => (
            <option key={theme.name} value={theme.name}>
              {theme.displayName}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
          <div
            className="h-4 w-4 rounded-full border border-border"
            style={{ backgroundColor: currentTheme.color1 }}
          />
          <div
            className="h-4 w-4 rounded-full border border-border"
            style={{ backgroundColor: currentTheme.color2 }}
          />
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
