import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { MessageSquare, Star, MapPin, Phone, Calendar, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { AutoVoiceGreeting } from "@/components/AutoVoiceGreeting";

interface Labour {
  id: string;
  full_name: string;
  trade: string;
  city: string;
  rating: number;
  total_reviews: number;
  rate_per_day: number;
  avatar_url: string | null;
  phone: string;
  experience_years: number;
  bio: string | null;
  skills: string[] | null;
  is_verified: boolean;
}

const trades = ["All", "Mason", "Carpenter", "Electrician", "Plumber", "Painter", "Welder", "Tiler", "Roofer", "Landscaper", "General Labour"];

const Marketplace = () => {
  const [selectedTrade, setSelectedTrade] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [labour, setLabour] = useState<Labour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabour();
  }, []);

  const fetchLabour = async () => {
    try {
      const { data, error } = await supabase
        .from('labour_profiles')
        .select('*')
        .eq('is_available', true)
        .order('rating', { ascending: false });

      if (error) {
        console.error('Error fetching labour:', error);
      } else {
        setLabour(data || []);
      }
    } catch (error) {
      console.error('Error fetching labour:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLabour = useMemo(() => {
    return labour.filter(labourItem => {
      const matchesTrade = selectedTrade === "All" || labourItem.trade === selectedTrade;
      const matchesSearch = searchQuery === "" || 
        labourItem.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        labourItem.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTrade && matchesSearch;
    });
  }, [labour, selectedTrade, searchQuery]);

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>Find Construction Labour Near You | BuildMate</title>
        <meta name="description" content="Browse skilled labour professionals and connect with them to discuss your construction project needs." />
        <link rel="canonical" href={window.location.origin + "/marketplace"} />
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Skilled Labour</h1>
        <p className="text-muted-foreground">Connect with verified construction professionals in your area</p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="Search by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {trades.map((trade) => (
            <Button
              key={trade}
              variant={selectedTrade === trade ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTrade(trade)}
            >
              {trade}
            </Button>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading labour professionals...</span>
          </div>
        ) : filteredLabour.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No labour found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button asChild>
              <a href="/labour-registration">Register as Labour Professional</a>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLabour.map((labourItem) => (
              <Card key={labourItem.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={labourItem.avatar_url || "/placeholder.svg"} alt={labourItem.full_name} />
                      <AvatarFallback>{labourItem.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{labourItem.full_name}</h3>
                        {labourItem.is_verified && (
                          <Badge variant="default" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <Badge variant="secondary">{labourItem.trade}</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {labourItem.city}
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {labourItem.rating} ({labourItem.total_reviews} reviews)
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      ₹{labourItem.rate_per_day.toLocaleString()}/day • {labourItem.experience_years}yr exp
                    </div>
                  </div>

                  {labourItem.skills && labourItem.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {labourItem.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {labourItem.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{labourItem.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Contact & Chat
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                          <DrawerTitle>Chat with {labourItem.full_name}</DrawerTitle>
                          <DrawerDescription>
                            Start a conversation to discuss your project needs
                          </DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 pb-0">
                          {labourItem.bio && (
                            <div className="mb-4 p-3 bg-muted rounded-lg">
                              <h4 className="font-medium text-sm mb-1">About</h4>
                              <p className="text-sm text-muted-foreground">{labourItem.bio}</p>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Input
                              placeholder="Type your message..."
                              className="flex-1"
                              disabled
                            />
                            <Button size="sm" disabled>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Chat feature coming soon!
                          </p>
                        </div>
                        <DrawerFooter>
                          <div className="flex items-center justify-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {labourItem.phone}
                            </div>
                          </div>
                        </DrawerFooter>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-2">Are you a skilled labour professional?</h3>
        <p className="text-muted-foreground mb-4">Join our platform and connect with customers looking for your services</p>
        <Button asChild>
          <a href="/labour-registration">Register as Labour Professional</a>
        </Button>
      </div>
      
      {/* Auto-greeting Voice Assistant for easy navigation */}
      <AutoVoiceGreeting context="general" />
    </div>
  );
};

export default Marketplace;