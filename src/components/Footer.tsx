
import { Github, Linkedin, Mail } from 'lucide-react';
import { profile } from '@/data/profile';

const Footer = () => {
  return (
    <footer className="mt-16 bg-navy text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">{profile.name}</h3>
            <p className="text-sm text-sky-100/80 mt-1">{profile.program}</p>
          </div>
          
          <div className="flex space-x-6 items-center">
            <a 
              href={`mailto:${profile.email}`} 
              className="text-sky-100/80 hover:text-white transition-colors"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
            <a 
              href={profile.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sky-100/80 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <a 
              href={profile.linkedInUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sky-100/80 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-white/10 text-center text-sm text-sky-100/70">
          <p>&copy; {new Date().getFullYear()} {profile.shortName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
