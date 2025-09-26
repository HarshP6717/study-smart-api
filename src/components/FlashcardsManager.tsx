import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroButton } from '@/components/ui/hero-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { appStore } from '@/lib/store';
import { Subject, Flashcard } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  Target, 
  Plus, 
  RotateCw, 
  Eye, 
  EyeOff,
  Shuffle,
  BookOpen,
  Brain,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  X
} from 'lucide-react';

export default function FlashcardsManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyStats, setStudyStats] = useState({ correct: 0, incorrect: 0 });
  const [newCard, setNewCard] = useState({ front: '', back: '', subjectId: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedSubject]);

  const loadData = () => {
    setSubjects(appStore.getSubjects());
    const cards = selectedSubject === 'all' 
      ? appStore.getFlashcards() 
      : appStore.getFlashcards(selectedSubject);
    setFlashcards(cards);
  };

  const handleCreateCard = () => {
    if (!newCard.front.trim() || !newCard.back.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in both front and back of the flashcard',
        variant: 'destructive',
      });
      return;
    }

    try {
      appStore.addFlashcard({
        front: newCard.front,
        back: newCard.back,
        subjectId: newCard.subjectId || undefined,
      });
      
      setNewCard({ front: '', back: '', subjectId: '' });
      setShowCreateForm(false);
      loadData();
      
      toast({
        title: 'Success!',
        description: 'Flashcard created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create flashcard',
        variant: 'destructive',
      });
    }
  };

  const handleStartStudy = () => {
    if (flashcards.length === 0) {
      toast({
        title: 'No Flashcards',
        description: 'Create some flashcards first to start studying',
        variant: 'destructive',
      });
      return;
    }
    
    setStudyMode(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setStudyStats({ correct: 0, incorrect: 0 });
    
    // Shuffle flashcards for better learning
    setFlashcards(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // End study session
      setStudyMode(false);
      const total = studyStats.correct + studyStats.incorrect;
      const percentage = total > 0 ? Math.round((studyStats.correct / total) * 100) : 0;
      
      toast({
        title: 'Study Session Complete!',
        description: `You got ${studyStats.correct}/${total} correct (${percentage}%)`,
      });
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleMarkCorrect = () => {
    setStudyStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    handleNextCard();
  };

  const handleMarkIncorrect = () => {
    setStudyStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    handleNextCard();
  };

  const generateSampleFlashcards = () => {
    if (subjects.length === 0) {
      toast({
        title: 'No Subjects',
        description: 'Create a subject first to generate sample flashcards',
        variant: 'destructive',
      });
      return;
    }

    const sampleCards = [
      {
        front: 'What is the derivative of x²?',
        back: '2x',
        subjectId: subjects[0].id,
      },
      {
        front: 'What is the capital of France?',
        back: 'Paris',
        subjectId: subjects[0].id,
      },
      {
        front: 'What is the speed of light?',
        back: '299,792,458 meters per second',
        subjectId: subjects[0].id,
      },
      {
        front: 'Who wrote "Romeo and Juliet"?',
        back: 'William Shakespeare',
        subjectId: subjects[0].id,
      },
      {
        front: 'What is the formula for area of a circle?',
        back: 'πr²',
        subjectId: subjects[0].id,
      },
    ];

    sampleCards.forEach(card => {
      appStore.addFlashcard(card);
    });

    loadData();
    toast({
      title: 'Sample Cards Generated!',
      description: `Created ${sampleCards.length} sample flashcards`,
    });
  };

  if (studyMode) {
    const currentCard = flashcards[currentCardIndex];
    const progress = Math.round(((currentCardIndex + 1) / flashcards.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Study Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Study Session</h1>
              <p className="text-muted-foreground">
                Card {currentCardIndex + 1} of {flashcards.length}
              </p>
            </div>
            <Button variant="outline" onClick={() => setStudyMode(false)}>
              Exit Study
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 justify-center">
            <Badge variant="secondary" className="gap-2">
              <Check className="w-4 h-4" />
              Correct: {studyStats.correct}
            </Badge>
            <Badge variant="destructive" className="gap-2">
              <X className="w-4 h-4" />
              Incorrect: {studyStats.incorrect}
            </Badge>
          </div>

          {/* Flashcard */}
          <Card className="shadow-glow min-h-[400px]">
            <CardContent className="p-8 flex flex-col justify-center items-center text-center space-y-6">
              <div className="w-full">
                <Badge variant="outline" className="mb-4">
                  {showAnswer ? 'Answer' : 'Question'}
                </Badge>
                <div className="text-2xl font-medium leading-relaxed mb-6">
                  {showAnswer ? currentCard.back : currentCard.front}
                </div>
              </div>

              <div className="flex gap-4">
                {!showAnswer ? (
                  <HeroButton 
                    onClick={() => setShowAnswer(true)}
                    size="lg"
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Show Answer
                  </HeroButton>
                ) : (
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleMarkIncorrect}
                      variant="destructive"
                      size="lg"
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Incorrect
                    </Button>
                    <HeroButton 
                      onClick={handleMarkCorrect}
                      size="lg"
                      className="gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Correct
                    </HeroButton>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePreviousCard}
              disabled={currentCardIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {flashcards.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentCardIndex
                      ? 'bg-primary'
                      : index < currentCardIndex
                      ? 'bg-secondary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={handleNextCard}
              className="gap-2"
            >
              {currentCardIndex === flashcards.length - 1 ? 'Finish' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl shadow-glow">
            <Target className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Smart Flashcards
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create and study with intelligent flashcards to reinforce your learning
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            {flashcards.length === 0 && (
              <Button
                onClick={generateSampleFlashcards}
                variant="outline"
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Samples
              </Button>
            )}
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Card
            </Button>
            <HeroButton
              onClick={handleStartStudy}
              disabled={flashcards.length === 0}
              className="gap-2"
            >
              <Brain className="w-4 h-4" />
              Start Study
            </HeroButton>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Create New Flashcard
              </CardTitle>
              <CardDescription>
                Add a new flashcard to your collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="front">Front (Question)</Label>
                  <Textarea
                    id="front"
                    placeholder="Enter the question or prompt"
                    value={newCard.front}
                    onChange={(e) => setNewCard(prev => ({ ...prev, front: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="back">Back (Answer)</Label>
                  <Textarea
                    id="back"
                    placeholder="Enter the answer or explanation"
                    value={newCard.back}
                    onChange={(e) => setNewCard(prev => ({ ...prev, back: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subject (Optional)</Label>
                <Select value={newCard.subjectId} onValueChange={(value) => setNewCard(prev => ({ ...prev, subjectId: value }))}>
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
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <HeroButton onClick={handleCreateCard}>
                  Create Card
                </HeroButton>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flashcards Grid */}
        {flashcards.length === 0 ? (
          <Card className="shadow-medium">
            <CardContent className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Flashcards Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first flashcard to start studying smarter
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={generateSampleFlashcards}
                  variant="outline"
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Samples
                </Button>
                <HeroButton
                  onClick={() => setShowCreateForm(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create First Card
                </HeroButton>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map((card, index) => {
              const subject = subjects.find(s => s.id === card.subjectId);
              return (
                <Card 
                  key={card.id} 
                  className="shadow-medium hover:shadow-glow transition-all duration-300 cursor-pointer group"
                  onClick={() => {
                    setCurrentCardIndex(index);
                    setStudyMode(true);
                    setShowAnswer(false);
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {subject ? subject.name : 'General'}
                      </Badge>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Front:</p>
                      <p className="text-sm line-clamp-3">{card.front}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Back:</p>
                      <p className="text-sm line-clamp-2 opacity-75">{card.back}</p>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Click to study this card
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Study Stats */}
        {flashcards.length > 0 && (
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Collection Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/10">
                  <div className="text-2xl font-bold text-primary">{flashcards.length}</div>
                  <div className="text-sm text-muted-foreground">Total Cards</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/10">
                  <div className="text-2xl font-bold text-secondary">{subjects.length}</div>
                  <div className="text-sm text-muted-foreground">Subjects</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/10">
                  <div className="text-2xl font-bold text-accent">85%</div>
                  <div className="text-sm text-muted-foreground">Avg. Score</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-warning/10">
                  <div className="text-2xl font-bold text-warning">12</div>
                  <div className="text-sm text-muted-foreground">Study Sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}