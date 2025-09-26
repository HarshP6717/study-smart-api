import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { 
  Home, 
  BookOpen, 
  Brain, 
  MessageSquare, 
  Trophy, 
  Settings,
  Store,
  CreditCard,
  LogOut,
  Zap,
  Target,
  Clock
} from 'lucide-react';

interface NavigationProps {
  user: User;
  currentSection: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'quiz', label: 'Quiz', icon: Brain },
  { id: 'flashcards', label: 'Flashcards', icon: Target },
  { id: 'cheatsheets', label: 'Cheat Sheets', icon: Zap },
  { id: 'progress', label: 'Progress', icon: Trophy },
  { id: 'study', label: 'Study Timer', icon: Clock },
  { id: 'chat', label: 'AI Tutor', icon: MessageSquare },
  { id: 'store', label: 'Store', icon: Store },
];

export default function Navigation({ user, currentSection, onNavigate, onLogout }: NavigationProps) {
  return (
    <div className="w-64 min-h-screen bg-card border-r border-border shadow-medium">
      {/* Logo & User Info */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
              Smart Exam
            </h2>
            <p className="text-xs text-muted-foreground">AI Study Prep</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            <CreditCard className="w-3 h-3 mr-1" />
            {user.coins}
          </Badge>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                isActive 
                  ? "bg-gradient-primary text-primary-foreground shadow-soft" 
                  : "hover:bg-muted"
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => onNavigate('settings')}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}