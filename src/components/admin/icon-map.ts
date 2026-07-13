import {
  Home,
  GraduationCap,
  Briefcase,
  Plane,
  Trophy,
  Milestone,
  Image as ImageIcon,
  Music,
  Video,
} from 'lucide-react';

export const ICON_MAP: Record<string, { icon: any; label: string }> = {
  home: { icon: Home, label: 'Home' },
  education: { icon: GraduationCap, label: 'Education' },
  work: { icon: Briefcase, label: 'Work' },
  travel: { icon: Plane, label: 'Travel' },
  milestone: { icon: Milestone, label: 'Milestone' },
  achievement: { icon: Trophy, label: 'Achievement' },
  art: { icon: ImageIcon, label: 'Art' },
  music: { icon: Music, label: 'Music' },
  video: { icon: Video, label: 'Video' },
};
