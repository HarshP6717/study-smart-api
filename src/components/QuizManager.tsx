import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroButton } from '@/components/ui/hero-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { appStore } from '@/lib/store';
import { Subject, Question, QuizResult } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Play, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  Clock,
  RotateCcw,
  Sparkles,
  Target
} from 'lucide-react';

export default function QuizManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setSubjects(appStore.getSubjects());
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizStartTime && !showResults) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - quizStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStartTime, showResults]);

  const handleGenerateQuiz = async () => {
    if (!selectedSubject || !topic) {
      toast({
        title: 'Missing Information',
        description: 'Please select a subject and enter a topic',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const questions = await appStore.generateQuiz(selectedSubject, topic, difficulty, questionCount);
      setCurrentQuiz(questions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setShowResults(false);
      setQuizStartTime(new Date());
      setTimeElapsed(0);
      
      toast({
        title: 'Quiz Generated!',
        description: `Created ${questions.length} questions for ${topic}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate quiz',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    const results: QuizResult = {
      score: Object.entries(selectedAnswers).reduce((score, [qIndex, answer]) => {
        const question = currentQuiz[parseInt(qIndex)];
        return score + (question.correctIndex === answer ? 1 : 0);
      }, 0),
      totalQuestions: currentQuiz.length,
      timeSpent: timeElapsed,
      answers: selectedAnswers,
    };

    appStore.submitQuizResults(selectedSubject, results);
    setShowResults(true);

    const percentage = Math.round((results.score / results.totalQuestions) * 100);
    toast({
      title: 'Quiz Completed!',
      description: `You scored ${results.score}/${results.totalQuestions} (${percentage}%)`,
    });
  };

  const handleRestartQuiz = () => {
    setCurrentQuiz([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizStartTime(null);
    setTimeElapsed(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return Math.round(((currentQuestionIndex + 1) / currentQuiz.length) * 100);
  };

  const getScorePercentage = () => {
    if (!showResults) return 0;
    const correct = Object.entries(selectedAnswers).reduce((score, [qIndex, answer]) => {
      const question = currentQuiz[parseInt(qIndex)];
      return score + (question.correctIndex === answer ? 1 : 0);
    }, 0);
    return Math.round((correct / currentQuiz.length) * 100);
  };

  if (showResults) {
    const correctAnswers = Object.entries(selectedAnswers).reduce((score, [qIndex, answer]) => {
      const question = currentQuiz[parseInt(qIndex)];
      return score + (question.correctIndex === answer ? 1 : 0);
    }, 0);
    const percentage = Math.round((correctAnswers / currentQuiz.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl shadow-glow">
              <Trophy className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Quiz Results
            </h1>
          </div>

          <Card className="shadow-glow">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">
                {correctAnswers}/{currentQuiz.length}
              </CardTitle>
              <CardDescription className="text-lg">
                {percentage}% Accuracy • {formatTime(timeElapsed)} elapsed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="w-full">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Score</span>
                  <span>{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-secondary/10">
                  <CheckCircle className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-secondary">{correctAnswers}</p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-destructive/10">
                  <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-2xl font-bold text-destructive">{currentQuiz.length - correctAnswers}</p>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-warning/10">
                  <Clock className="w-8 h-8 text-warning mx-auto mb-2" />
                  <p className="text-2xl font-bold text-warning">{formatTime(timeElapsed)}</p>
                  <p className="text-sm text-muted-foreground">Time</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <HeroButton onClick={handleRestartQuiz} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Quiz
                </HeroButton>
                <HeroButton 
                  onClick={() => {
                    // Show detailed review
                    toast({
                      title: 'Feature Coming Soon',
                      description: 'Detailed answer review will be available soon',
                    });
                  }}
                  variant="secondary"
                >
                  Review Answers
                </HeroButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentQuiz.length > 0) {
    const currentQuestion = currentQuiz[currentQuestionIndex];
    const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
    const canSubmit = Object.keys(selectedAnswers).length === currentQuiz.length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quiz Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Quiz in Progress</h1>
              <p className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {currentQuiz.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2">
                <Clock className="w-4 h-4" />
                {formatTime(timeElapsed)}
              </Badge>
              <Badge variant="secondary" className="gap-2">
                <Target className="w-4 h-4" />
                {difficulty}
              </Badge>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="text-xl leading-relaxed">
                {currentQuestion.text}
              </CardTitle>
              <Badge variant="outline" className="w-fit">
                {currentQuestion.difficulty}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <span className="font-medium mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>

              {isAnswered && currentQuestion.explanation && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Explanation:</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {currentQuiz.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                    index === currentQuestionIndex
                      ? 'bg-primary text-primary-foreground'
                      : selectedAnswers[index] !== undefined
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex === currentQuiz.length - 1 ? (
              <HeroButton
                onClick={handleSubmitQuiz}
                disabled={!canSubmit}
                className="gap-2"
              >
                <Trophy className="w-4 h-4" />
                Submit Quiz
              </HeroButton>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === currentQuiz.length - 1}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl shadow-glow">
            <Brain className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Quiz Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate personalized quizzes with AI to test your knowledge and improve your understanding
          </p>
        </div>

        {/* Quiz Generation Form */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Create New Quiz
            </CardTitle>
            <CardDescription>
              Customize your quiz by selecting subject, topic, and difficulty level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {subjects.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No subjects found. Add a subject first.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="Enter specific topic or chapter"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                    <SelectItem value="20">20 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <HeroButton
              onClick={handleGenerateQuiz}
              disabled={isGenerating || !selectedSubject || !topic}
              className="w-full gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Generate Quiz
                </>
              )}
            </HeroButton>
          </CardContent>
        </Card>

        {/* Recent Quizzes */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Recent Quiz Activity</CardTitle>
            <CardDescription>
              Your latest quiz attempts and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Mathematics Quiz</p>
                  <p className="text-xs text-muted-foreground">Algebra • 8/10 correct • 85%</p>
                </div>
                <Badge variant="secondary">A</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
                <Target className="w-5 h-5 text-warning" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Physics Quiz</p>
                  <p className="text-xs text-muted-foreground">Mechanics • 6/10 correct • 60%</p>
                </div>
                <Badge variant="outline">C</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                <Brain className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Chemistry Quiz</p>
                  <p className="text-xs text-muted-foreground">Organic Chemistry • 9/10 correct • 90%</p>
                </div>
                <Badge className="bg-primary text-primary-foreground">A+</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}