import { useState, useEffect } from 'react';
import { appStore } from '@/lib/store';
import { User } from '@/types';
import AuthModal from '@/components/AuthModal';
import Dashboard from '@/components/Dashboard';
import Navigation from '@/components/Navigation';
import SubjectsManager from '@/components/SubjectsManager';
import QuizManager from '@/components/QuizManager';
import FlashcardsManager from '@/components/FlashcardsManager';
import CheatSheetManager from '@/components/CheatSheetManager';
import ProgressTracker from '@/components/ProgressTracker';
import StudyTimer from '@/components/StudyTimer';
import ChatInterface from '@/components/ChatInterface';
import StoreManager from '@/components/StoreManager';
import { HeroButton } from '@/components/ui/hero-button';
import { Brain, BookOpen, Target, Zap, Star, ArrowRight } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentSection, setCurrentSection] = useState('dashboard');

  useEffect(() => {
    const currentUser = appStore.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleAuthSuccess = () => {
    const currentUser = appStore.getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = () => {
    appStore.logout();
    setUser(null);
    setCurrentSection('dashboard');
  };

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo & Title */}
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl backdrop-blur-sm border border-white/30 shadow-glow">
              <Brain className="w-10 h-10 text-white" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
                Smart Exam
                <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Prep
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Your AI-powered study companion that adapts to your learning style and helps you achieve exam success
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="glass rounded-2xl p-6 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-white mx-auto" />
              <h3 className="text-xl font-semibold text-white">Smart Subjects</h3>
              <p className="text-white/80">Organize your study materials by subject and track progress</p>
            </div>
            
            <div className="glass rounded-2xl p-6 text-center space-y-4">
              <Target className="w-12 h-12 text-white mx-auto" />
              <h3 className="text-xl font-semibold text-white">AI-Generated Quizzes</h3>
              <p className="text-white/80">Get personalized quizzes that adapt to your knowledge level</p>
            </div>
            
            <div className="glass rounded-2xl p-6 text-center space-y-4">
              <Zap className="w-12 h-12 text-white mx-auto" />
              <h3 className="text-xl font-semibold text-white">Study Rewards</h3>
              <p className="text-white/80">Earn coins for studying and unlock exclusive rewards</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <HeroButton
              size="lg"
              variant="glass"
              onClick={() => setShowAuthModal(true)}
              className="text-lg px-8 py-4 min-w-[200px]"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </HeroButton>
            
            <HeroButton
              size="lg"
              variant="outline"
              onClick={() => setShowAuthModal(true)}
              className="text-lg px-8 py-4 min-w-[200px] border-white/30 text-white hover:bg-white/10"
            >
              Try Demo
            </HeroButton>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2 mt-8 text-white/80">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
              ))}
            </div>
            <span className="text-sm">
              Trusted by 10,000+ students worldwide
            </span>
          </div>
        </div>

        <AuthModal 
          open={showAuthModal} 
          onOpenChange={setShowAuthModal}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation 
        user={user}
        currentSection={currentSection}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      
      <div className="flex-1">
        {currentSection === 'dashboard' && (
          <Dashboard user={user} onNavigate={handleNavigate} />
        )}
        {currentSection === 'subjects' && (
          <SubjectsManager />
        )}
        {currentSection === 'quiz' && (
          <QuizManager />
        )}
        {currentSection === 'flashcards' && (
          <FlashcardsManager />
        )}
        {currentSection === 'cheatsheets' && (
          <CheatSheetManager />
        )}
        {currentSection === 'progress' && (
          <ProgressTracker />
        )}
        {currentSection === 'study' && (
          <StudyTimer />
        )}
        {currentSection === 'chat' && (
          <ChatInterface />
        )}
        {currentSection === 'store' && (
          <StoreManager />
        )}
        {/* Settings and other sections */}
        {!['dashboard', 'subjects', 'quiz', 'flashcards', 'cheatsheets', 'progress', 'study', 'chat', 'store'].includes(currentSection) && (
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-muted-foreground">
              {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} - Coming Soon!
            </h2>
            <p className="text-muted-foreground mt-2">
              This feature is being developed and will be available soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
