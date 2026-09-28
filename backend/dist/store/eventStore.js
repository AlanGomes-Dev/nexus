const events = [];
export function addEvent(event) {
    const eventWithTimestamp = {
        ...event,
        timestamp: event.timestamp ?? new Date().toISOString(),
    };
    events.push(eventWithTimestamp);
    return eventWithTimestamp;
}
export function getEvents() {
    return events;
}
export function getEventCount() {
    return events.length;
}
