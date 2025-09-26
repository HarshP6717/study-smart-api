import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroButton } from '@/components/ui/hero-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { appStore } from '@/lib/store';
import { Subject, Progress } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  BookOpen, 
  Trash2, 
  Edit, 
  BarChart3, 
  Brain,
  Target,
  Clock,
  Award
} from 'lucide-react';

export default function SubjectsManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = () => {
    setSubjects(appStore.getSubjects());
    setProgress(appStore.getProgress());
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSubject.name.trim() || !newSubject.category.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      appStore.addSubject({ ...newSubject, questionsCount: 0 });
      loadSubjects();
      setIsAddDialogOpen(false);
      setNewSubject({ name: '', category: '', difficulty: 'medium' });
      toast({
        title: 'Success!',
        description: 'Subject added successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add subject',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSubject = (id: string) => {
    if (appStore.deleteSubject(id)) {
      loadSubjects();
      toast({
        title: 'Success!',
        description: 'Subject deleted successfully'
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete subject',
        variant: 'destructive'
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-secondary text-secondary-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'hard': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSubjectProgress = (subjectId: string) => {
    return progress.find(p => p.subjectId === subjectId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Study Subjects
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Manage your study subjects and track your progress
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <HeroButton size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Add Subject
              </HeroButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogDescription>
                  Create a new subject to organize your study materials
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddSubject} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="subject-name">Subject Name</Label>
                  <Input
                    id="subject-name"
                    placeholder="e.g., Mathematics, Physics, History"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject-category">Category</Label>
                  <Input
                    id="subject-category"
                    placeholder="e.g., Science, Arts, Languages"
                    value={newSubject.category}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, category: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject-difficulty">Difficulty</Label>
                  <Select 
                    value={newSubject.difficulty} 
                    onValueChange={(value) => setNewSubject(prev => ({ ...prev, difficulty: value as any }))}
                  >
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
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <HeroButton type="submit" className="flex-1">
                    Add Subject
                  </HeroButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Subjects Grid */}
        {subjects.length === 0 ? (
          <Card className="text-center py-16 shadow-medium">
            <CardContent>
              <BookOpen className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No subjects yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by adding your first subject to begin studying
              </p>
              <HeroButton onClick={() => setIsAddDialogOpen(true)} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Subject
              </HeroButton>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
              const subjectProgress = getSubjectProgress(subject.id);
              
              return (
                <Card key={subject.id} className="shadow-medium hover:shadow-glow transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{subject.name}</CardTitle>
                        <CardDescription className="mt-1 capitalize">
                          {subject.category}
                        </CardDescription>
                      </div>
                      <Badge className={`capitalize ${getDifficultyColor(subject.difficulty)}`}>
                        {subject.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-primary/10">
                        <div className="text-2xl font-bold text-primary">
                          {subjectProgress ? Math.round(subjectProgress.accuracy) : 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-secondary/10">
                        <div className="text-2xl font-bold text-secondary">
                          {subjectProgress?.quizzesCompleted || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Quizzes</div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Brain className="w-4 h-4" />
                          Quiz
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Target className="w-4 h-4" />
                          Cards
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 gap-2"
                        >
                          <BarChart3 className="w-4 h-4" />
                          Progress
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteSubject(subject.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        {subjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center p-6 shadow-soft">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{subjects.length}</div>
              <div className="text-sm text-muted-foreground">Total Subjects</div>
            </Card>
            
            <Card className="text-center p-6 shadow-soft">
              <Brain className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold">
                {progress.reduce((sum, p) => sum + p.quizzesCompleted, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Quizzes Taken</div>
            </Card>
            
            <Card className="text-center p-6 shadow-soft">
              <Award className="w-8 h-8 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold">
                {progress.length > 0 ? Math.round(progress.reduce((sum, p) => sum + p.accuracy, 0) / progress.length) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Accuracy</div>
            </Card>
            
            <Card className="text-center p-6 shadow-soft">
              <Clock className="w-8 h-8 mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold">
                {subjects.filter(s => s.difficulty === 'hard').length}
              </div>
              <div className="text-sm text-muted-foreground">Hard Subjects</div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}