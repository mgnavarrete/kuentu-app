-- Esquema inicial de Kuentu. Se puede ejecutar varias veces sin problema.
CREATE TABLE IF NOT EXISTS users (
  id            serial PRIMARY KEY,
  username      text NOT NULL UNIQUE,
  display_name  text NOT NULL DEFAULT '',
  password_hash text NOT NULL,
  role          text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  disabled      boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

-- Solo se guarda el hash del token de sesión: si se filtra la base, las cookies siguen siendo secretas.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY,
  user_id    integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_agent text NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);

-- Todo lo del usuario (tableros, ajustes, recientes) en un documento, igual que el respaldo de la app.
CREATE TABLE IF NOT EXISTS boards (
  user_id    integer PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data       jsonb NOT NULL,
  version    integer NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
