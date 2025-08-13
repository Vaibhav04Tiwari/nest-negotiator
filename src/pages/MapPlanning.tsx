import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const MapPlanning = () => {
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [floors, setFloors] = useState("1");
  const [style, setStyle] = useState("modern");
  const [isLoading, setIsLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

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
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay script");
      }

      // Create order
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

      // Configure Razorpay options
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "BuildMate",
        description: "House Plan Design",
        order_id: data.order_id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const { error: verifyError } = await supabase.functions.invoke('verify-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            });

            if (verifyError) throw verifyError;

            toast({
              title: "Payment Successful!",
              description: "Redirecting to map editor...",
            });

            // Redirect to map editor
            window.location.href = `/map-editor?order_id=${response.razorpay_order_id}`;
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
        },
        theme: {
          color: "#3b82f6"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
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
            {isLoading ? "Processing..." : "Pay ₹8,300 & Start Designing"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapPlanning;
