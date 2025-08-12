import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

type Item = { id: string; name: string; unit: string; price: number };

const DEFAULT_ITEMS: Item[] = [
  { id: "cement", name: "Cement (bag)", unit: "bag", price: 380 },
  { id: "steel", name: "Steel (kg)", unit: "kg", price: 72 },
  { id: "sand", name: "Sand (cft)", unit: "cft", price: 55 },
  { id: "bricks", name: "Bricks (unit)", unit: "pc", price: 9 },
  { id: "tiles", name: "Tiles (sq ft)", unit: "sq ft", price: 45 },
];

const Materials = () => {
  const [qty, setQty] = useState<Record<string, number>>({ cement: 100, steel: 500, sand: 200, bricks: 5000, tiles: 800 });

  const rows = useMemo(() => DEFAULT_ITEMS.map((it) => ({ ...it, qty: qty[it.id] ?? 0, total: (qty[it.id] ?? 0) * it.price })), [qty]);
  const total = rows.reduce((sum, r) => sum + r.total, 0);

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>Material Prices Estimator | BuildMate</title>
        <meta name="description" content="Check typical material prices and estimate your cost by entering quantities for cement, steel, sand, bricks, and more." />
        <link rel="canonical" href={window.location.origin + "/materials"} />
      </Helmet>

      <Card>
        <CardHeader>
          <CardTitle>Material Prices & Estimator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Unit Price (₹)</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-right">{r.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={r.qty}
                        min={0}
                        className="w-28 ml-auto"
                        onChange={(e) => setQty((s) => ({ ...s, [r.id]: Number(e.target.value) }))}
                      />
                    </TableCell>
                    <TableCell className="text-right">{Math.round(r.total).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-semibold">Grand Total</TableCell>
                  <TableCell className="text-right font-semibold">₹ {Math.round(total).toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Materials;
