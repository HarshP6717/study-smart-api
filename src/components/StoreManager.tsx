import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeroButton } from '@/components/ui/hero-button';
import { Badge } from '@/components/ui/badge';
import { appStore } from '@/lib/store';
import { StoreItem, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  Store, 
  ShoppingCart, 
  Coins,
  Star,
  Award,
  Image,
  Crown,
  Sparkles,
  Gift,
  Zap,
  Trophy,
  Target,
  Heart
} from 'lucide-react';

export default function StoreManager() {
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'badge' | 'banner' | 'avatar'>('all');
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = () => {
    setStoreItems(appStore.getStoreItems());
    setUser(appStore.getCurrentUser());
  };

  const handlePurchase = async (itemId: string) => {
    const item = storeItems.find(i => i.id === itemId);
    if (!item || !user) return;

    if (user.coins < item.price) {
      toast({
        title: 'Insufficient Coins',
        description: `You need ${item.price - user.coins} more coins to purchase this item`,
        variant: 'destructive',
      });
      return;
    }

    setIsPurchasing(itemId);
    
    try {
      const result = appStore.purchaseStoreItem(itemId);
      if (result.success) {
        setUser(appStore.getCurrentUser());
        toast({
          title: 'Purchase Successful! 🎉',
          description: `You bought ${item.name} for ${item.price} coins`,
        });
      } else {
        toast({
          title: 'Purchase Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete purchase',
        variant: 'destructive',
      });
    } finally {
      setIsPurchasing(null);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'badge':
        return <Award className="w-6 h-6" />;
      case 'banner':
        return <Image className="w-6 h-6" />;
      case 'avatar':
        return <Crown className="w-6 h-6" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  const getItemBadgeColor = (type: string) => {
    switch (type) {
      case 'badge':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'banner':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'avatar':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-accent/10 text-accent border-accent/20';
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? storeItems 
    : storeItems.filter(item => item.type === selectedCategory);

  const hasItem = (itemId: string) => {
    const item = storeItems.find(i => i.id === itemId);
    if (!item || !user) return false;
    
    switch (item.type) {
      case 'avatar':
        return user.avatar === item.imageUrl;
      case 'banner':
        return user.banner === item.imageUrl;
      case 'badge':
        return user.badge === item.imageUrl;
      default:
        return false;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-medium">
            <CardContent className="text-center py-12">
              <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Please log in to access the store.</p>
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
            <Store className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Study Store
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Spend your hard-earned study coins on exclusive badges, banners, and avatars
          </p>
        </div>

        {/* User Coins */}
        <Card className="shadow-medium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center">
                  <Coins className="w-8 h-8 text-warning" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-warning">{user.coins}</h3>
                  <p className="text-sm text-muted-foreground">Study Coins Available</p>
                </div>
              </div>
              <div className="text-center">
                <Button variant="outline" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Earn More Coins
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete quizzes and study sessions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex justify-center gap-2">
          {(['all', 'badge', 'banner', 'avatar'] as const).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="capitalize gap-2"
            >
              {category === 'all' && <Store className="w-4 h-4" />}
              {category === 'badge' && <Award className="w-4 h-4" />}
              {category === 'banner' && <Image className="w-4 h-4" />}
              {category === 'avatar' && <Crown className="w-4 h-4" />}
              {category}
            </Button>
          ))}
        </div>

        {/* Store Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const owned = hasItem(item.id);
            const canAfford = user.coins >= item.price;
            
            return (
              <Card 
                key={item.id} 
                className={`shadow-medium hover:shadow-glow transition-all duration-300 ${
                  owned ? 'border-primary/50 bg-primary/5' : ''
                }`}
              >
                <CardHeader className="text-center">
                  <div className="relative">
                    <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center ${getItemBadgeColor(item.type)}`}>
                      {getItemIcon(item.type)}
                    </div>
                    {owned && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription className="text-center">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Badge className={`gap-1 ${getItemBadgeColor(item.type)}`}>
                      {item.type}
                    </Badge>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning flex items-center justify-center gap-1">
                      <Coins className="w-5 h-5" />
                      {item.price}
                    </div>
                    <p className="text-xs text-muted-foreground">Study Coins</p>
                  </div>

                  <div className="space-y-2">
                    {owned ? (
                      <Button disabled className="w-full gap-2">
                        <Star className="w-4 h-4" />
                        Owned
                      </Button>
                    ) : (
                      <HeroButton
                        onClick={() => handlePurchase(item.id)}
                        disabled={!canAfford || isPurchasing === item.id}
                        className="w-full gap-2"
                        variant={canAfford ? "default" : "outline"}
                      >
                        {isPurchasing === item.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Purchasing...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            {canAfford ? 'Purchase' : 'Insufficient Coins'}
                          </>
                        )}
                      </HeroButton>
                    )}
                    
                    {!canAfford && !owned && (
                      <p className="text-xs text-destructive text-center">
                        Need {item.price - user.coins} more coins
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* How to Earn Coins */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-warning" />
              How to Earn Study Coins
            </CardTitle>
            <CardDescription>
              Complete activities to earn coins and unlock exclusive items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold">Complete Quizzes</h4>
                <p className="text-sm text-muted-foreground">
                  Earn up to 50 coins based on your quiz performance
                </p>
                <Badge variant="outline" className="gap-1">
                  <Coins className="w-3 h-3" />
                  10-50 coins
                </Badge>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8 text-secondary" />
                </div>
                <h4 className="font-semibold">Study Sessions</h4>
                <p className="text-sm text-muted-foreground">
                  Get 5 coins for every 10 minutes of focused studying
                </p>
                <Badge variant="outline" className="gap-1">
                  <Coins className="w-3 h-3" />
                  5 coins/10min
                </Badge>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-accent" />
                </div>
                <h4 className="font-semibold">Daily Streaks</h4>
                <p className="text-sm text-muted-foreground">
                  Bonus coins for maintaining study streaks
                </p>
                <Badge variant="outline" className="gap-1">
                  <Coins className="w-3 h-3" />
                  Bonus rewards
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase History */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Your Collection
            </CardTitle>
            <CardDescription>
              Items you've purchased with study coins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg border">
                <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-warning" />
                </div>
                <h4 className="font-semibold">Badges</h4>
                <p className="text-2xl font-bold text-warning">
                  {storeItems.filter(item => item.type === 'badge' && hasItem(item.id)).length}
                </p>
                <p className="text-xs text-muted-foreground">owned</p>
              </div>

              <div className="text-center p-4 rounded-lg border">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Image className="w-6 h-6 text-secondary" />
                </div>
                <h4 className="font-semibold">Banners</h4>
                <p className="text-2xl font-bold text-secondary">
                  {storeItems.filter(item => item.type === 'banner' && hasItem(item.id)).length}
                </p>
                <p className="text-xs text-muted-foreground">owned</p>
              </div>

              <div className="text-center p-4 rounded-lg border">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold">Avatars</h4>
                <p className="text-2xl font-bold text-primary">
                  {storeItems.filter(item => item.type === 'avatar' && hasItem(item.id)).length}
                </p>
                <p className="text-xs text-muted-foreground">owned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Showcase */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive" />
              Special Offers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Limited Time: Scholar Pack</h4>
                    <p className="text-sm text-muted-foreground">Get 3 exclusive items for the price of 2</p>
                  </div>
                  <Badge variant="destructive">30% OFF</Badge>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-warning/10 to-accent/10 border border-warning/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Study Streak Bonus</h4>
                    <p className="text-sm text-muted-foreground">7-day streak unlocks exclusive avatar</p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}