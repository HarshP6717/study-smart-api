import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroButton } from '@/components/ui/hero-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { appStore } from '@/lib/store';
import { ChatMessage } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Brain,
  Sparkles,
  Book,
  Target,
  Clock,
  Lightbulb
} from 'lucide-react';

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = () => {
    const history = appStore.getChatHistory();
    setMessages(history);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    // Add user message immediately
    const tempMessage: ChatMessage = {
      id: Date.now().toString(),
      message: userMessage,
      response: '',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await appStore.sendMessage(userMessage);
      
      // Update with AI response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, response }
            : msg
        )
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get response from AI tutor',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "Explain the concept of derivatives in calculus",
    "What are the key differences between photosynthesis and cellular respiration?",
    "How do I solve quadratic equations?",
    "Can you summarize the causes of World War I?",
    "What are the main principles of organic chemistry?",
    "Explain Newton's laws of motion with examples"
  ];

  const handleSuggestedQuestion = (question: string) => {
    setNewMessage(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl shadow-glow">
            <Brain className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Tutor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant help with your studies. Ask questions, clarify concepts, and deepen your understanding
          </p>
        </div>

        {/* Chat Container */}
        <Card className="shadow-medium h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Chat with AI Tutor
            </CardTitle>
            <CardDescription>
              Ask any academic question and get detailed explanations
            </CardDescription>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Welcome to AI Tutor!</h3>
                  <p className="text-muted-foreground mb-6">
                    Start a conversation by asking any academic question
                  </p>
                  
                  {/* Suggested Questions */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Try asking:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {suggestedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedQuestion(question)}
                          className="text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm"
                        >
                          "{question}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-4">
                      {/* User Message */}
                      <div className="flex justify-end">
                        <div className="flex items-start gap-3 max-w-[80%]">
                          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3">
                            <p className="text-sm">{message.message}</p>
                          </div>
                          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-primary-foreground" />
                          </div>
                        </div>
                      </div>

                      {/* AI Response */}
                      {message.response && (
                        <div className="flex justify-start">
                          <div className="flex items-start gap-3 max-w-[80%]">
                            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-secondary-foreground" />
                            </div>
                            <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                              <p className="text-sm leading-relaxed">{message.response}</p>
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                                <Badge variant="outline" className="text-xs">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  AI Generated
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading Indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-secondary-foreground" />
                        </div>
                        <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                            <span className="text-xs text-muted-foreground">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything about your studies..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <HeroButton
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                size="sm"
                className="gap-2 px-6"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </HeroButton>
            </div>
          </div>
        </Card>

        {/* Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-medium">
            <CardHeader className="text-center">
              <Book className="w-8 h-8 mx-auto mb-2 text-primary" />
              <CardTitle className="text-lg">Study Help</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Get explanations for complex topics and concepts
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader className="text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <CardTitle className="text-lg">Problem Solving</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Step-by-step solutions for homework and assignments
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-medium">
            <CardHeader className="text-center">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 text-accent" />
              <CardTitle className="text-lg">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Memory tricks and study strategies for better learning
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chat Stats */}
        {messages.length > 0 && (
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Chat Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/10">
                  <div className="text-2xl font-bold text-primary">{messages.length}</div>
                  <div className="text-sm text-muted-foreground">Questions Asked</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/10">
                  <div className="text-2xl font-bold text-secondary">
                    {messages.filter(m => m.response).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Responses</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/10">
                  <div className="text-2xl font-bold text-accent">
                    {Math.round(messages.reduce((sum, m) => sum + m.message.length, 0) / messages.length) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg. Question Length</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-warning/10">
                  <div className="text-2xl font-bold text-warning">100%</div>
                  <div className="text-sm text-muted-foreground">Response Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}