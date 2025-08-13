import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

interface Room {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  name: string;
}

interface MapEditorProps {
  planData?: {
    length: number;
    width: number;
    floors: string;
    style: string;
  };
}

export const MapEditor = ({ planData }: MapEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [roomType, setRoomType] = useState("bedroom");
  const [roomName, setRoomName] = useState("");

  const roomTypes = [
    "bedroom", "bathroom", "kitchen", "living_room", 
    "dining_room", "study", "balcony", "staircase"
  ];

  useEffect(() => {
    drawCanvas();
  }, [rooms, selectedRoom]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw rooms
    rooms.forEach((room) => {
      ctx.fillStyle = room === selectedRoom ? "#3b82f680" : "#64748b40";
      ctx.fillRect(room.x, room.y, room.width, room.height);
      
      ctx.strokeStyle = room === selectedRoom ? "#3b82f6" : "#64748b";
      ctx.lineWidth = 2;
      ctx.strokeRect(room.x, room.y, room.width, room.height);

      // Draw room label
      ctx.fillStyle = "#1e293b";
      ctx.font = "12px Inter";
      ctx.textAlign = "center";
      ctx.fillText(
        room.name || room.type,
        room.x + room.width / 2,
        room.y + room.height / 2
      );
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on existing room
    const clickedRoom = rooms.find(room => 
      x >= room.x && x <= room.x + room.width &&
      y >= room.y && y <= room.y + room.height
    );

    if (clickedRoom) {
      setSelectedRoom(clickedRoom);
      return;
    }

    // Start drawing new room
    setIsDrawing(true);
    setStartPos({ x, y });
    setSelectedRoom(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawCanvas();

    // Draw preview rectangle
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      startPos.x,
      startPos.y,
      x - startPos.x,
      y - startPos.y
    );
    ctx.setLineDash([]);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = Math.abs(x - startPos.x);
    const height = Math.abs(y - startPos.y);

    if (width > 20 && height > 20) {
      const newRoom: Room = {
        id: Date.now().toString(),
        x: Math.min(startPos.x, x),
        y: Math.min(startPos.y, y),
        width,
        height,
        type: roomType,
        name: roomName || roomType,
      };

      setRooms([...rooms, newRoom]);
      setRoomName("");
    }

    setIsDrawing(false);
  };

  const deleteSelectedRoom = () => {
    if (selectedRoom) {
      setRooms(rooms.filter(room => room.id !== selectedRoom.id));
      setSelectedRoom(null);
    }
  };

  const updateSelectedRoom = (updates: Partial<Room>) => {
    if (selectedRoom) {
      const updatedRooms = rooms.map(room => 
        room.id === selectedRoom.id ? { ...room, ...updates } : room
      );
      setRooms(updatedRooms);
      setSelectedRoom({ ...selectedRoom, ...updates });
    }
  };

  const savePlan = () => {
    // In a real app, this would save to the database
    toast({
      title: "Plan Saved",
      description: "Your house plan has been saved successfully!",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Map Editor</CardTitle>
              {planData && (
                <p className="text-sm text-muted-foreground">
                  {planData.length}' × {planData.width}' | {planData.floors} Floor(s) | {planData.style}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-border rounded-lg cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Room</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Room Type</Label>
                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="roomName">Room Name (Optional)</Label>
                <Input
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g., Master Bedroom"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Click and drag on the canvas to draw a room
              </p>
            </CardContent>
          </Card>

          {selectedRoom && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Room</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={selectedRoom.name}
                    onChange={(e) => updateSelectedRoom({ name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={selectedRoom.type} 
                    onValueChange={(value) => updateSelectedRoom({ type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="destructive"
                  onClick={deleteSelectedRoom}
                  className="w-full"
                >
                  Delete Room
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={savePlan} className="w-full">
                Save Plan
              </Button>
              <Button
                variant="outline"
                onClick={() => setRooms([])}
                className="w-full"
              >
                Clear All
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};