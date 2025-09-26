import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroButton } from '@/components/ui/hero-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { appStore } from '@/lib/store';
import { Subject, StudySession } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Timer,
  Coffee,
  BookOpen,
  Target,
  Zap,
  Calendar,
  TrendingUp
} from 'lucide-react';

type TimerMode = 'pomodoro' | 'custom' | 'stopwatch';

export default function StudyTimer() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [duration, setDuration] = useState(25 * 60); // 25 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [studyHistory, setStudyHistory] = useState<{ date: string; minutes: number }[]>([]);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    setSubjects(appStore.getSubjects());
    setStudyHistory(appStore.getStudyHistory(7));
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }
  }, [timeLeft, isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (timerMode === 'pomodoro') {
      if (isBreak) {
        // Break completed, start next pomodoro
        setIsBreak(false);
        setTimeLeft(25 * 60);
        toast({
          title: 'Break Complete!',
          description: 'Ready for your next study session?',
        });
      } else {
        // Pomodoro completed
        setPomodoroCount(prev => prev + 1);
        const isLongBreak = (pomodoroCount + 1) % 4 === 0;
        const breakTime = isLongBreak ? 15 * 60 : 5 * 60; // 15 min long break, 5 min short break
        
        setIsBreak(true);
        setTimeLeft(breakTime);
        
        toast({
          title: 'Pomodoro Complete! 🍅',
          description: `Great job! Time for a ${isLongBreak ? 'long' : 'short'} break.`,
        });

        // Award coins for completed pomodoro
        const user = appStore.getCurrentUser();
        if (user) {
          appStore.updateUserCoins(user.coins + 25);
        }
      }
    } else {
      // Custom timer or stopwatch completed
      toast({
        title: 'Timer Complete!',
        description: 'Great study session completed!',
      });
    }

    // Stop current session if active
    if (currentSession) {
      handleStopSession();
    }
  };

  const handleStartTimer = () => {
    if (!selectedSubject && timerMode !== 'stopwatch') {
      toast({
        title: 'Select Subject',
        description: 'Please select a subject for your study session',
        variant: 'destructive',
      });
      return;
    }

    setIsRunning(true);
    setIsPaused(false);

    // Start study session
    if (selectedSubject) {
      const session = appStore.startStudySession(selectedSubject);
      setCurrentSession(session);
    }

    toast({
      title: 'Timer Started!',
      description: `Study session began ${isBreak ? 'for break time' : 'for ' + (timerMode === 'pomodoro' ? 'pomodoro' : 'custom timer')}`,
    });
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const handleResumeTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleStopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(duration);
    
    if (currentSession) {
      handleStopSession();
    }
  };

  const handleStopSession = () => {
    if (currentSession) {
      const completedSession = appStore.stopStudySession(currentSession.id);
      if (completedSession) {
        toast({
          title: 'Session Complete!',
          description: `You studied for ${completedSession.durationMinutes} minutes and earned ${Math.floor(completedSession.durationMinutes / 10) * 5} coins!`,
        });
      }
      setCurrentSession(null);
      setStudyHistory(appStore.getStudyHistory(7));
    }
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(duration);
    
    if (currentSession) {
      handleStopSession();
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (timerMode === 'stopwatch') return 0;
    return ((duration - timeLeft) / duration) * 100;
  };

  const getTimerColor = () => {
    if (isBreak) return 'text-secondary';
    if (timeLeft < 60) return 'text-destructive';
    if (timeLeft < 300) return 'text-warning';
    return 'text-primary';
  };

  const presetDurations = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    custom15: 15 * 60,
    custom30: 30 * 60,
    custom45: 45 * 60,
    custom60: 60 * 60,
  };

  const handlePresetSelect = (preset: keyof typeof presetDurations) => {
    const newDuration = presetDurations[preset];
    setDuration(newDuration);
    setTimeLeft(newDuration);
  };

  const todayStudyTime = studyHistory[studyHistory.length - 1]?.minutes || 0;
  const weeklyTotal = studyHistory.reduce((sum, day) => sum + day.minutes, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl shadow-glow">
            <Timer className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Study Timer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Focus your study sessions with Pomodoro technique and track your progress
          </p>
        </div>

        {/* Timer Mode Selection */}
        <div className="flex justify-center gap-2">
          {(['pomodoro', 'custom', 'stopwatch'] as TimerMode[]).map((mode) => (
            <Button
              key={mode}
              variant={timerMode === mode ? "default" : "outline"}
              onClick={() => {
                setTimerMode(mode);
                if (mode === 'pomodoro') {
                  setDuration(25 * 60);
                  setTimeLeft(25 * 60);
                } else if (mode === 'stopwatch') {
                  setDuration(0);
                  setTimeLeft(0);
                }
              }}
              className="capitalize"
            >
              {mode}
            </Button>
          ))}
        </div>

        {/* Main Timer Card */}
        <Card className="shadow-glow">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {isBreak ? (
                <Coffee className="w-6 h-6 text-secondary" />
              ) : (
                <BookOpen className="w-6 h-6 text-primary" />
              )}
              <CardTitle className="text-2xl">
                {isBreak ? 'Break Time' : timerMode === 'pomodoro' ? 'Pomodoro' : timerMode === 'custom' ? 'Custom Timer' : 'Study Session'}
              </CardTitle>
            </div>
            {timerMode === 'pomodoro' && (
              <div className="flex items-center justify-center gap-4">
                <Badge variant="outline" className="gap-1">
                  🍅 {pomodoroCount} completed
                </Badge>
                {isBreak && (
                  <Badge variant="secondary">
                    {pomodoroCount % 4 === 3 ? 'Long Break' : 'Short Break'}
                  </Badge>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {/* Timer Display */}
            <div className={`text-8xl font-bold ${getTimerColor()} transition-colors`}>
              {formatTime(timeLeft)}
            </div>

            {/* Progress */}
            {timerMode !== 'stopwatch' && (
              <div className="space-y-2">
                <Progress value={getProgress()} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {Math.round(getProgress())}% complete
                </p>
              </div>
            )}

            {/* Subject Selection */}
            {timerMode !== 'stopwatch' && (
              <div className="max-w-xs mx-auto">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject to study" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Timer Controls */}
            <div className="flex justify-center gap-4">
              {!isRunning && !isPaused ? (
                <HeroButton onClick={handleStartTimer} size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Start
                </HeroButton>
              ) : isRunning ? (
                <Button onClick={handlePauseTimer} size="lg" variant="outline" className="gap-2">
                  <Pause className="w-5 h-5" />
                  Pause
                </Button>
              ) : (
                <HeroButton onClick={handleResumeTimer} size="lg" className="gap-2">
                  <Play className="w-5 h-5" />
                  Resume
                </HeroButton>
              )}

              <Button onClick={handleStopTimer} size="lg" variant="destructive" className="gap-2">
                <Square className="w-5 h-5" />
                Stop
              </Button>

              <Button onClick={handleResetTimer} size="lg" variant="outline" className="gap-2">
                <RotateCcw className="w-5 h-5" />
                Reset
              </Button>
            </div>

            {/* Session Status */}
            {currentSession && (
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    Active study session in progress
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timer Presets */}
        {timerMode === 'custom' && (
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="text-center">Quick Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handlePresetSelect('custom15')}
                  className="h-16 flex flex-col gap-1"
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">15 min</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePresetSelect('custom30')}
                  className="h-16 flex flex-col gap-1"
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">30 min</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePresetSelect('custom45')}
                  className="h-16 flex flex-col gap-1"
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">45 min</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePresetSelect('custom60')}
                  className="h-16 flex flex-col gap-1"
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">60 min</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Study Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{todayStudyTime}m</div>
                  <p className="text-sm text-muted-foreground">minutes studied today</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily Goal</span>
                    <span>{Math.min(todayStudyTime, 120)}/120 min</span>
                  </div>
                  <Progress value={(todayStudyTime / 120) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                Weekly Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">{Math.round(weeklyTotal / 60)}h</div>
                  <p className="text-sm text-muted-foreground">{weeklyTotal} minutes this week</p>
                </div>
                <div className="grid grid-cols-7 gap-1 h-16">
                  {studyHistory.map((day, index) => {
                    const maxMinutes = Math.max(...studyHistory.map(d => d.minutes), 1);
                    const height = (day.minutes / maxMinutes) * 100;
                    return (
                      <div key={index} className="flex flex-col items-center justify-end">
                        <div 
                          className="w-full bg-secondary rounded-t-sm"
                          style={{ height: `${Math.max(height, 5)}%` }}
                          title={`${day.minutes} minutes`}
                        />
                        <span className="text-xs text-muted-foreground mt-1">
                          {new Date(day.date).toLocaleDateString('en', { weekday: 'narrow' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pomodoro Info */}
        {timerMode === 'pomodoro' && (
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-warning" />
                Pomodoro Technique
              </CardTitle>
              <CardDescription>
                Boost your productivity with focused study sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">🍅</span>
                  </div>
                  <h4 className="font-semibold">25 min Focus</h4>
                  <p className="text-sm text-muted-foreground">
                    Study with complete focus for 25 minutes
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
                    <Coffee className="w-6 h-6 text-secondary" />
                  </div>
                  <h4 className="font-semibold">5 min Break</h4>
                  <p className="text-sm text-muted-foreground">
                    Take a short break to recharge
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="w-6 h-6 text-accent" />
                  </div>
                  <h4 className="font-semibold">Repeat & Earn</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete cycles and earn study coins
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}