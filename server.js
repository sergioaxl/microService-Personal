require('dotenv').config();
const app = require('./src/App');
const initDb = require('./src/config/initDb');

const PORT = process.env.PORT || 4001;

const start = async () => {
    await initDb(); // crea la tabla si no existe antes de aceptar peticiones

    const server = app.listen(PORT, () => {
        console.log(`Microservicio arriba ${PORT}`);
    });

    process.on('unhandledRejection', err => {
        console.error('unhandledRejection:', err);
        server.close(() => {
            process.exit(1);
        });
    });
};

start().catch(err => {
    console.error('No se pudo iniciar el microservicio:', err);
    process.exit(1);
});
