import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "@/hooks/use-toast";

const QUALITY_RATES = {
  economy: 1200,
  standard: 1600,
  premium: 2200,
};

const CITY_FACTORS = {
  metro: 1.15,
  tier1: 1.05,
  tier2: 1,
};

const Calculator = () => {
  const [area, setArea] = useState(1200);
  const [floors, setFloors] = useState(1);
  const [quality, setQuality] = useState<keyof typeof QUALITY_RATES>("standard");
  const [city, setCity] = useState<keyof typeof CITY_FACTORS>("tier2");

  const estimate = useMemo(() => {
    const base = QUALITY_RATES[quality] * area * floors * CITY_FACTORS[city];
    const materials = base * 0.6;
    const labour = base * 0.3;
    const services = base * 0.1;
    return { base: Math.round(base), materials, labour, services };
  }, [area, floors, quality, city]);

  const data = [
    { name: "Materials", value: estimate.materials },
    { name: "Labour", value: estimate.labour },
    { name: "Services", value: estimate.services },
  ];

  const COLORS = ["hsl(var(--brand))", "hsl(var(--primary))", "hsl(var(--muted-foreground))"];

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>Construction Budget Calculator | BuildMate</title>
        <meta name="description" content="Calculate house construction budget by area, quality, floors, and city factors with a clear cost breakdown." />
        <link rel="canonical" href={window.location.origin + "/calculator"} />
      </Helmet>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enter Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area">Built-up area (sq ft)</Label>
                <Input id="area" type="number" value={area} min={100} onChange={(e) => setArea(Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="floors">Floors</Label>
                <Input id="floors" type="number" value={floors} min={1} onChange={(e) => setFloors(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quality</Label>
                <Select value={quality} onValueChange={(v: any) => setQuality(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>City type</Label>
                <Select value={city} onValueChange={(v: any) => setCity(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metro">Metro</SelectItem>
                    <SelectItem value="tier1">Tier-1</SelectItem>
                    <SelectItem value="tier2">Tier-2/Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              variant="hero"
              onClick={() => toast({ title: "Estimate updated", description: "Scroll to see the breakdown." })}
            >
              Update Estimate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimated Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹ {estimate.base.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Approximate total cost</p>

            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `₹ ${Number(v).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Materials</p>
                <p className="font-semibold">₹ {Math.round(estimate.materials).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Labour</p>
                <p className="font-semibold">₹ {Math.round(estimate.labour).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Services</p>
                <p className="font-semibold">₹ {Math.round(estimate.services).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calculator;
