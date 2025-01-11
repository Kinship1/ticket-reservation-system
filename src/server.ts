// Import dependencies
import express, { Request, Response } from "express";

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Types
interface Reservation {
  name: string;
  email: string;
  seatNumber: number;
  eventId: number;
  eventDate: string;
}

interface Event {
  id: number;
  name: string;
  eventDates: string[];
  details: string;
}

type Reservations = Record<Event["id"], Record<string, Reservation[]>>;

// In-memory storage
const events: Record<Event["id"], Event> = {};
const reservations: Reservations = {};

// Utility function to generate seat numbers
const generateSeatNumber = (eventId: number, eventDate: string): number => {
  if (!reservations[eventId]) reservations[eventId] = {};
  if (!reservations[eventId][eventDate]) reservations[eventId][eventDate] = [];
  return reservations[eventId][eventDate].length + 1;
};

// Create Event API
app.post("/events", (req: Request, res: Response) => {
  const { id, name, eventDates, details }: Event = req.body;
  if (!id || !name || !eventDates || !details) {
    return res
      .status(400)
      .json({ error: "Event ID, name, dates, and details are required." });
  }

  if (events[id]) {
    return res
      .status(400)
      .json({ error: "Event with this ID already exists." });
  }

  events[id] = { id, name, eventDates, details };
  res.json({ message: "Event created successfully!", event: events[id] });
});

// View All Events API
app.get("/events", (_req: Request, res: Response) => {
  res.json(Object.values(events));
});

// View Single Event API
app.get("/events/:id", (req: Request, res: Response) => {
  const eventId = Number(req.params.id);
  const event = events[eventId];

  if (!event) {
    return res.status(404).json({ error: "Event not found." });
  }

  res.json(event);
});

// Reserve Event Ticket API
app.post("/reserve", (req: Request, res: Response) => {
  const {
    name,
    email,
    eventId,
    eventDate,
  }: { name: string; email: string; eventId: number; eventDate: string } =
    req.body;
  if (!name || !email || !eventId || !eventDate) {
    return res
      .status(400)
      .json({ error: "Name, email, event ID, and event date are required." });
  }

  const event = events[eventId];
  if (!event) {
    return res.status(404).json({ error: "Event not found." });
  }

  if (!event.eventDates.includes(eventDate)) {
    return res.status(400).json({ error: "Invalid event date." });
  }

  const seatNumber = generateSeatNumber(eventId, eventDate);

  // Check if the user already reserved a seat for the same event and date
  const existingReservation = reservations[eventId][eventDate]?.find(
    (attendee) => attendee.email === email
  );
  if (existingReservation) {
    return res.status(400).json({
      error: "You already have a reservation for this event on this date.",
    });
  }

  const reservation: Reservation = {
    name,
    email,
    seatNumber,
    eventId,
    eventDate,
  };
  reservations[eventId][eventDate].push(reservation);

  res.json({
    message: "Reservation successful!",
    eventId,
    eventDate,
    seatNumber,
  });
});

// View Reserved Ticket Details API
app.get("/ticket", (req: Request, res: Response) => {
  const { email } = req.query;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required." });
  }

  const userReservations = Object.values(reservations)
    .flatMap((dates) => Object.values(dates).flat())
    .filter((r) => r.email === email);

  if (userReservations.length === 0) {
    return res
      .status(404)
      .json({ error: "No reservations found for this email." });
  }

  res.json(userReservations);
});

// View All Attendees API
app.get("/attendees", (req: Request, res: Response) => {
  const { eventId, eventDate } = req.query;
  const parsedEventId = Number(eventId);
  if (isNaN(parsedEventId) || !eventDate || typeof eventDate !== "string") {
    return res
      .status(400)
      .json({ error: "Valid event ID and event date are required." });
  }

  const attendees = reservations[parsedEventId]?.[eventDate];
  if (!attendees || attendees.length === 0) {
    return res
      .status(404)
      .json({ error: "No attendees found for this event on this date." });
  }

  res.json(attendees);
});

// Cancel Reservation API
app.delete("/cancel", (req: Request, res: Response) => {
  const {
    email,
    eventId,
    eventDate,
  }: { email: string; eventId: number; eventDate: string } = req.body;
  if (!email || !eventId || !eventDate) {
    return res
      .status(400)
      .json({ error: "Email, event ID, and event date are required." });
  }

  const attendees = reservations[eventId]?.[eventDate];
  if (!attendees) {
    return res
      .status(404)
      .json({ error: "No reservations found for this event on this date." });
  }

  const index = attendees.findIndex((attendee) => attendee.email === email);
  if (index === -1) {
    return res.status(404).json({
      error: "No reservation found for this email on the given event and date.",
    });
  }

  attendees.splice(index, 1);
  res.json({ message: "Reservation cancelled successfully." });
});

// Modify Seat Reservation API
app.put("/modify", (req: Request, res: Response) => {
  const {
    email,
    eventId,
    eventDate,
  }: { email: string; eventId: number; eventDate: string } = req.body;
  if (!email || !eventId || !eventDate) {
    return res
      .status(400)
      .json({ error: "Email, event ID, and event date are required." });
  }

  const attendees = reservations[eventId]?.[eventDate];
  if (!attendees) {
    return res
      .status(404)
      .json({ error: "No reservations found for this event on this date." });
  }

  const reservation = attendees.find((attendee) => attendee.email === email);
  if (!reservation) {
    return res.status(404).json({
      error: "No reservation found for this email on the given event and date.",
    });
  }

  const newSeatNumber = generateSeatNumber(eventId, eventDate);
  reservation.seatNumber = newSeatNumber;

  res.json({
    message: "Seat reservation modified successfully.",
    eventId,
    eventDate,
    newSeatNumber,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
