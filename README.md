# Event Ticket Reservation System

This repository contains a TypeScript-based server application that provides APIs for managing events and ticket reservations. The system is designed to handle multiple event dates, automatic seat assignments, and reservation modifications.

---

## Features

### Event Management

- Create new events.
- View all available events.
- Retrieve details for a single event.

### Ticket Reservation

- Reserve a ticket for a specific event and date.
- Automatically assign the next available seat.
- Cancel a reservation and free up the seat for reuse.
- Modify an existing reservation to assign a new seat.
- Retrieve all reservations for a specific event and date.

---

## API Endpoints

### Events API

1. **Create Event**

   - **Endpoint:** `POST /event`
   - **Request Body:**
     ```json
     {
       "id": number,
       "name": string,
       "eventDates": [string],
       "details": string
     }
     ```
   - **Response:**
     ```json
     {
       "message": "Event created successfully."
     }
     ```

2. **View All Events**

   - **Endpoint:** `GET /events`
   - **Response:**
     ```json
     [
       {
         "id": number,
         "name": string,
         "eventDates": [string],
         "details": string
       }
     ]
     ```

3. **View Single Event**
   - **Endpoint:** `GET /event/:id`
   - **Response:**
     ```json
     {
       "id": number,
       "name": string,
       "eventDates": [string],
       "details": string
     }
     ```

### Ticket API

1. **Reserve Ticket**

   - **Endpoint:** `POST /reserve`
   - **Request Body:**
     ```json
     {
       "name": string,
       "email": string,
       "eventId": number,
       "eventDate": string
     }
     ```
   - **Response:**
     ```json
     {
       "message": "Reservation successful!",
       "eventId": number,
       "eventDate": string,
       "seatNumber": number
     }
     ```

2. **View Reserved Ticket Details**

   - **Endpoint:** `GET /ticket`
   - **Query Parameters:** `email`
   - **Response:**
     ```json
     [
       {
         "name": string,
         "email": string,
         "seatNumber": number,
         "event": {
            "eventId": number,
            "eventDate": string,
            "name": string,
            "details": string
            }
       }
     ]
     ```

3. **View All Attendees**

   - **Endpoint:** `GET /attendees`
   - **Query Parameters:** `eventId`, `eventDate`
   - **Response:**
     ```json
     [
       {
         "name": string,
         "email": string,
         "seatNumber": number
       }
     ]
     ```

4. **Cancel Reservation**

   - **Endpoint:** `DELETE /cancel`
   - **Request Body:**
     ```json
     {
       "email": string,
       "eventId": number,
       "eventDate": string
     }
     ```
   - **Response:**
     ```json
     {
       "message": "Reservation cancelled successfully."
     }
     ```

5. **Modify Reservation**
   - **Endpoint:** `PUT /modify`
   - **Request Body:**
     ```json
     {
       "email": string,
       "eventId": number,
       "eventDate": string
     }
     ```
   - **Response:**
     ```json
     {
       "message": "Seat reservation modified successfully.",
       "event": {
        "eventId": number,
        "eventDate": string,
       },
       "seatNumber": number
     }
     ```

---

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. Start the server:
   ```bash
   npm start
   ```

---

## Testing

1. Install Jest if not already installed:

   ```bash
   npm install --save-dev jest ts-jest @types/jest
   ```

2. Run the tests:
   ```bash
   npm test
   ```

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or new features.
