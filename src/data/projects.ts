export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  image: string;
  sections: {
    cad?: {
      title: string;
      description?: string;
      images: {
        url: string;
        caption: string;
      }[];
    };
    pcb?: {
      title: string;
      description?: string;
      images: {
        url: string;
        caption: string;
      }[];
    };
    research: {
      title: string;
      description?: string;
      pdfFiles: { name: string; url: string }[];
    };
    demonstration: {
      title: string;
      description?: string;
      images: {
        url: string;
        caption: string;
      }[];
      videos?: { name: string; url: string }[];
    };
  };
  technologies: string[];
  date: string;
}

export const projects: Project[] = [
  {
    id: "marangoni-flow",
    title: "Marangoni Flow and Rayleigh-Taylor Instability in Evaporating Fluids",
    category: "Research",
    description: "Investigated Marangoni flow and Rayleigh-Taylor instability by analyzing fluid dynamics at interfaces.",
    longDescription: "Investigated Marangoni flow and Rayleigh-Taylor instability by analyzing fluid dynamics at interfaces to study droplet behavior in experiments. Designed and implemented a droplet release system using Arduino and 3D-printed components to enhance precision and reproducibility in experiments. Developed and optimized an interferometry analysis system with OpenCV for high-resolution tension measurement and analysis. Performed dynamic simulations using MATLAB and Comsol, achieving 93% accuracy to verify experimental results with simulations.",
    image: "/lovable-uploads/68da4c4f-112c-4cc9-b062-7cfc03748489.png",
    sections: {
      cad: {
        title: "CAD Models",
        description: "3D models and designs used in the experimental setup for droplet release and measurement",
        images: [
          {
            url: "/lovable-uploads/a63edae6-059a-45fe-85fc-f8d629f25319.png",
            caption: "Spinning Tube Stand"
          },
          {
            url: "/lovable-uploads/c9529ae4-7e99-4d33-9e71-b1e1d0b0a206.png",
            caption: "IR Break Beam Stands"
          },
          {
            url: "/lovable-uploads/27ed569d-5bb1-4b93-b8e9-169b261b058f.png",
            caption: "IR Break Beam Wheel"
          },
          {
            url: "/lovable-uploads/c65cac28-ce6f-4509-a5d3-794c7e28d159.png",
            caption: "Droplet Release Mechanism"
          }
        ]
      },
      research: {
        title: "Research Report",
        pdfFiles: [
          { name: "Droplet Explosion.pdf", url: "https://lilllllly06.github.io/portfolio-pdfs/Droplet%20Explosion.pdf" }
        ]
      },
      demonstration: {
        title: "Setup Demonstration",
        description: "Images and videos of the experimental setup and demonstrations",
        images: [
          {
            url: "/lovable-uploads/5daf9c1e-dba4-4a7d-8d7a-0e7cfd837542.png",
            caption: "Droplet Release Mechanism"
          },
          {
            url: "/lovable-uploads/bd800211-2bb7-48ef-bd75-db93e4ec2085.png",
            caption: "Interferometry Setup"
          },
          {
            url: "/lovable-uploads/5355b755-b2b4-451c-b756-09a97a5b1c64.png",
            caption: "Interfacial Tension Measurement Setup"
          }
        ]
      }
    },
    technologies: ["Arduino", "EasyEDA", "ImageJ", "Tracker", "MatPlotLib", "Comsol Multiphysics", "MATLAB"],
    date: "JUL 2021 - JUL 2022"
  },
  {
    id: "faraday-waves",
    title: "Faraday Waves",
    category: "Research",
    description: "Investigated Faraday waves and oscillating droplets, examining surface waves and instabilities in vertically oscillating systems.",
    longDescription: "Investigated Faraday waves and oscillating droplets, examining surface waves and instabilities in vertically oscillating systems. Analyzed surface and gravity-capillary waves using ImageJ and Tracker to study the effects of frequency, amplitude, and viscosity on wave patterns. Simulated droplet dynamics in MATLAB and processed data using Python and Matplotlib to quantify variations and validate theoretical predictions.",
    image: "/lovable-uploads/e9d0a08a-950b-48aa-a7aa-a808da20e74e.png",
    sections: {
      research: {
        title: "Research Report",
        pdfFiles: [
          { name: "Faraday Waves Modified.pdf", url: "https://lilllllly06.github.io/portfolio-pdfs/Faraday%20Waves%20Modified.pdf" }
        ]
      },
      demonstration: {
        title: "Setup Demonstration",
        description: "Images and videos of the experimental setup and demonstrations",
        images: [
          {
            url: "/lovable-uploads/c5b4dc6b-d24f-4397-b033-fa86b4e13338.png",
            caption: "Pumping Straw Setup"
          },
          {
            url: "/lovable-uploads/6608a85f-2e6b-42a9-91f7-964e538e298c.png",
            caption: "Faraday Waves Setup"
          }
        ]
      }
    },
    technologies: ["MATLAB", "ImageJ", "Tracker", "Python", "Matplotlib"],
    date: "JUL 2023 - JUL 2024"
  },
  {
    id: "saffman-taylor-instability",
    title: "Saffman–Taylor Instability of Miscible Fluids",
    category: "Research",
    description: "Conducted research, data analysis, and experiments on three-stage Marangoni flow and Saffman-Taylor instability.",
    longDescription: "Conducted research, data analysis, and experiments on three-stage Marangoni flow and Saffman-Taylor instability, focusing on fluid dynamics and fractal patterns. Analyzed fractal dimensions and geometry using ImageJ and Tracker to develop a systematic theory on the role of viscosity in Saffman-Taylor instability. Simulated fluid behavior with MATLAB and processed data using Python and Matplotlib to quantify viscosity changes in paint samples with different concentrations.",
    image: "/lovable-uploads/ec8c80a1-6bf7-422d-ae25-18f823ae0701.png",
    sections: {
      cad: {
        title: "CAD Models",
        description: "3D models and designs used in the experimental setup",
        images: [
          {
            url: "/lovable-uploads/66640e23-dd0a-43e5-859f-0507f43c537e.png",
            caption: "Droplet Release Mechanism"
          }
        ]
      },
      research: {
        title: "Research Report",
        pdfFiles: [
          { name: "Fractal Fingers.pdf", url: "https://lilllllly06.github.io/portfolio-pdfs/Fractal%20Fingers.pdf" }
        ]
      },
      demonstration: {
        title: "Setup Demonstration",
        description: "Images and videos of the experimental setup and demonstrations",
        images: [
          {
            url: "/lovable-uploads/5daf9c1e-dba4-4a7d-8d7a-0e7cfd837542.png",
            caption: "Droplet Release Mechanism"
          }
        ]
      }
    },
    technologies: ["ImageJ", "Tracker", "MATLAB", "Python", "Matplotlib"],
    date: "JUL 2022 - JUL 2023"
  },
  {
    id: "gratzel-cell",
    title: "Grätzel Cell",
    category: "Research",
    description: "Constructed and optimized a dye-sensitized solar cell using titanium dioxide and iodine electrolyte.",
    longDescription: "Constructed and optimized a dye-sensitized solar cell using titanium dioxide and iodine electrolyte to study the mechanisms of photovoltaic energy conversion. Evaluated the influence of electrolyte concentration, glass conductivity, TiO₂ layer thickness, and temperature on cell efficiency through electrochemical analysis and precise measurements using multimeters and lux meters.",
    image: "/lovable-uploads/07f98453-5712-47b7-b9a4-8e209e175e2f.png",
    sections: {
      research: {
        title: "Research Report",
        pdfFiles: [
          { name: "Grätzel Cell.pdf", url: "https://lilllllly06.github.io/portfolio-pdfs/Gratzel%20Cell.pdf" }
        ]
      },
      demonstration: {
        title: "Setup Demonstration",
        description: "Images and videos of the experimental setup and demonstrations",
        images: [
          {
            url: "/lovable-uploads/fdeabe05-8396-4b22-b8fc-fd509415ccc0.png",
            caption: "Grätzel Cell Setup"
          },
          {
            url: "/lovable-uploads/ad7a6911-4d3f-49ff-8135-23fc7f634d4b.png",
            caption: "Grätzel Cell Explanation Diagram"
          }
        ]
      }
    },
    technologies: ["Python", "Matplotlib", "MATLAB", "COMSOL Multiphysics", "Multimeter", "Lux Meter"],
    date: "JUL 2023 - JUL 2024"
  },
  {
    id: "magnetostriction",
    title: "Magnetostriction",
    category: "Research",
    description: "Investigated the impact of external magnetic fields on magnetization and magnetostriction in various materials.",
    longDescription: "Investigated the impact of external magnetic fields on magnetization and magnetostriction in various materials, focusing on ferromagnetic, paramagnetic, and diamagnetic properties. Measured B-H curves using a custom-built coil and H-bridge circuit to control magnetic fields, with real-time data captured by a Hall effect sensor to analyze magnetic saturation and hysteresis effects. Quantified magnetostriction in ferrite rods using a strain gauge and Wheatstone Bridge setup, capturing precise dimensional changes under varying magnetic fields.",
    image: "/lovable-uploads/32402b42-1fec-4982-ba04-0fb4eacee7a7.png",
    sections: {
      pcb: {
        title: "PCB Design",
        description: "Circuit board designs used in the experimental setup",
        images: [
          {
            url: "/lovable-uploads/1b715709-6a5e-4a4c-a68d-4ed123644c87.png",
            caption: "B-H Curve H Bridge"
          },
          {
            url: "/lovable-uploads/cec0bb59-4990-4cd4-b697-a9f8e90ffaa4.png", 
            caption: "Hall Sensor"
          },
          {
            url: "/lovable-uploads/55adbf64-f2a0-4de7-9c65-0623b768e66d.png",
            caption: "Strain Gauge + Amp"
          }
        ]
      },
      research: {
        title: "Research Report",
        pdfFiles: [
          { name: "Magnetostriction.pdf", url: "https://lilllllly06.github.io/portfolio-pdfs/Magnetostriction.pdf" }
        ]
      },
      demonstration: {
        title: "Setup Demonstration",
        description: "Images and videos of the experimental setup and demonstrations",
        images: [
          {
            url: "/lovable-uploads/1406e7d2-c20a-4fe5-8f1b-3bcf4f02e557.png",
            caption: "COF Measurement Setup"
          },
          {
            url: "/lovable-uploads/cc2a5bed-a41f-4d31-8404-b4cc2311cb52.png",
            caption: "B-H Curve Measurement Setup"
          }
        ]
      }
    },
    technologies: ["MATLAB", "ImageJ", "Tracker", "Python", "Matplotlib"],
    date: "SEP 2022 - JUL 2023"
  },
  {
    id: "pulsating-heat-tube",
    title: "Pulsating Heat Tube in a Condensing-Heating-Condensing (CHC) System",
    category: "Research",
    description: "Researched thermodynamics and fluid dynamics of pulsating heat tubes to analyze two-phase heat transfer efficiency.",
    longDescription: "Researched thermodynamics and fluid dynamics of pulsating heat tubes to analyze two-phase heat transfer efficiency. Designed and implemented a heat tube system with Arduino and analog electronics for precise control and measurement. Developed a Python-based tool using OpenCV Object Detection to extract and analyze thermocouple data from 8 channels for real-time monitoring. Simulated vapor motion within the heat tube using Python, achieving a 96% match between simulations and experimental results.",
    image: "/lovable-uploads/d734ccdb-66aa-4b2d-a61f-acd82b871fde.png",
    sections: {
      cad: {
        title: "CAD Models",
        description: "3D models and designs used in the experimental setup",
        images: [
          {
            url: "/lovable-uploads/b88e2910-58c7-496d-b590-0648d41aa9c3.png",
            caption: "Motor-Straw Stand"
          }
        ]
      },
      research: {
        title: "Research Report",
        pdfFiles: [
          { name: "Ponyo's Heat Tube.pdf", url: "https://lilllllly06.github.io/portfolio-pdfs/Ponyo_s%20Heat%20Tube.pdf" }
        ]
      },
      demonstration: {
        title: "Setup Demonstration",
        description: "Images and videos of the experimental setup and demonstrations",
        images: [
          {
            url: "/lovable-uploads/616ed4a4-26eb-4a27-acf5-809651d2c843.png",
            caption: "Pulsating Heat Tube Setup"
          }
        ]
      }
    },
    technologies: ["Arduino", "EasyEDA", "OnShape", "Python", "JSON", "OpenCV", "Tracker", "MatPlotLib"],
    date: "JUL 2022 - JUL 2023"
  },
  {
    id: "acoustic-analysis",
    title: "Acoustic Analysis of Airflow-Induced Sound in Perforated Rotating Disks",
    category: "Research",
    description: "Investigated the sound phenomena of airflow interacting with a rotating disk with holes.",
    longDescription: "Investigated the sound phenomena of airflow interacting with a rotating disk with holes, analyzing how sound characteristics change with parameters like flow rate, rotational speed, and hole configuration. Developed experimental setups using a motor speed controller, air compressor, and microphone to capture sound data, with real-time analysis and visualization conducted in MATLAB and Python. Quantified relationships between sound intensity, frequency, and disk parameters, using theoretical models to validate experimental observations and identify key parameter impacts.",
    image: "/lovable-uploads/13efca1b-2da4-4381-9059-f49fe2f6a158.png",
    sections: {
      research: {
        title: "Research Report",
        pdfFiles: [
          { name: "Acoustic Analysis.pdf", url: "https://lilllllly06.github.io/portfolio-pdfs/SirenModified.pdf" }
        ]
      },
      demonstration: {
        title: "Setup Demonstration",
        description: "Images and videos of the experimental setup and demonstrations",
        images: [
          {
            url: "/lovable-uploads/2cd95deb-073b-4e3d-b4bf-2663251a6a5d.png",
            caption: "Rotating Disk Setup"
          }
        ]
      }
    },
    technologies: ["MATLAB", "ImageJ", "Tracker", "Python", "Matplotlib"],
    date: "JUL 2022 - JUL 2023"
  }
];

export const getProjectById = (id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};

export const getProjectsByCategory = (category: string): Project[] => {
  return projects.filter(project => project.category === category);
};

export const getAllCategories = (): string[] => {
  const categories = new Set(projects.map(project => project.category));
  return Array.from(categories);
};
