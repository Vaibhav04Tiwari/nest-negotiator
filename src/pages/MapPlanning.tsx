import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MapPlanning = () => {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [floors, setFloors] = useState("1");
  const [style, setStyle] = useState("modern");
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!length || !width) {
      toast({
        title: "Missing Information",
        description: "Please fill in the plot dimensions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          planData: {
            length: parseInt(length),
            width: parseInt(width),
            floors,
            style,
          }
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>House Map Planning Service | BuildMate</title>
        <meta name="description" content="Request professional house map planning tailored to your plot size, floors, and style. Pay securely to receive your plan." />
        <link rel="canonical" href={window.location.origin + "/map-planning"} />
      </Helmet>

      <Card>
        <CardHeader>
          <CardTitle>Request Your House Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="length">Plot length (ft)</Label>
              <Input 
                id="length" 
                type="number" 
                placeholder="e.g., 40" 
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="width">Plot width (ft)</Label>
              <Input 
                id="width" 
                type="number" 
                placeholder="e.g., 30" 
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Floors</Label>
              <Select value={floors} onValueChange={setFloors}>
                <SelectTrigger>
                  <SelectValue placeholder="Select floors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Single Floor</SelectItem>
                  <SelectItem value="2">Duplex / 2 Floors</SelectItem>
                  <SelectItem value="3">3 Floors</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="traditional">Traditional</SelectItem>
                  <SelectItem value="contemporary">Contemporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            variant="hero"
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Processing..." : "Pay $99.99 & Start Designing"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapPlanning;
