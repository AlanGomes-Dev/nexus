import express from 'express';
import cors from 'cors';
import { calculateMetrics } from './services/metricsService.js';
import { addEvent, getEvents, getEventCount, } from './store/eventStore.js';
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
const validEventTypes = [
    'product_viewed',
    'checkout_started',
    'order_created',
    'payment_failed',
    'cart_abandoned',
];
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'online',
        service: 'Nexus API',
        version: '0.1.0',
    });
});
app.post('/api/events', (req, res) => {
    const event = req.body;
    if (!event.type || !validEventTypes.includes(event.type)) {
        return res.status(400).json({
            success: false,
            message: 'Tipo de evento inválido.',
            validEventTypes,
        });
    }
    if (!event.customerId) {
        return res.status(400).json({
            success: false,
            message: 'customerId é obrigatório.',
        });
    }
    const storedEvent = addEvent(event);
    console.log('Novo evento recebido:', storedEvent);
    return res.status(201).json({
        success: true,
        message: 'Evento recebido pelo Nexus',
        event: storedEvent,
    });
});
app.get('/api/events', (_req, res) => {
    res.json({
        success: true,
        total: getEventCount(),
        events: getEvents(),
    });
});
app.get('/api/metrics', (_req, res) => {
    const metrics = calculateMetrics(getEvents());
    res.json({
        success: true,
        metrics,
    });
});
app.listen(PORT, () => {
    console.log(`Nexus API rodando em http://localhost:${PORT}`);
});
