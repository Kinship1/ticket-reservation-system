// ticketservice.ts
import { Request, Response } from "express";
import { EventHandler } from "./event";

interface Reservation {
  name: string;
  email: string;
  seatNumber: number;
  eventId: number;
  eventDate: string;
}

type Reservations = Record<number, Record<string, Reservation[]>>;

type SeatMap = Record<number, Record<string, Set<number>>>;

const MAX_SEAT = 100;

export class TicketService {
  private reservations: Reservations = {};
  private seatMap: SeatMap = {};
  private eventHandler: EventHandler;

  constructor(eventHandler: EventHandler) {
    this.eventHandler = eventHandler;
  }

  private generateSeatNumber(
    eventId: number,
    eventDate: string
  ): number | null {
    if (!this.seatMap[eventId]) this.seatMap[eventId] = {};
    if (!this.seatMap[eventId][eventDate])
      this.seatMap[eventId][eventDate] = new Set();

    const occupiedSeats = this.seatMap[eventId][eventDate];
    for (let seat = 1; seat <= MAX_SEAT; seat++) {
      if (!occupiedSeats.has(seat)) {
        occupiedSeats.add(seat);
        return seat;
      }
    }

    return null; // No seats available
  }

  reserveTicket(req: Request, res: Response): void {
    const {
      name,
      email,
      eventId,
      eventDate,
    }: { name: string; email: string; eventId: number; eventDate: string } =
      req.body;
    if (!name || !email || !eventId || !eventDate) {
      res
        .status(400)
        .json({ error: "Name, email, event ID, and event date are required." });
      return;
    }

    const event = this.eventHandler.getEvent(eventId);
    if (!event) {
      res.status(404).json({ error: "Event not found." });
      return;
    }

    if (!event.eventDates.includes(eventDate)) {
      res.status(400).json({ error: "Invalid event date." });
      return;
    }

    const existingReservation = this.reservations[eventId]?.[eventDate]?.find(
      (attendee) => attendee.email === email
    );
    if (existingReservation) {
      res.status(400).json({
        error: "You already have a reservation for this event on this date.",
      });
      return;
    }

    const seatNumber = this.generateSeatNumber(eventId, eventDate);
    if (seatNumber === null) {
      res
        .status(400)
        .json({ error: "No seats available for this event on this date." });
      return;
    }

    if (!this.reservations[eventId]) this.reservations[eventId] = {};
    if (!this.reservations[eventId][eventDate])
      this.reservations[eventId][eventDate] = [];

    const reservation: Reservation = {
      name,
      email,
      seatNumber,
      eventId,
      eventDate,
    };
    this.reservations[eventId][eventDate].push(reservation);

    res.json({
      message: "Reservation successful!",
      eventId,
      eventDate,
      seatNumber,
    });
  }

  getTicketDetails(req: Request, res: Response): void {
    const { email } = req.query;
    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "Email is required." });
      return;
    }

    const userReservations = Object.values(this.reservations)
      .flatMap((dates) => Object.values(dates).flat())
      .filter((r) => r.email === email);

    if (userReservations.length === 0) {
      res.status(404).json({ error: "No reservations found for this email." });
      return;
    }

    res.json(userReservations);
  }

  getAllAttendees(req: Request, res: Response): void {
    const { eventId, eventDate } = req.query;
    const parsedEventId = Number(eventId);
    if (isNaN(parsedEventId) || !eventDate || typeof eventDate !== "string") {
      res
        .status(400)
        .json({ error: "Valid event ID and event date are required." });
      return;
    }

    const attendees = this.reservations[parsedEventId]?.[eventDate];
    if (!attendees || attendees.length === 0) {
      res
        .status(404)
        .json({ error: "No attendees found for this event on this date." });
      return;
    }

    res.json(attendees);
  }

  cancelReservation(req: Request, res: Response): void {
    const {
      email,
      eventId,
      eventDate,
    }: { email: string; eventId: number; eventDate: string } = req.body;
    if (!email || !eventId || !eventDate) {
      res
        .status(400)
        .json({ error: "Email, event ID, and event date are required." });
      return;
    }

    const attendees = this.reservations[eventId]?.[eventDate];
    if (!attendees) {
      res
        .status(404)
        .json({ error: "No reservations found for this event on this date." });
      return;
    }

    const index = attendees.findIndex((attendee) => attendee.email === email);
    if (index === -1) {
      res.status(404).json({
        error:
          "No reservation found for this email on the given event and date.",
      });
      return;
    }

    const [removedReservation] = attendees.splice(index, 1);
    this.seatMap[eventId][eventDate].delete(removedReservation.seatNumber);

    res.json({ message: "Reservation cancelled successfully." });
  }

  modifyReservation(req: Request, res: Response): void {
    const {
      email,
      eventId,
      eventDate,
    }: { email: string; eventId: number; eventDate: string } = req.body;
    if (!email || !eventId || !eventDate) {
      res
        .status(400)
        .json({ error: "Email, event ID, and event date are required." });
      return;
    }

    const attendees = this.reservations[eventId]?.[eventDate];
    if (!attendees) {
      res
        .status(404)
        .json({ error: "No reservations found for this event on this date." });
      return;
    }

    const reservation = attendees.find((attendee) => attendee.email === email);
    if (!reservation) {
      res.status(404).json({
        error:
          "No reservation found for this email on the given event and date.",
      });
      return;
    }

    const newSeatNumber = this.generateSeatNumber(eventId, eventDate);
    if (newSeatNumber === null) {
      res
        .status(400)
        .json({ error: "No seats available for this event on this date." });
      return;
    }

    this.seatMap[eventId][eventDate].delete(reservation.seatNumber);
    reservation.seatNumber = newSeatNumber;

    res.json({
      message: "Seat reservation modified successfully.",
      eventId,
      eventDate,
      newSeatNumber,
    });
  }
}
