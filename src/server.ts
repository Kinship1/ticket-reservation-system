import express, { Request, Response } from "express";
import { EventHandler } from "./event";
import { TicketService } from "./ticketService";

const app = express();
const PORT = 3000;
const eventHandler = new EventHandler();
const ticketService = new TicketService(eventHandler);

app.use(express.json());

// Event APIs
app.post("/events", (req: Request, res: Response) => {
  const { name, eventDates, details } = req.body;
  if (!name || !eventDates || !details) {
    console.error("Invalid request data for creating event:", req.body);
    res
      .status(400)
      .json({ error: "Name, eventDates, and details are required." });
    return;
  }
  const event = eventHandler.createEvent({ name, eventDates, details });
  res.status(201).json(event);
});

app.get("/events", (req: Request, res: Response) => {
  const events = eventHandler.getAllEvents();
  res.json(events);
});

app.get("/events/:id", (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id, 10);
  if (isNaN(eventId)) {
    console.error("Invalid event ID in request:", req.params.id);
    res.status(400).json({ error: "Invalid event ID." });
    return;
  }
  const event = eventHandler.getEvent(eventId);
  if (!event) {
    res.status(404).json({ error: "Event not found." });
    return;
  }
  res.json(event);
});

// Ticket APIs
app.post("/tickets", (req: Request, res: Response) => {
  console.log("Received request to reserve ticket:", req.body);
  ticketService.reserveTicket(req, res);
});

app.get("/tickets", (req: Request, res: Response) => {
  console.log("Received request to get ticket details for:", req.query);
  ticketService.getTicketDetails(req, res);
});

app.get("/attendees", (req: Request, res: Response) => {
  console.log("Received request to get all attendees for:", req.query);
  ticketService.getAllAttendees(req, res);
});

app.delete("/tickets", (req: Request, res: Response) => {
  console.log("Received request to cancel reservation:", req.body);
  ticketService.cancelReservation(req, res);
});

app.put("/tickets", (req: Request, res: Response) => {
  console.log("Received request to modify reservation:", req.body);
  ticketService.modifyReservation(req, res);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
