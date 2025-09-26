import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroButton } from '@/components/ui/hero-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { appStore } from '@/lib/store';
import { Subject, CheatSheet } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  Plus, 
  FileText, 
  Download,
  Eye,
  Sparkles,
  BookOpen,
  Brain,
  Search,
  Copy,
  Share2
} from 'lucide-react';

export default function CheatSheetManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [cheatSheets, setCheatSheets] = useState<CheatSheet[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [viewingSheet, setViewingSheet] = useState<CheatSheet | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [generateForm, setGenerateForm] = useState({ subjectId: '', topic: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedSubject]);

  const loadData = () => {
    setSubjects(appStore.getSubjects());
    const sheets = selectedSubject === 'all' 
      ? appStore.getCheatSheets() 
      : appStore.getCheatSheets(selectedSubject);
    setCheatSheets(sheets);
  };

  const handleGenerateCheatSheet = async () => {
    if (!generateForm.subjectId || !generateForm.topic.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please select a subject and enter a topic',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const cheatSheet = await appStore.generateCheatSheet(generateForm.subjectId, generateForm.topic);
      setGenerateForm({ subjectId: '', topic: '' });
      setShowGenerateForm(false);
      loadData();
      setViewingSheet(cheatSheet);
      
      toast({
        title: 'Cheat Sheet Generated!',
        description: `Created study guide for ${generateForm.topic}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate cheat sheet',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSampleCheatSheets = async () => {
    if (subjects.length === 0) {
      toast({
        title: 'No Subjects',
        description: 'Create a subject first to generate sample cheat sheets',
        variant: 'destructive',
      });
      return;
    }

    const sampleTopics = [
      'Quadratic Equations',
      'Photosynthesis Process',
      'World War II Timeline',
      'Organic Chemistry Basics',
      'Newton\'s Laws of Motion'
    ];

    for (const topic of sampleTopics.slice(0, 3)) {
      await appStore.generateCheatSheet(subjects[0].id, topic);
    }

    loadData();
    toast({
      title: 'Sample Cheat Sheets Generated!',
      description: 'Created 3 sample study guides',
    });
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: 'Cheat sheet content copied to clipboard',
    });
  };

  const handleDownload = (sheet: CheatSheet) => {
    const element = document.createElement('a');
    const file = new Blob([sheet.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${sheet.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: 'Downloaded!',
      description: 'Cheat sheet saved to your device',
    });
  };

  const filteredCheatSheets = cheatSheets.filter(sheet =>
    sheet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sheet.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (viewingSheet) {
    const subject = subjects.find(s => s.id === viewingSheet.subjectId);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="outline"
                onClick={() => setViewingSheet(null)}
                className="mb-4"
              >
                ← Back to Cheat Sheets
              </Button>
              <h1 className="text-3xl font-bold">{viewingSheet.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                {subject && (
                  <Badge variant="outline">{subject.name}</Badge>
                )}
                <Badge variant="secondary">
                  {new Date(viewingSheet.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleCopyContent(viewingSheet.content)}
                size="sm"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownload(viewingSheet)}
                size="sm"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  toast({
                    title: 'Feature Coming Soon',
                    description: 'Share functionality will be available soon',
                  });
                }}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Content */}
          <Card className="shadow-medium">
            <CardContent className="p-8">
              <div className="prose prose-slate max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {viewingSheet.content}
                </pre>
              </div>
            </CardContent>
          </Card>
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
            <Zap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Cheat Sheets
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate comprehensive study guides and quick reference materials for any topic
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-4 w-full sm:w-auto">
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

            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search cheat sheets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {cheatSheets.length === 0 && (
              <Button
                onClick={generateSampleCheatSheets}
                variant="outline"
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Samples
              </Button>
            )}
            <HeroButton
              onClick={() => setShowGenerateForm(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Generate Cheat Sheet
            </HeroButton>
          </div>
        </div>

        {/* Generate Form */}
        {showGenerateForm && (
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Generate AI Cheat Sheet
              </CardTitle>
              <CardDescription>
                Create a comprehensive study guide for any topic using AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select 
                    value={generateForm.subjectId} 
                    onValueChange={(value) => setGenerateForm(prev => ({ ...prev, subjectId: value }))}
                  >
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

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="Enter specific topic or chapter"
                    value={generateForm.topic}
                    onChange={(e) => setGenerateForm(prev => ({ ...prev, topic: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowGenerateForm(false)}>
                  Cancel
                </Button>
                <HeroButton
                  onClick={handleGenerateCheatSheet}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </HeroButton>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cheat Sheets Grid */}
        {filteredCheatSheets.length === 0 ? (
          <Card className="shadow-medium">
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No matching cheat sheets' : 'No Cheat Sheets Yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Generate your first AI-powered study guide'}
              </p>
              {!searchQuery && (
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={generateSampleCheatSheets}
                    variant="outline"
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Samples
                  </Button>
                  <HeroButton
                    onClick={() => setShowGenerateForm(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Sheet
                  </HeroButton>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCheatSheets.map((sheet) => {
              const subject = subjects.find(s => s.id === sheet.subjectId);
              const previewText = sheet.content.slice(0, 200) + '...';
              
              return (
                <Card 
                  key={sheet.id} 
                  className="shadow-medium hover:shadow-glow transition-all duration-300 cursor-pointer group"
                  onClick={() => setViewingSheet(sheet)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {subject ? subject.name : 'General'}
                      </Badge>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyContent(sheet.content);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(sheet);
                          }}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{sheet.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-4">
                        {previewText}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        {new Date(sheet.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        View
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Study Tips */}
        {cheatSheets.length > 0 && (
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Study Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold">Quick Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Use cheat sheets for rapid review before exams
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6 text-secondary" />
                  </div>
                  <h4 className="font-semibold">Reference Guide</h4>
                  <p className="text-sm text-muted-foreground">
                    Keep important formulas and concepts handy
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                    <Share2 className="w-6 h-6 text-accent" />
                  </div>
                  <h4 className="font-semibold">Study Groups</h4>
                  <p className="text-sm text-muted-foreground">
                    Share cheat sheets with classmates for group study
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Collection Stats */}
        {cheatSheets.length > 0 && (
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Collection Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/10">
                  <div className="text-2xl font-bold text-primary">{cheatSheets.length}</div>
                  <div className="text-sm text-muted-foreground">Total Sheets</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/10">
                  <div className="text-2xl font-bold text-secondary">{subjects.length}</div>
                  <div className="text-sm text-muted-foreground">Subjects</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/10">
                  <div className="text-2xl font-bold text-accent">
                    {Math.round(cheatSheets.reduce((sum, sheet) => sum + sheet.content.length, 0) / cheatSheets.length / 100) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Length (100s)</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-warning/10">
                  <div className="text-2xl font-bold text-warning">
                    {cheatSheets.filter(sheet => 
                      new Date(sheet.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length}
                  </div>
                  <div className="text-sm text-muted-foreground">This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}