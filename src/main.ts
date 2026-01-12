import { bootstrapApp } from "./bootstrap/app.bootstrap";
import { startServer } from "./bootstrap/server.bootstrap";
import { registerShutdown } from "./bootstrap/shutdown.bootstrap";
import { emailEvents } from "./core/events/email.events";
import { eventBus } from "./core/events/event-bul.service";

const app = bootstrapApp();

// Register domain events
emailEvents(eventBus);

const server = startServer(app);
registerShutdown(server);
