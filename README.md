# Instagram Integration with Supabase

A React application that integrates with Instagram Basic Display API and stores data in Supabase.

## Features

- Instagram OAuth authentication
- Display user profile information
- Show recent Instagram posts
- Store data in Supabase database
- Responsive design with smooth animations

## Setup Instructions

### 1. Instagram App Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app and add Instagram Basic Display product
3. Configure OAuth redirect URIs to include your domain
4. Get your App ID and App Secret

### 2. Supabase Setup

1. Create a new Supabase project
2. Create the following tables:

```sql
-- Instagram users table
CREATE TABLE instagram_users (
  id SERIAL PRIMARY KEY,
  instagram_id VARCHAR UNIQUE NOT NULL,
  username VARCHAR NOT NULL,
  account_type VARCHAR,
  media_count INTEGER,
  access_token TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Instagram posts table
CREATE TABLE instagram_posts (
  id SERIAL PRIMARY KEY,
  instagram_id VARCHAR UNIQUE NOT NULL,
  user_instagram_id VARCHAR NOT NULL,
  caption TEXT,
  media_type VARCHAR,
  media_url TEXT,
  thumbnail_url TEXT,
  timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_instagram_id) REFERENCES instagram_users(instagram_id)
);
```

### 3. Configuration

1. Update `src/config/supabase.js` with your Supabase URL and anon key
2. Update `src/services/instagramApi.js` with your Instagram App ID and secret

### 4. Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_INSTAGRAM_APP_ID=your-instagram-app-id
VITE_INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
```

## Development

```bash
npm run dev
```

## Production Notes

- Move client secret to server-side for security
- Implement proper token refresh mechanism
- Add error boundaries and better error handling
- Consider implementing rate limiting
- Add proper CORS configuration