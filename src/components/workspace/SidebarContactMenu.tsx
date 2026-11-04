import { ArrowUpRight, ChevronsUpDown, Copy, Github, Linkedin, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { profile } from "@/data/profile";
import { toast } from "@/hooks/use-toast";

export default function SidebarContactMenu() {
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      toast({ title: "Email copied" });
    } catch {
      toast({ title: "Couldn't copy email", description: profile.email });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="sidebar-contact" type="button" aria-label="Contact Lily Dong">
          <span className="mini-avatar" aria-hidden="true">YD</span>
          <span>
            <strong>Lily Dong</strong>
            <small>Get in touch</small>
          </span>
          <ChevronsUpDown size={15} aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="sidebar-contact-menu"
        side="top"
        align="start"
        sideOffset={8}
        collisionPadding={12}
        aria-label="Lily's contact links"
      >
        <DropdownMenuLabel className="contact-menu-heading">
          <strong>Lily Dong</strong>
          <span>{profile.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="contact-menu-separator" />
        <DropdownMenuItem asChild>
          <a href={`mailto:${profile.email}`}>
            <Mail size={16} aria-hidden="true" />
            Email Lily
            <ArrowUpRight size={14} className="contact-menu-arrow" aria-hidden="true" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { void copyEmail(); }}>
          <Copy size={16} aria-hidden="true" />
          Copy email address
        </DropdownMenuItem>
        <DropdownMenuSeparator className="contact-menu-separator" />
        <DropdownMenuItem asChild>
          <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
            <Github size={16} aria-hidden="true" />
            GitHub
            <ArrowUpRight size={14} className="contact-menu-arrow" aria-hidden="true" />
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer">
            <Linkedin size={16} aria-hidden="true" />
            LinkedIn
            <ArrowUpRight size={14} className="contact-menu-arrow" aria-hidden="true" />
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
