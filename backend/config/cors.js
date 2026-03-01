const allowedOrigins = [
    'http://localhost:5173',
    'http://192.168.1.91:8081',
    'https://guadalupecano.es',
    'https://www.guadalupecano.es',
    process.env.FRONTEND_URL,
].filter(Boolean);

export const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn('CORS blocked for origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
};
