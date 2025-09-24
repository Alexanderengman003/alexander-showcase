import { useState } from "react";
import { ExternalLink, Github, ChevronDown, ChevronUp, Grid, List, MapPin, Calendar, Building, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrackEvent } from "@/hooks/useTrackEvent";


const projects = [
  {
    id: 1,
    title: "PELSA dISF sampling system",
    description: "The PELSA system consists of a sampling tool, a monitoring system, and a PC-controlled vacuum unit. Sampling is controlled from the PC through pre-defined sequences and on-screen visual monitoring of the process.",
    image: "/lovable-uploads/9b0d7032-cf5a-41a6-bd1e-478738857d3e.png",
    technologies: ["MEMS", "C#", "Electronics design", "SEM Analysis", "Silicon fabrication", "CAD", "AOI", "Test systems", "SPC"],
    githubUrl: null,
    liveUrl: "#projects",
    category: "Commercial",
    date: "Feb 2021 - January 2024",
    location: "Stockholm, Sweden",
    institution: "Ascilion AB"
  },
  {
    id: 2,
    title: "Stretchable Microsupercapacitors",
    description: "Master's thesis research developing novel Direct Ink Writing method for 3D printing intrinsically stretchable energy storage devices. Achieved 80% stretchability with 740 µF cm⁻² capacitance using PEDOT:PSS conductive inks on TPU substrates.",
    image: "/lovable-uploads/b2cdba2a-95c9-40fa-8794-4965fa31a5bb.png",
    technologies: ["3D Printing", "PEDOT:PSS", "Direct Ink Writing", "Electrochemical Analysis", "Materials Science", "TPU Substrates"],
    githubUrl: null,
    liveUrl: "https://www.diva-portal.org/smash/get/diva2:1479859/FULLTEXT01.pdf", // Link to thesis
    category: "Research",
    date: "Jan 2020 - Jun 2020",
    location: "Stockholm, Sweden",
    institution: "KTH Royal Institute of Technology"
  },
  {
    id: 3,
    title: "Optical MEMS Switch",
    description: "Course project designing and fabricating a mechanical multi-stable optical in-plane switch. Created electrostatic comb drive actuator movable ±15 μm in two directions with locking mechanism using Silicon-on-Insulator wafer fabrication.",
    image: "/lovable-uploads/5e81c449-7442-4078-b624-b4f8d6a2390b.png",
    technologies: ["MEMS", "COMSOL Simulation", "Silicon Fabrication", "DRIE", "Photolithography", "SEM Analysis"],
    githubUrl: null,
    liveUrl: "#", // Link to project report
    category: "Research",
    date: "Jan 2020 - Jun 2020",
    location: "Stockholm, Sweden",
    institution: "KTH Royal Institute of Technology"
  },
  {
    id: 4,
    title: "MOSFET Interconnect Deposition and Reactive Ion Etching",
    description: "Hands-on CMOS fabrication project completing the final step in MOSFET preparation by adding metal contacts for transistor communication. Involved cleanroom work including photolithography, metal deposition via sputtering, and reactive ion etching to achieve 450nm metal layer thickness with 0.8μm resolution.",
    image: "/lovable-uploads/05a7e279-5b0c-438c-a29c-cd828459a95f.png",
    technologies: ["MOSFET", "CMOS", "Photolithography", "Metal Deposition", "Reactive Ion Etching", "Sputtering", "Cleanroom Fabrication", "HF Etching"],
    githubUrl: null,
    liveUrl: "#", // Link to project report
    category: "Research",
    date: "Feb 2019",
    location: "Stockholm, Sweden",
    institution: "KTH Royal Institute of Technology"
  },
];

const categories = ["All", "Commercial", "Research"];

export function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const { track } = useTrackEvent();

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="projects" className="py-16 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Projects & Research
          </h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Academic research and engineering projects showcasing expertise in semiconductor technology, 
            MEMS fabrication, materials science, and advanced manufacturing techniques.
          </p>
        </div>

        <div className="mx-auto max-w-7xl mt-8">
          <div className="flex items-center justify-between mb-8">
            <div className="inline-flex rounded-lg bg-muted p-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    track("Filter applied", { 
                      section: "Projects & Research",
                      filter: "category",
                      value: category
                    });
                    setSelectedCategory(category);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    selectedCategory === category
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="inline-flex rounded-lg bg-muted p-1">
              <button
                onClick={() => {
                  track("Filter applied", { 
                    section: "Projects & Research",
                    filter: "view_mode",
                    value: "card"
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
                  track("Filter applied", { 
                    section: "Projects & Research",
                    filter: "view_mode",
                    value: "list"
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
        </div>

        {/* Projects Grid/List */}
        <div className={`mx-auto mt-8 max-w-7xl ${viewMode === 'card' ? 'grid grid-cols-1 gap-8 lg:grid-cols-2' : 'space-y-4'}`}>
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className={`card-gradient rounded-xl shadow-medium hover-lift group ${viewMode === 'card' ? 'h-full flex flex-col overflow-hidden px-2 py-6' : 'p-2'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {viewMode === 'card' && (
                <></>
              )}

              {/* Project Content */}
              <div className={viewMode === 'card' ? 'flex flex-col flex-grow' : ''}>
                {viewMode === 'card' ? (
                  // Card View - Full Information
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                          {project.title}
                        </h3>
                      </div>
                    </div>
                    
                    {project.date && (
                      <div className="flex flex-col gap-2 text-muted-foreground mb-3">
                         <div className="flex items-center gap-2">
                           <Building className="h-4 w-4" />
                           <a 
                             href={project.institution === "Ascilion AB" ? "https://www.ascilion.com/" : "https://www.kth.se/"}
                             target="_blank"
                             rel="noopener noreferrer"
                              onClick={() => track("Partner click", {
                                section: "Projects & Research",
                                partner: project.institution,
                                item: project.title,
                                category: project.category,
                                url: project.institution === "Ascilion AB" ? "https://www.ascilion.com/" : "https://www.kth.se/"
                              })}
                             className="text-sm font-medium hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1"
                           >
                             {project.institution}
                             <ExternalLinkIcon className="h-3 w-3" />
                           </a>
                         </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{project.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{project.date}</span>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow min-h-[5rem]">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="mt-auto">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Technologies used</h4>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  // List View - Basic Information Only
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
                          {project.title}
                        </h3>
                        <div className="flex flex-col gap-1 text-muted-foreground">
                           <a 
                             href={project.institution === "Ascilion AB" ? "https://www.ascilion.com/" : "https://www.kth.se/"}
                             target="_blank"
                             rel="noopener noreferrer"
                              onClick={() => track("Partner click", {
                                section: "Projects & Research",
                                partner: project.institution,
                                item: project.title,
                                category: project.category,
                                url: project.institution === "Ascilion AB" ? "https://www.ascilion.com/" : "https://www.kth.se/"
                              })}
                             className="text-sm font-medium hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1"
                           >
                            <Building className="h-3 w-3" />
                            {project.institution}
                            <ExternalLinkIcon className="h-3 w-3" />
                          </a>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="text-sm">{project.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-sm">{project.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProjects.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              No projects found matching your criteria. Try adjusting your search or filter.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}