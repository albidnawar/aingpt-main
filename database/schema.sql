CREATE TABLE users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  subscription_plan TEXT,
  token_balance INT DEFAULT 0,
  auth_user_id UUID UNIQUE
);

CREATE TABLE lawyers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  lawyer_id TEXT NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone TEXT,
  type TEXT,
  chamber_address TEXT,
  law_practicing_place TEXT,
  years_experience INT,
  consultation_fee NUMERIC(10,2),
  token_balance INT DEFAULT 0,
  auth_user_id UUID UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lawyer_education_details (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  lawyer_id BIGINT NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  graduation_year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lawyer_cases (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  lawyer_id BIGINT NOT NULL REFERENCES lawyers(id) ON DELETE CASCADE,
  case_type TEXT CHECK (case_type IN ('current', 'significant')) NOT NULL,
  police_station TEXT,
  district TEXT,
  case_number TEXT,
  law_name_and_section TEXT,
  filing_date DATE,
  yearly_number TEXT,
  crime_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cases (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  case_number TEXT NOT NULL UNIQUE,
  case_type TEXT,
  thana_name TEXT,
  case_name_dhara TEXT,
  dhara_number TEXT,
  case_title TEXT,
  register_date DATE,
  bp_form_no TEXT,
  case_persons TEXT,
  relationship TEXT,
  short_description TEXT,
  files JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE case_documents (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  case_id BIGINT REFERENCES cases (id),
  document_path TEXT
);

CREATE TABLE case_views (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  case_id BIGINT REFERENCES cases (id),
  user_id BIGINT REFERENCES users (id),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE case_lawyer_interests (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  case_id BIGINT REFERENCES cases (id),
  lawyer_id BIGINT REFERENCES lawyers (id),
  interest_shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE case_acceptances (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  case_id BIGINT REFERENCES cases (id),
  lawyer_id BIGINT REFERENCES lawyers (id),
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT
);

CREATE TABLE case_requests (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  case_id BIGINT REFERENCES cases (id),
  user_id BIGINT REFERENCES users (id),
  lawyer_id BIGINT REFERENCES lawyers (id),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lawyer_tokens (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  lawyer_id BIGINT REFERENCES lawyers (id),
  transaction_type TEXT,
  amount INT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_tokens (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users (id),
  transaction_type TEXT,
  amount INT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_case_purchases (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users (id),
  case_id BIGINT REFERENCES cases (id),
  cost INT,
  status TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_subscriptions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users (id),
  plan TEXT,
  payment_amount INT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users (id),
  lawyer_id BIGINT REFERENCES lawyers (id),
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lawyer_reviews (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  lawyer_id BIGINT REFERENCES lawyers (id),
  user_id BIGINT REFERENCES users (id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lawyer_rating_stats (
  lawyer_id BIGINT PRIMARY KEY REFERENCES lawyers (id) ON DELETE CASCADE,
  average_rating NUMERIC(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lawyer_rating_entries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  lawyer_id BIGINT NOT NULL REFERENCES lawyers (id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (lawyer_id, user_id)
);

CREATE TABLE lawyer_sessions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  lawyer_id BIGINT NOT NULL REFERENCES lawyers (id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

