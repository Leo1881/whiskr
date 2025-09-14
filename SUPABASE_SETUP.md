# Supabase Setup Guide for Whiskr

## 1. Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `whiskr`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (starts with `eyJ`)

## 3. Set Up Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 4. Set Up the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste it into the SQL editor
4. Click **Run** to execute the schema

This will create:

- ✅ `whiskeys` table with search indexes
- ✅ `profiles` table for user data
- ✅ `reviews` table for ratings and reviews
- ✅ `user_favorites` table for saved whiskeys
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for automatic profile creation
- ✅ Views for whiskey ratings

## 5. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure **Site URL**: `whiskr://auth/callback`
3. Add **Redirect URLs**:
   - `whiskr://auth/callback`
   - `whiskr://auth/reset-password`

### Optional: Enable Social Auth

**Google OAuth:**

1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials

**Apple OAuth:**

1. Enable **Apple**
2. Add your Apple OAuth credentials

## 6. Set Up Storage (Optional)

1. Go to **Storage**
2. Create a new bucket called `whiskey-images`
3. Set it to **Public** if you want public access
4. Configure RLS policies if needed

## 7. Test Your Setup

1. Start your app:

   ```bash
   npm start
   ```

2. The app should now connect to Supabase successfully!

## 8. Add Sample Data (Optional)

You can add some sample whiskeys to test with:

```sql
INSERT INTO whiskeys (name, brand, distillery, type, region, age, abv, description) VALUES
('Lagavulin 16', 'Lagavulin', 'Lagavulin Distillery', 'single_malt', 'islay', 16, 43.0, 'A classic Islay single malt with rich peat smoke and maritime character.'),
('Macallan 18', 'Macallan', 'Macallan Distillery', 'single_malt', 'speyside', 18, 43.0, 'A luxurious Speyside single malt with notes of dried fruit and spice.'),
('Woodford Reserve', 'Woodford Reserve', 'Woodford Reserve Distillery', 'bourbon', 'kentucky', NULL, 45.2, 'A premium Kentucky bourbon with rich, complex flavors.');
```

## 9. Next Steps

- ✅ Database is ready
- ✅ Authentication is configured
- ✅ API services are set up
- ✅ Ready to build your app features!

## Troubleshooting

**Connection Issues:**

- Check your environment variables are correct
- Ensure your Supabase project is active
- Verify the URL format: `https://your-project-id.supabase.co`

**Authentication Issues:**

- Check redirect URLs are configured correctly
- Ensure RLS policies are set up
- Verify the auth trigger is working

**Database Issues:**

- Check the schema was applied correctly
- Verify RLS policies are enabled
- Check the database logs for errors

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [React Native + Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
