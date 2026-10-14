// Envía un evento a MicroService_Reportes (auditoría). Es "dispara y olvida":
// nunca bloquea ni hace fallar la operación principal. Si AUDITORIA_URL no está
// definida, la auditoría queda desactivada. Los eventos NO se reintentan: si
// Reportes está caído en ese momento, ese evento se pierde (queda un warning en
// el log). Para garantía total habría que guardar una cola local (outbox).
const auditar = (req, servicio, evento) => {
    const base = process.env.AUDITORIA_URL;
    const llave = process.env.SERVICE_API_KEY;
    if (!base || !llave) return;

    try {
        const actor = evento.actor || req.admin || {};
        const ip = String(req.ip || '').replace(/^::ffff:/, '').slice(0, 64) || null;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000);

        fetch(`${base}/api/v1/auditoria/eventos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-service-key': llave },
            body: JSON.stringify({
                servicio,
                accion: evento.accion,
                entidad: evento.entidad,
                entidad_id: evento.entidad_id,
                actor_id: actor.id,
                actor_usuario: actor.usuario,
                detalle: evento.detalle,
                ip
            }),
            signal: controller.signal
        })
            .then((r) => { if (!r.ok) console.warn(`Auditoría respondió ${r.status}`); })
            .catch((err) => console.warn('No se pudo registrar el evento de auditoría:', err.message))
            .finally(() => clearTimeout(timer));
    } catch (err) {
        console.warn('Error armando el evento de auditoría:', err.message);
    }
};

module.exports = { auditar };
