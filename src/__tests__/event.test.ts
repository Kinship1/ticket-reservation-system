import { EventHandler } from "../event";

describe("EventHandler", () => {
  let eventHandler: EventHandler;

  beforeEach(() => {
    eventHandler = new EventHandler();
  });

  test("should create a new event", () => {
    const event = {
      id: 1,
      name: "Tech Conference",
      eventDates: ["2025-01-20", "2025-01-21"],
      details: "A conference about the latest in tech.",
    };

    eventHandler.createEvent(event);
    const allEvents = eventHandler.getAllEvents();

    expect(allEvents).toHaveLength(1);
    expect(allEvents[0]).toEqual(event);
  });

  test("should retrieve an event by ID", () => {
    const event = {
      id: 1,
      name: "Music Concert",
      eventDates: ["2025-02-10"],
      details: "A live music concert.",
    };

    eventHandler.createEvent(event);
    const retrievedEvent = eventHandler.getEvent(1);

    expect(retrievedEvent).toEqual(event);
  });

  test("should return null for non-existent event ID", () => {
    const retrievedEvent = eventHandler.getEvent(99);
    expect(retrievedEvent).toBeNull();
  });

  test("should retrieve all events", () => {
    const event1 = {
      id: 1,
      name: "Art Exhibit",
      eventDates: ["2025-03-15", "2025-03-16"],
      details: "A display of modern art.",
    };

    const event2 = {
      id: 2,
      name: "Sports Meet",
      eventDates: ["2025-04-10"],
      details: "An event for sports enthusiasts.",
    };

    eventHandler.createEvent(event1);
    eventHandler.createEvent(event2);

    const allEvents = eventHandler.getAllEvents();

    expect(allEvents).toHaveLength(2);
    expect(allEvents).toContainEqual(event1);
    expect(allEvents).toContainEqual(event2);
  });
});
