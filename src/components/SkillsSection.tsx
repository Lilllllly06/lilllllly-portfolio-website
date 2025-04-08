
const SkillsSection = () => {
  const skills = {
    Languages: ["Python", "Java", "SQL", "C/C++", "JavaScript", "HTML/CSS", "LaTeX"],
    Frameworks: ["Scrum", "Agile", "React", "ThreeJS", "NextJS", "Arduino", "Pygame", "Flask", "OOP"],
    "Developer Tools": ["Git", "Subversion", "Linux", "OpenCV", "OpenGL", "VSCode", "Android Studio", "Eclipse", "IntelliJ"],
    "Research Tools": ["MATLAB", "ImageJ", "Tracker", "Python Matplotlib", "Multimeters", "Lux Meters", "Comsol Multiphysics"]
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-navy mb-8 text-center">Technical Skills</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(skills).map(([category, skillList]) => (
            <div key={category} className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-navy-dark mb-4">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {skillList.map(skill => (
                  <span 
                    key={skill} 
                    className="bg-white text-gray-700 px-3 py-1 rounded-md text-sm border border-gray-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
