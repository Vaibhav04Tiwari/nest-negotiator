import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapEditor as MapEditorComponent } from "@/components/MapEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const MapEditor = () => {
  const [searchParams] = useSearchParams();
  const [planData, setPlanData] = useState(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      // In a real app, you'd verify the payment and get plan data
      // For now, we'll simulate getting the plan data
      setPlanData({
        length: 40,
        width: 30,
        floors: "1",
        style: "modern"
      });
      
      toast({
        title: "Payment Successful!",
        description: "Welcome to your house plan editor. Start designing your dream home!",
      });
    }
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need to complete payment to access the map editor.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>House Map Editor | BuildMate</title>
        <meta name="description" content="Design and customize your house plan with our interactive map editor. Create rooms, arrange layouts, and visualize your dream home." />
        <link rel="canonical" href={window.location.origin + "/map-editor"} />
      </Helmet>

      <MapEditorComponent planData={planData} />
    </div>
  );
};

export default MapEditor;