import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Home, X } from 'lucide-react';
import { VoiceAssistant } from '@/components/VoiceAssistant';

const TRADES = [
  'Mason', 'Carpenter', 'Electrician', 'Plumber', 'Painter', 
  'Welder', 'Tiler', 'Roofer', 'Landscaper', 'General Labour'
];

const SKILLS_OPTIONS = [
  'Brick laying', 'Concrete work', 'Plastering', 'Woodworking', 'Furniture making',
  'House wiring', 'Panel installation', 'Pipe installation', 'Bathroom fitting',
  'Interior painting', 'Exterior painting', 'Spray painting', 'Arc welding',
  'MIG welding', 'Floor tiling', 'Wall tiling', 'Waterproofing', 'Metal roofing',
  'Tile roofing', 'Garden design', 'Tree cutting', 'Site cleanup'
];

const LabourRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    trade: '',
    experienceYears: '',
    ratePerDay: '',
    bio: '',
    avatarUrl: ''
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to register as labour",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('labour_profiles')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          city: formData.city,
          trade: formData.trade,
          experience_years: parseInt(formData.experienceYears),
          rate_per_day: parseInt(formData.ratePerDay),
          bio: formData.bio,
          avatar_url: formData.avatarUrl || null,
          skills: selectedSkills,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already registered",
            description: "You have already registered as a labour professional",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Registration successful!",
          description: "Your labour profile has been created successfully",
        });
        navigate('/marketplace');
      }
    } catch (error) {
      console.error('Error creating labour profile:', error);
      toast({
        title: "Registration failed",
        description: "There was an error creating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to register as a labour professional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/auth">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Register as Labour - BuildMate</title>
        <meta name="description" content="Join BuildMate as a skilled labour professional and connect with customers looking for construction services." />
      </Helmet>

      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Register as Labour Professional</CardTitle>
              <CardDescription>
                Create your profile to connect with customers looking for skilled labour
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trade">Primary Trade *</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, trade: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your trade" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRADES.map((trade) => (
                          <SelectItem key={trade} value={trade}>
                            {trade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Rate per Day (₹) *</Label>
                    <Input
                      id="rate"
                      type="number"
                      min="0"
                      value={formData.ratePerDay}
                      onChange={(e) => setFormData(prev => ({ ...prev, ratePerDay: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Profile Photo URL (optional)</Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    placeholder="https://example.com/your-photo.jpg"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Skills & Specializations</Label>
                  <Select onValueChange={addSkill}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add skills" />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILLS_OPTIONS.filter(skill => !selectedSkills.includes(skill)).map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio & Experience Details</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell customers about your experience, specializations, and what makes you stand out..."
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Register as Labour Professional
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Voice Assistant for labour registration help */}
      <VoiceAssistant context="labour" />
    </div>
  );
};

export default LabourRegistration;