import { MapPin, Calendar, Building, Grid, List, ExternalLinkIcon, ChevronDown, Filter } from "lucide-react";
import { useState } from "react";
import { useTrackEvent } from "@/hooks/useTrackEvent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ascilionLogo from "@/assets/ascilion-logo.png";
import brightDayGrapheneLogo from "@/assets/bright-day-graphene-logo.png";
import exegerLogo from "@/assets/exeger-logo.png";
import ebvLogo from "@/assets/ebv-logo.png";

const professionalRoles = [
  {
    id: 1,
    title: "Technical Account Manager",
    company: "EBV Elektronik",
    location: "Stockholm, SWEDEN",
    period: "June 2025 – Currently ongoing",
    description: "Account manager within semiconductors and electronic components providing technical support for new and existing customers.",
    technologies: ["Electronic Components", "Customer Relations", "Technical Support", "Sales"],
    software: ["Salesforce", "SAP", "PowerBI"],
    achievements: [
      "Account manager within semiconductors and electronic components",
      "Technical support for new and existing customers",
      "Business development and other related activities"
    ],
    area: "Sales"
  },
  {
    id: 2,
    title: "Application Engineer",
    company: "Exeger Operations AB",
    location: "Stockholm, SWEDEN",
    period: "October 2024 – June 2025",
    description: "Development of prototypes and products for customer applications with focus on electrical design and rapid prototyping.",
    technologies: ["Electronic Components", "R&D", "Rapid Prototyping", "Electrical Design", "CAD", "Sales", "HW Development", "SW Development"],
    software: ["Altium Designer", "SolidWorks", "Arduino", "Visual Studio", "Raspberry PI"],
    achievements: [
      "Development of prototypes and products for customer applications",
      "Electrical design and rapid prototyping for product development",
      "Technical sales and customer support"
    ],
    area: "Engineering,Sales"
  },
  {
    id: 3,
    title: "Application Specialist",
    company: "Ascilion AB",
    location: "Stockholm, SWEDEN",
    period: "January 2024 – October 2024",
    description: "R&D and product development with focus on medical device development following ISO standards.",
    technologies: ["R&D", "Medical Devices", "MDR", "Technical Support", "Sales", "Rapid Prototyping", "HW Development", "SW Development"],
    software: ["KiCad", "Visual Studio", "SolidWorks"],
    achievements: [
      "R&D and product development/design",
      "Technical sales and business development",
      "Medical device product development (ISO 13485, IEC 60601-1, IEC 62304)"
    ],
    area: "Engineering,Sales"
  },
  {
    id: 4,
    title: "Development Engineer",
    company: "Ascilion AB",
    location: "Stockholm, SWEDEN",
    period: "February 2021 – January 2024",
    description: "SPC, AOI and development of semiconductor components with focus on software and hardware development.",
    technologies: ["Rapid Prototyping", "R&D", "Microfluidics", "SW Development", "HW Development", "Electrical Design", "CAD"],
    software: ["Visual Studio", "Python", "SolidWorks", "EAGLE", "AutoCAD", "Arduino"],
    achievements: [
      "SPC, AOI and development of semiconductor components",
      "Software and hardware development",
      "Development and design of test systems and experiments"
    ],
    area: "Engineering"
  },
  {
    id: 5,
    title: "Process Engineer",
    company: "Bright Day Graphene AB",
    location: "Stockholm, SWEDEN",
    period: "June 2020 – January 2021",
    description: "Process development and scaling of manufacturing with focus on electrochemistry and materials characterization.",
    technologies: ["Process Development", "R&D", "Materials Engineering"],
    software: [],
    achievements: [
      "Process development and scaling of manufacturing",
      "Process design and analysis",
      "Electrochemistry and materials characterization"
    ],
    area: "Engineering"
  }
];

export function Professional() {
  const [selectedArea, setSelectedArea] = useState<string>("All");
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const { track } = useTrackEvent();
  
  const areas = ["All", "Engineering", "Sales"];
  
  // Extract all unique technologies and software from all roles
  const allTechnologies = professionalRoles.flatMap(role => role.technologies);
  const uniqueTechnologies = Array.from(new Set(allTechnologies));
  
  const allSoftware = professionalRoles.flatMap(role => role.software);
  const uniqueSoftware = Array.from(new Set(allSoftware));
  
  // Filter by area, technologies and software
  const filteredRoles = professionalRoles.filter(role => {
    const areaMatch = selectedArea === "All" || role.area.includes(selectedArea);
    const techMatch = selectedTechnologies.length === 0 || 
      selectedTechnologies.every(tech => role.technologies.includes(tech));
    const softwareMatch = selectedSoftware.length === 0 || 
      selectedSoftware.every(software => role.software.includes(software));
    return areaMatch && techMatch && softwareMatch;
  });

  const handleTechnologyToggle = (tech: string) => {
    const newTechnologies = selectedTechnologies.includes(tech) 
      ? selectedTechnologies.filter(t => t !== tech)
      : [...selectedTechnologies, tech];
    
    setSelectedTechnologies(newTechnologies);
    
    // Track filter state
    track('professional_filters_applied', {
      area: selectedArea,
      technologies: newTechnologies,
      software: selectedSoftware,
      totalResults: professionalRoles.filter(role => {
        const areaMatch = selectedArea === "All" || role.area.includes(selectedArea);
        const techMatch = newTechnologies.length === 0 || 
          newTechnologies.every(tech => role.technologies.includes(tech));
        const softwareMatch = selectedSoftware.length === 0 || 
          selectedSoftware.every(software => role.software.includes(software));
        return areaMatch && techMatch && softwareMatch;
      }).length,
      source: 'professional_section',
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  };

  const clearAllTechnologies = () => {
    setSelectedTechnologies([]);
    
    // Track filter clear
    track('professional_filters_applied', {
      area: selectedArea,
      technologies: [],
      software: selectedSoftware,
      totalResults: professionalRoles.filter(role => {
        const areaMatch = selectedArea === "All" || role.area.includes(selectedArea);
        const softwareMatch = selectedSoftware.length === 0 || 
          selectedSoftware.every(software => role.software.includes(software));
        return areaMatch && softwareMatch;
      }).length,
      source: 'professional_section',
      action: 'clear_technologies',
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  };

  const handleSoftwareToggle = (software: string) => {
    const newSoftware = selectedSoftware.includes(software) 
      ? selectedSoftware.filter(s => s !== software)
      : [...selectedSoftware, software];
    
    setSelectedSoftware(newSoftware);
    
    // Track filter state
    track('professional_filters_applied', {
      area: selectedArea,
      technologies: selectedTechnologies,
      software: newSoftware,
      totalResults: professionalRoles.filter(role => {
        const areaMatch = selectedArea === "All" || role.area.includes(selectedArea);
        const techMatch = selectedTechnologies.length === 0 || 
          selectedTechnologies.every(tech => role.technologies.includes(tech));
        const softwareMatch = newSoftware.length === 0 || 
          newSoftware.every(software => role.software.includes(software));
        return areaMatch && techMatch && softwareMatch;
      }).length,
      source: 'professional_section',
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  };

  const clearAllSoftware = () => {
    setSelectedSoftware([]);
    
    // Track filter clear
    track('professional_filters_applied', {
      area: selectedArea,
      technologies: selectedTechnologies,
      software: [],
      totalResults: professionalRoles.filter(role => {
        const areaMatch = selectedArea === "All" || role.area.includes(selectedArea);
        const techMatch = selectedTechnologies.length === 0 || 
          selectedTechnologies.every(tech => role.technologies.includes(tech));
        return areaMatch && techMatch;
      }).length,
      source: 'professional_section',
      action: 'clear_software',
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  };

  return (
    <section id="professional" className="py-16 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Professional Experience
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            A journey through my professional career in semiconductor engineering and technology development.
          </p>
        </div>

        {/* Filter and View Controls */}
        <div className="mx-auto max-w-7xl mt-8">
          <div className="flex flex-row mb-8 gap-2 items-start justify-between">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              {/* Area Filter */}
              <div className="inline-flex rounded-lg bg-muted p-1">
                {areas.map((area) => (
                  <button
                    key={area}
                    onClick={() => {
                      track('professional_filter_click', { 
                        area, 
                        source: 'professional_section',
                        timestamp: Date.now(),
                        userAgent: navigator.userAgent
                      });
                      setSelectedArea(area);
                      
                      // Track comprehensive filter state
                      track('professional_filters_applied', {
                        area: area,
                        technologies: selectedTechnologies,
                        software: selectedSoftware,
                        totalResults: professionalRoles.filter(role => {
                          const areaMatch = area === "All" || role.area.includes(area);
                          const techMatch = selectedTechnologies.length === 0 || 
                            selectedTechnologies.every(tech => role.technologies.includes(tech));
                          const softwareMatch = selectedSoftware.length === 0 || 
                            selectedSoftware.every(software => role.software.includes(software));
                          return areaMatch && techMatch && softwareMatch;
                        }).length,
                        source: 'professional_section',
                        timestamp: Date.now(),
                        userAgent: navigator.userAgent
                      });
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      selectedArea === area
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
              
              {/* Filter Dropdowns - Hidden on mobile */}
              <div className="hidden sm:flex flex-row gap-2">
                {/* Technology Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-all h-10">
                      <Filter className="h-4 w-4" />
                      Skills {selectedTechnologies.length > 0 && `(${selectedTechnologies.length})`}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-background border shadow-md z-50">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        clearAllTechnologies();
                      }}
                      className="cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      Clear All
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {uniqueTechnologies.map((tech) => (
                      <DropdownMenuCheckboxItem
                        key={tech}
                        checked={selectedTechnologies.includes(tech)}
                        onSelect={(e) => {
                          e.preventDefault();
                        }}
                        onCheckedChange={(checked) => {
                          track('professional_tech_filter_click', { 
                            technology: tech, 
                            source: 'professional_section',
                            timestamp: Date.now(),
                            userAgent: navigator.userAgent
                          });
                          handleTechnologyToggle(tech);
                        }}
                        className="cursor-pointer"
                      >
                        {tech}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Software Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-all h-10">
                      <Filter className="h-4 w-4" />
                      Software {selectedSoftware.length > 0 && `(${selectedSoftware.length})`}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-background border shadow-md z-50">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        clearAllSoftware();
                      }}
                      className="cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      Clear All
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {uniqueSoftware.map((software) => (
                      <DropdownMenuCheckboxItem
                        key={software}
                        checked={selectedSoftware.includes(software)}
                        onSelect={(e) => {
                          e.preventDefault();
                        }}
                        onCheckedChange={(checked) => {
                          track('professional_software_filter_click', { 
                            software: software, 
                            source: 'professional_section',
                            timestamp: Date.now(),
                            userAgent: navigator.userAgent
                          });
                          handleSoftwareToggle(software);
                        }}
                        className="cursor-pointer"
                      >
                        {software}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* View Mode Toggle - Always visible on right */}
            <div className="inline-flex rounded-lg bg-muted p-1 flex-shrink-0">
              <button
                onClick={() => {
                  track('professional_view_toggle', { 
                    viewMode: 'card', 
                    previousMode: viewMode,
                    source: 'professional_section',
                    timestamp: Date.now(),
                    sessionDuration: performance.now()
                  });
                  setViewMode('card');
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'card'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  track('professional_view_toggle', { 
                    viewMode: 'list', 
                    previousMode: viewMode,
                    source: 'professional_section',
                    timestamp: Date.now(),
                    sessionDuration: performance.now()
                  });
                  setViewMode('list');
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'list'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Filter Dropdowns Row - Mobile Only */}
          <div className="sm:hidden mb-4">
            <div className="flex flex-row gap-2">
              {/* Technology Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-all h-10">
                    <Filter className="h-4 w-4" />
                    Skills {selectedTechnologies.length > 0 && `(${selectedTechnologies.length})`}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-background border shadow-md z-50">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      clearAllTechnologies();
                    }}
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {uniqueTechnologies.map((tech) => (
                    <DropdownMenuCheckboxItem
                      key={tech}
                      checked={selectedTechnologies.includes(tech)}
                      onSelect={(e) => {
                        e.preventDefault();
                      }}
                      onCheckedChange={(checked) => {
                        track('professional_tech_filter_click', { 
                          technology: tech, 
                          source: 'professional_section',
                          timestamp: Date.now(),
                          userAgent: navigator.userAgent
                        });
                        handleTechnologyToggle(tech);
                      }}
                      className="cursor-pointer"
                    >
                      {tech}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Software Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-all h-10">
                    <Filter className="h-4 w-4" />
                    Software {selectedSoftware.length > 0 && `(${selectedSoftware.length})`}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-background border shadow-md z-50">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      clearAllSoftware();
                    }}
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {uniqueSoftware.map((software) => (
                    <DropdownMenuCheckboxItem
                      key={software}
                      checked={selectedSoftware.includes(software)}
                      onSelect={(e) => {
                        e.preventDefault();
                      }}
                      onCheckedChange={(checked) => {
                        track('professional_software_filter_click', { 
                          software: software, 
                          source: 'professional_section',
                          timestamp: Date.now(),
                          userAgent: navigator.userAgent
                        });
                        handleSoftwareToggle(software);
                      }}
                      className="cursor-pointer"
                    >
                      {software}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Professional Roles */}
        <div className="mx-auto max-w-7xl">
          <div className={viewMode === 'card' ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "space-y-4"}>
            {filteredRoles.map((role, index) => (
              <div
                key={role.id}
                className={`card-gradient rounded-xl shadow-medium hover-lift ${viewMode === 'card' ? 'h-full flex flex-col overflow-hidden px-2 py-6' : 'p-2'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {viewMode === 'card' ? (
                  // Card View - Full Information
                  <>
                    {/* Role Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 relative">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2 leading-tight flex items-center gap-2">
                          {role.company === "EBV Elektronik" && (
                            <a 
                              href="https://my.avnet.com/ebv/"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => track('professional_click', { 
                                clickType: 'company_logo',
                                company: 'EBV Elektronik',
                                roleTitle: 'Technical Account Manager',
                                source: 'professional_section',
                                timestamp: Date.now()
                              })}
                              className="hover:opacity-80 transition-opacity"
                            >
                              <img 
                                src={ebvLogo} 
                                alt="EBV Elektronik" 
                                className="h-5 w-5 rounded-sm"
                              />
                            </a>
                          )}
                          {role.company === "Ascilion AB" && (
                            <a 
                              href="https://www.ascilion.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => track('professional_click', { 
                                clickType: 'company_logo',
                                company: 'Ascilion AB',
                                roleTitle: role.title,
                                source: 'professional_section',
                                timestamp: Date.now()
                              })}
                              className="hover:opacity-80 transition-opacity"
                            >
                              <img 
                                src={ascilionLogo} 
                                alt="Ascilion" 
                                className="h-5 w-5 rounded-sm"
                              />
                            </a>
                          )}
                          {role.company === "Bright Day Graphene AB" && (
                            <a 
                              href="https://www.brightdaygraphene.se/"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => track('professional_click', { 
                                clickType: 'company_logo',
                                company: 'Bright Day Graphene AB',
                                roleTitle: 'Process Engineer',
                                source: 'professional_section',
                                timestamp: Date.now()
                              })}
                              className="hover:opacity-80 transition-opacity"
                            >
                              <img 
                                src={brightDayGrapheneLogo} 
                                alt="Bright Day Graphene" 
                                className="h-5 w-5 rounded-sm"
                              />
                            </a>
                          )}
                          {role.company === "Exeger Operations AB" && (
                            <a 
                              href="https://www.exeger.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => track('professional_click', { 
                                clickType: 'company_logo',
                                company: 'Exeger Operations AB',
                                roleTitle: 'Application Engineer',
                                source: 'professional_section',
                                timestamp: Date.now()
                              })}
                              className="hover:opacity-80 transition-opacity"
                            >
                              <img 
                                src={exegerLogo} 
                                alt="Exeger" 
                                className="h-5 w-5 rounded-sm dark:invert"
                              />
                            </a>
                          )}
                          {role.title}
                        </h3>
                      <div className="flex flex-col gap-2 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <a 
                            href={
                              role.company === "EBV Elektronik" ? "https://my.avnet.com/ebv/" :
                              role.company === "Ascilion AB" ? "https://www.ascilion.com/" :
                              role.company === "Bright Day Graphene AB" ? "https://www.brightdaygraphene.se/" :
                              role.company === "Exeger Operations AB" ? "https://www.exeger.com/" :
                              "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track('professional_click', { 
                              clickType: 'company_name',
                              company: role.company,
                              roleTitle: role.title,
                              source: 'professional_section',
                              timestamp: Date.now()
                            })}
                            className="text-sm font-medium hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            {role.company}
                            <ExternalLinkIcon className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{role.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{role.period}</span>
                        </div>
                      </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {role.description}
                    </p>

                    {/* Technologies */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Skills Used</h4>
                      <div className="flex flex-wrap gap-2">
                        {role.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Software */}
                    {role.software.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Software Used</h4>
                        <div className="flex flex-wrap gap-2">
                          {role.software.map((software) => (
                            <span
                              key={software}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                              {software}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Achievements */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Key Achievements</h4>
                      <ul className="space-y-2">
                        {role.achievements.map((achievement, achievementIndex) => (
                          <li
                            key={achievementIndex}
                            className="flex items-start gap-3 text-sm text-muted-foreground"
                          >
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  // List View - Basic Information Only
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between relative">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1 leading-tight flex items-center gap-2">
                        {role.company === "EBV Elektronik" && (
                          <a 
                            href="https://my.avnet.com/ebv/"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track('professional_click', { 
                              clickType: 'company_logo',
                              company: 'EBV Elektronik',
                              roleTitle: role.title,
                              source: 'professional_section',
                              timestamp: Date.now()
                            })}
                            className="hover:opacity-80 transition-opacity"
                          >
                            <img 
                              src={ebvLogo} 
                              alt="EBV Elektronik" 
                              className="h-4 w-4 rounded-sm"
                            />
                          </a>
                        )}
                        {role.company === "Ascilion AB" && (
                          <a 
                            href="https://www.ascilion.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track('professional_click', { 
                              clickType: 'company_logo',
                              company: 'Ascilion AB',
                              roleTitle: role.title,
                              source: 'professional_section',
                              timestamp: Date.now()
                            })}
                            className="hover:opacity-80 transition-opacity"
                          >
                            <img 
                              src={ascilionLogo} 
                              alt="Ascilion" 
                              className="h-4 w-4 rounded-sm"
                            />
                          </a>
                        )}
                        {role.company === "Bright Day Graphene AB" && (
                          <a 
                            href="https://www.brightdaygraphene.se/"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track('professional_click', { 
                              clickType: 'company_logo',
                              company: 'Bright Day Graphene AB',
                              roleTitle: role.title,
                              source: 'professional_section',
                              timestamp: Date.now()
                            })}
                            className="hover:opacity-80 transition-opacity"
                          >
                            <img 
                              src={brightDayGrapheneLogo} 
                              alt="Bright Day Graphene" 
                              className="h-4 w-4 rounded-sm"
                            />
                          </a>
                        )}
                        {role.company === "Exeger Operations AB" && (
                          <a 
                            href="https://www.exeger.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track('professional_click', { 
                              clickType: 'company_logo',
                              company: 'Exeger Operations AB',
                              roleTitle: role.title,
                              source: 'professional_section',
                              timestamp: Date.now()
                            })}
                            className="hover:opacity-80 transition-opacity"
                          >
                            <img 
                              src={exegerLogo} 
                              alt="Exeger" 
                              className="h-4 w-4 rounded-sm dark:invert"
                            />
                          </a>
                        )}
                        {role.title}
                      </h3>
                      <div className="flex flex-col gap-1 text-muted-foreground">
                        <a 
                          href={
                            role.company === "EBV Elektronik" ? "https://my.avnet.com/ebv/" :
                            role.company === "Ascilion AB" ? "https://www.ascilion.com/" :
                            role.company === "Bright Day Graphene AB" ? "https://www.brightdaygraphene.se/" :
                            role.company === "Exeger Operations AB" ? "https://www.exeger.com/" :
                            "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => track('professional_click', { 
                            clickType: 'company_name',
                            company: role.company,
                            roleTitle: role.title,
                            source: 'professional_section',
                            timestamp: Date.now()
                          })}
                          className="text-sm font-medium hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Building className="h-3 w-3" />
                          {role.company}
                          <ExternalLinkIcon className="h-3 w-3" />
                        </a>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">{role.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">{role.period}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}