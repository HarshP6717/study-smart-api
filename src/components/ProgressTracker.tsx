import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroButton } from '@/components/ui/hero-button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { appStore } from '@/lib/store';
import { Subject, Progress as ProgressType } from '@/types';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  BookOpen,
  Brain,
  Clock,
  Star,
  Activity,
  BarChart3
} from 'lucide-react';

export default function ProgressTracker() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progressData, setProgressData] = useState<ProgressType[]>([]);
  const [studyHistory, setStudyHistory] = useState<{ date: string; minutes: number }[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    loadProgressData();
  }, [selectedPeriod]);

  const loadProgressData = () => {
    setSubjects(appStore.getSubjects());
    setProgressData(appStore.getProgress());
    setStudyHistory(appStore.getStudyHistory(selectedPeriod));
  };

  const getOverallStats = () => {
    const totalQuizzes = progressData.reduce((sum, p) => sum + p.quizzesCompleted, 0);
    const averageAccuracy = progressData.length > 0 
      ? Math.round(progressData.reduce((sum, p) => sum + p.accuracy, 0) / progressData.length)
      : 0;
    const totalStudyMinutes = studyHistory.reduce((sum, day) => sum + day.minutes, 0);
    const studyStreak = calculateStudyStreak();

    return {
      totalQuizzes,
      averageAccuracy,
      totalStudyMinutes,
      studyStreak,
    };
  };

  const calculateStudyStreak = () => {
    let streak = 0;
    for (let i = studyHistory.length - 1; i >= 0; i--) {
      if (studyHistory[i].minutes > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 90) return { level: 'Excellent', color: 'text-green-600', badge: 'A+' };
    if (accuracy >= 80) return { level: 'Good', color: 'text-blue-600', badge: 'A' };
    if (accuracy >= 70) return { level: 'Average', color: 'text-yellow-600', badge: 'B' };
    if (accuracy >= 60) return { level: 'Below Average', color: 'text-orange-600', badge: 'C' };
    return { level: 'Needs Improvement', color: 'text-red-600', badge: 'D' };
  };

  const getSubjectProgress = (subjectId: string) => {
    return progressData.find(p => p.subjectId === subjectId);
  };

  const generateWeeklyChart = () => {
    const lastWeek = studyHistory.slice(-7);
    const maxMinutes = Math.max(...lastWeek.map(d => d.minutes), 1);
    
    return lastWeek.map(day => ({
      ...day,
      percentage: (day.minutes / maxMinutes) * 100,
      dayName: new Date(day.date).toLocaleDateString('en', { weekday: 'short' })
    }));
  };

  const overallStats = getOverallStats();
  const weeklyChart = generateWeeklyChart();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl shadow-glow">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Progress Tracker
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Monitor your learning journey and celebrate your achievements
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-medium hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
              <Brain className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{overallStats.totalQuizzes}</div>
              <p className="text-xs text-muted-foreground">
                +3 from last week
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{overallStats.averageAccuracy}%</div>
              <p className="text-xs text-muted-foreground">
                +5% improvement
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {Math.round(overallStats.totalStudyMinutes / 60)}h
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedPeriod} days total
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              <Star className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{overallStats.studyStreak}</div>
              <p className="text-xs text-muted-foreground">
                days in a row
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Time Period Selector */}
        <div className="flex justify-center gap-2">
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              variant={selectedPeriod === days ? "default" : "outline"}
              onClick={() => setSelectedPeriod(days as 7 | 30 | 90)}
              size="sm"
            >
              {days} days
            </Button>
          ))}
        </div>

        {/* Weekly Activity Chart */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Weekly Study Activity
            </CardTitle>
            <CardDescription>
              Your study minutes for the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 h-32">
                {weeklyChart.map((day, index) => (
                  <div key={index} className="flex flex-col items-center justify-end space-y-2">
                    <div 
                      className="w-full bg-gradient-primary rounded-t-md transition-all duration-300 hover:opacity-80"
                      style={{ height: `${Math.max(day.percentage, 5)}%` }}
                      title={`${day.minutes} minutes on ${day.date}`}
                    />
                    <div className="text-xs text-muted-foreground font-medium">
                      {day.dayName}
                    </div>
                    <div className="text-xs text-primary font-bold">
                      {day.minutes}m
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Total: {weeklyChart.reduce((sum, day) => sum + day.minutes, 0)} minutes this week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Subject Performance
            </CardTitle>
            <CardDescription>
              Detailed breakdown of your progress in each subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No subjects found. Add subjects to track progress.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {subjects.map((subject) => {
                  const progress = getSubjectProgress(subject.id);
                  const performance = progress ? getPerformanceLevel(progress.accuracy) : null;
                  
                  return (
                    <div key={subject.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {subject.category} • {subject.difficulty}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {performance && (
                            <Badge variant="outline" className={performance.color}>
                              {performance.badge}
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            {progress?.quizzesCompleted || 0} quizzes
                          </Badge>
                        </div>
                      </div>
                      
                      {progress ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Accuracy</span>
                            <span className="text-sm font-bold">{Math.round(progress.accuracy)}%</span>
                          </div>
                          <Progress value={progress.accuracy} className="h-2" />
                          
                          <div className="grid grid-cols-3 gap-4 text-center text-sm">
                            <div>
                              <div className="font-semibold text-primary">{progress.quizzesCompleted}</div>
                              <div className="text-muted-foreground">Quizzes</div>
                            </div>
                            <div>
                              <div className="font-semibold text-secondary">{Math.round(progress.accuracy)}%</div>
                              <div className="text-muted-foreground">Accuracy</div>
                            </div>
                            <div>
                              <div className={`font-semibold ${performance?.color}`}>{performance?.level}</div>
                              <div className="text-muted-foreground">Level</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground text-sm">No progress data yet</p>
                          <p className="text-xs text-muted-foreground">Take a quiz to start tracking progress</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-warning" />
              Recent Achievements
            </CardTitle>
            <CardDescription>
              Milestones and accomplishments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
                <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Quiz Master</p>
                  <p className="text-sm text-muted-foreground">Completed 10 quizzes in a week</p>
                </div>
                <Badge variant="secondary">New!</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">High Scorer</p>
                  <p className="text-sm text-muted-foreground">Achieved 90%+ accuracy</p>
                </div>
                <Badge variant="outline">3 days ago</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Study Streak</p>
                  <p className="text-sm text-muted-foreground">7 consecutive days of studying</p>
                </div>
                <Badge variant="outline">1 week ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Summary */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Progress Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Study Goals</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Weekly Quiz Target</span>
                      <span>7/10</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Study Time Goal</span>
                      <span>8/10 hours</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Accuracy Target</span>
                      <span>85/90%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Next Milestones</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Trophy className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-medium text-sm">Century Club</p>
                      <p className="text-xs text-muted-foreground">Complete 100 quizzes</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">95/100</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Star className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Perfect Week</p>
                      <p className="text-xs text-muted-foreground">Study 7 days in a row</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">5/7</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Target className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="font-medium text-sm">Expert Level</p>
                      <p className="text-xs text-muted-foreground">Maintain 95%+ accuracy</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">85%</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}