interface Event {
  id: number;
  name: string;
  eventDates: string[];
  details: string;
}

export class EventHandler {
  private events: Event[] = [];

  createEvent({
    name,
    eventDates,
    details,
  }: {
    name: string;
    eventDates: string[];
    details: string;
  }): Event {
    console.log("Creating new event with name:", name);
    const id =
      this.events.length > 0 ? this.events[this.events.length - 1].id + 1 : 1;
    const newEvent: Event = { id, name, eventDates, details };
    this.events.push(newEvent);
    console.log("Event created successfully:", newEvent);
    return newEvent;
  }

  getAllEvents(): Event[] {
    console.log("Fetching all events. Total events:", this.events.length);
    return this.events;
  }

  getEvent(id: number): Event | null {
    console.log("Fetching event with ID:", id);
    const event = this.events.find((event) => event.id === id);
    if (event) {
      console.log("Event found:", event);
    } else {
      console.log("No event found with ID:", id);
      return null;
    }
    return event;
  }
}
