import { TicketService } from "../ticketService";
import { EventHandler } from "../event";

describe("TicketService", () => {
  let eventHandler: EventHandler;
  let ticketService: TicketService;

  beforeEach(() => {
    eventHandler = new EventHandler();
    ticketService = new TicketService(eventHandler);

    // Mock data
    eventHandler.createEvent({
      name: "Music Concert",
      details: "A grand music concert.",
      eventDates: ["2025-01-20", "2025-01-21"],
    });
  });

  test("should reserve a ticket and allocate a seat", () => {
    const req = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        eventId: 1,
        eventDate: "2025-01-20",
      },
    } as any;
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as any;

    ticketService.reserveTicket(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Reservation successful!",
      eventId: 1,
      eventDate: "2025-01-20",
      seatNumber: 1,
    });
  });

  test("should not reserve a ticket for the same event date twice", () => {
    const req1 = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        eventId: 1,
        eventDate: "2025-01-20",
      },
    } as any;
    const req2 = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        eventId: 1,
        eventDate: "2025-01-20",
      },
    } as any;
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as any;

    ticketService.reserveTicket(req1, res);
    ticketService.reserveTicket(req2, res);

    expect(res.json).toHaveBeenCalledWith({
      error: "You already have a reservation for this event on this date.",
    });
  });

  test("should cancel a reservation and free up the seat", () => {
    const req1 = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        eventId: 1,
        eventDate: "2025-01-20",
      },
    } as any;
    const req2 = {
      body: { email: "john@example.com", eventId: 1, eventDate: "2025-01-20" },
    } as any;
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as any;

    ticketService.reserveTicket(req1, res);
    ticketService.cancelReservation(req2, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Reservation cancelled successfully.",
    });

    // Try reserving again to check if seat 1 is reassigned
    ticketService.reserveTicket(req1, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Reservation successful!",
      eventId: 1,
      eventDate: "2025-01-20",
      seatNumber: 1,
    });
  });

  test("should modify a reservation and assign a new seat", () => {
    const req1 = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        eventId: 1,
        eventDate: "2025-01-20",
      },
    } as any;
    const req2 = {
      body: { email: "john@example.com", eventId: 1, eventDate: "2025-01-20" },
    } as any;
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as any;

    ticketService.reserveTicket(req1, res);
    ticketService.modifyReservation(req2, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Seat reservation modified successfully.",
      eventId: 1,
      eventDate: "2025-01-20",
      newSeatNumber: 2,
    });
  });

  test("should retrieve all attendees for an event date", () => {
    const req1 = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        eventId: 1,
        eventDate: "2025-01-20",
      },
    } as any;
    const req2 = {
      query: { eventId: 1, eventDate: "2025-01-20" },
    } as any;
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as any;

    ticketService.reserveTicket(req1, res);
    ticketService.getAllAttendees(req2, res);

    expect(res.json).toHaveBeenCalledWith([
      {
        name: "John Doe",
        email: "john@example.com",
        seatNumber: 1,
        eventId: 1,
        eventDate: "2025-01-20",
      },
    ]);
  });
});
