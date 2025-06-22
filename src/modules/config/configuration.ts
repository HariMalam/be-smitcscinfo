const configuration = () => ({
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || '3000', 10),
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  enableCrons: process.env.ENABLE_CRONS === 'true',
  runMigrations: process.env.RUN_MIGRATIONS === 'true',
  runSeeders: process.env.RUN_SEEDERS === 'true',
  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
    name: process.env.SUPER_ADMIN_NAME,
  },
});

export type AppConfig = ReturnType<typeof configuration>;
export type EmailConfig = AppConfig['email'];
export type JwtConfig = AppConfig['jwt'];
export type superAdminConfig = AppConfig['superAdmin'];
export default configuration;
