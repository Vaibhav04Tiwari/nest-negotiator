import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const MapPlanning = () => {
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
              <Input id="length" type="number" placeholder="e.g., 40" />
            </div>
            <div>
              <Label htmlFor="width">Plot width (ft)</Label>
              <Input id="width" type="number" placeholder="e.g., 30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Floors</Label>
              <Select defaultValue="1">
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
              <Select defaultValue="modern">
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
            onClick={() =>
              toast({
                title: "Payment required",
                description:
                  "To accept payments and deliver plans, connect Supabase + your payment provider. This is a demo UI.",
              })
            }
          >
            Proceed to Pay & Submit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapPlanning;
