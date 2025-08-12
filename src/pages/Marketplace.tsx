import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users2 } from "lucide-react";

type Labour = { id: string; name: string; trade: string; rate: string; rating: number; city: string };

const LABOUR: Labour[] = [
  { id: "1", name: "Ravi Sharma", trade: "Mason", rate: "₹ 700/day", rating: 4.6, city: "Delhi" },
  { id: "2", name: "Amit Kumar", trade: "Carpenter", rate: "₹ 900/day", rating: 4.4, city: "Lucknow" },
  { id: "3", name: "Sita Verma", trade: "Painter", rate: "₹ 650/day", rating: 4.8, city: "Jaipur" },
  { id: "4", name: "Imran Ali", trade: "Electrician", rate: "₹ 850/day", rating: 4.5, city: "Mumbai" },
];

const trades = ["All", "Mason", "Carpenter", "Painter", "Electrician"] as const;

const Marketplace = () => {
  const [trade, setTrade] = useState<(typeof trades)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      LABOUR.filter(
        (l) => (trade === "All" || l.trade === trade) &&
          (l.name.toLowerCase().includes(query.toLowerCase()) || l.city.toLowerCase().includes(query.toLowerCase()))
      ),
    [trade, query]
  );

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>Find Construction Labour Near You | BuildMate</title>
        <meta name="description" content="Browse skilled labour and connect with them via in-site chat to discuss scope and bargain prices (demo)." />
        <link rel="canonical" href={window.location.origin + "/marketplace"} />
      </Helmet>

      <div className="mb-6 flex flex-col md:flex-row items-stretch gap-4">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Search by name/city</Label>
            <Input placeholder="e.g., Ravi or Delhi" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div>
            <Label>Trade</Label>
            <div className="flex gap-2 flex-wrap">
              {trades.map((t) => (
                <Button key={t} variant={t === trade ? "hero" : "outline"} size="sm" onClick={() => setTrade(t)}>
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((l) => (
          <Card key={l.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{l.name.split(" ").map((n)=>n[0]).slice(0,2).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{l.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{l.trade} • {l.city}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{l.rate} • ⭐ {l.rating}</p>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="hero">Chat (Demo)</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Chat with {l.name}</DrawerTitle>
                  </DrawerHeader>
                  <div className="px-4 pb-6">
                    <div className="mb-3 text-sm text-muted-foreground">
                      Realtime chat and bargaining requires Supabase setup. This is a demo.
                    </div>
                    <div className="h-48 rounded-md border p-3 text-sm overflow-y-auto space-y-2">
                      <div className="rounded-md bg-secondary p-2 w-fit max-w-[80%]">Hello! Are you available this week?</div>
                      <div className="rounded-md bg-brand-muted p-2 w-fit max-w-[80%] ml-auto">Yes, I am. What is the site location and scope?</div>
                    </div>
                    <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                      <Input disabled placeholder="Type a message (connect backend to enable)" />
                      <Button disabled>Send</Button>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
        <Users2 className="h-4 w-4" />
        Tip: After connecting Supabase, we can enable authentication, chat, and bookings.
      </div>
    </div>
  );
};

export default Marketplace;
