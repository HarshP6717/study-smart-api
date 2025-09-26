import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroButton } from '@/components/ui/hero-button';
import { appStore } from '@/lib/store';
import { Subject, Progress, User } from '@/types';
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Clock, 
  Plus, 
  TrendingUp,
  Coins,
  Target,
  Zap,
  Award
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onNavigate: (section: string) => void;
}

export default function Dashboard({ user, onNavigate }: DashboardProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [studyStats, setStudyStats] = useState({ totalMinutes: 0, streak: 0 });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setSubjects(appStore.getSubjects());
    setProgress(appStore.getProgress());
    
    // Calculate study stats
    const history = appStore.getStudyHistory(30);
    const totalMinutes = history.reduce((sum, day) => sum + day.minutes, 0);
    const streak = calculateStreak(history);
    setStudyStats({ totalMinutes, streak });
  };

  const calculateStreak = (history: { date: string; minutes: number }[]) => {
    let streak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].minutes > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getAverageAccuracy = () => {
    if (progress.length === 0) return 0;
    return Math.round(progress.reduce((sum, p) => sum + p.accuracy, 0) / progress.length);
  };

  const getTotalQuizzes = () => {
    return progress.reduce((sum, p) => sum + p.quizzesCompleted, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Welcome back, {user.name}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-medium hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Coins</CardTitle>
              <Coins className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{user.coins}</div>
              <p className="text-xs text-muted-foreground">
                +25 from last session
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{studyStats.streak}</div>
              <p className="text-xs text-muted-foreground">
                days in a row
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{getAverageAccuracy()}%</div>
              <p className="text-xs text-muted-foreground">
                across all subjects
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{Math.round(studyStats.totalMinutes / 60)}h</div>
              <p className="text-xs text-muted-foreground">
                this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Jump into your studies with these popular actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <HeroButton
                onClick={() => onNavigate('subjects')}
                className="h-auto p-6 flex-col gap-3"
                variant="default"
              >
                <BookOpen className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold">Study Subjects</div>
                  <div className="text-sm opacity-90">{subjects.length} subjects</div>
                </div>
              </HeroButton>

              <HeroButton
                onClick={() => onNavigate('quiz')}
                className="h-auto p-6 flex-col gap-3"
                variant="secondary"
              >
                <Brain className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold">Take Quiz</div>
                  <div className="text-sm opacity-90">{getTotalQuizzes()} completed</div>
                </div>
              </HeroButton>

              <HeroButton
                onClick={() => onNavigate('flashcards')}
                className="h-auto p-6 flex-col gap-3"
                variant="accent"
              >
                <Award className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold">Flashcards</div>
                  <div className="text-sm opacity-90">Study smart</div>
                </div>
              </HeroButton>

              <HeroButton
                onClick={() => onNavigate('chat')}
                className="h-auto p-6 flex-col gap-3"
                variant="outline"
              >
                <Brain className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold">AI Tutor</div>
                  <div className="text-sm opacity-90">Ask questions</div>
                </div>
              </HeroButton>
            </div>
          </CardContent>
        </Card>

        {/* Recent Subjects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Your Subjects
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('subjects')}
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No subjects yet</p>
                  <Button
                    onClick={() => onNavigate('subjects')}
                    className="mt-4"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Subject
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {subjects.slice(0, 3).map((subject) => {
                    const subjectProgress = progress.find(p => p.subjectId === subject.id);
                    return (
                      <div
                        key={subject.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-soft transition-all cursor-pointer"
                        onClick={() => onNavigate('subjects')}
                      >
                        <div>
                          <h3 className="font-semibold">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {subject.category} • {subject.difficulty}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {subjectProgress ? Math.round(subjectProgress.accuracy) : 0}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {subjectProgress?.quizzesCompleted || 0} quizzes
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse-soft"></div>
                  <div className="flex-1">
                    <p className="text-sm">Completed a quiz in Mathematics</p>
                    <p className="text-xs text-muted-foreground">Score: 85% • +25 coins</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Generated flashcards for Physics</p>
                    <p className="text-xs text-muted-foreground">15 new cards created</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1d ago</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Study session completed</p>
                    <p className="text-xs text-muted-foreground">45 minutes • +20 coins</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2d ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}