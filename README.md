                                                                                                                                                                                      # Babylon Parturi - Barbershop Booking System

A modern React-based booking system for Babylon Parturi barbershop in Kokkola, Finland. Features online appointment booking, stamp card loyalty program, and customer management.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Resend account (for email services)

### 1. Project Setup

```bash
# Clone and install dependencies
git clone <repository-url>
cd babylonparturi
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to get these values:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key

### 3. Database Setup

The project uses Supabase as the database. The required tables will be created automatically when you set up Supabase:

- `services` - Available barbershop services
- `bookings` - Customer appointments
- `booking_services` - Junction table for bookings and services
- `stamp_cards` - Customer loyalty cards
- `email_verification_codes` - Email verification for stamp cards
- `availability` - Staff availability slots

**Important:** Make sure to run the migration files in your Supabase project to create these tables.

### 4. Email Service Setup (Critical for Production)

#### 4.1 Get Resend API Key

1. Sign up at [Resend.com](https://resend.com)
2. Create a new API key in your dashboard
3. Copy the API key (starts with `re_`)

#### 4.2 Configure Supabase Edge Functions

Add these environment variables to your Supabase Edge Functions:

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions** → **Settings**
3. Add the following environment variables:

```env
RESEND_API_KEY=re_your_resend_api_key_here
ADMIN_EMAIL=your_admin_email@domain.com
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**How to get SUPABASE_SERVICE_ROLE_KEY:**
- In Supabase Dashboard → Settings → API
- Copy the "service_role" key (⚠️ Keep this secret!)

#### 4.3 Domain Verification (Recommended for Production)

1. In Resend dashboard, go to **Domains**
2. Add and verify your domain (e.g., `babylonparturi.fi`)
3. Update the `from` addresses in Edge Functions to use your verified domain

### 5. Deploy Supabase Edge Functions

The project includes several Edge Functions that need to be deployed:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy all Edge Functions
supabase functions deploy send-booking-confirmation
supabase functions deploy report-booking-error
supabase functions deploy send-stampcard-verification-code
supabase functions deploy verify-stampcard-code
```

**What each function does:**
- `send-booking-confirmation` - Sends booking confirmation emails to customers
- `report-booking-error` - Reports booking errors to admin email
- `send-stampcard-verification-code` - Sends verification codes for stamp card access
- `verify-stampcard-code` - Verifies stamp card access codes

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration

### Services Configuration

Add your barbershop services to the `services` table in Supabase:

```sql
INSERT INTO services (name, discerption, price, duration_minutes, add_on_type) VALUES
('Koneella & Saksilla', 'Klassinen hiustenleikkaus koneella ja saksilla', 25, 30, 'hair_add_on'),
('Vain Saksilla', 'Tarkka hiustenleikkaus pelkästään saksilla', 35, 45, 'hair_add_on'),
('Parran Siistiminen', 'Ammattimainen parran muotoilu', 25, 20, 'beard_add_on');
```

### Operating Hours

Update the `OPERATING_HOURS` constant in `src/components/booking/TimeSelection.tsx`:

```typescript
const OPERATING_HOURS = {
  0: null, // Sunday - Closed
  1: { start: '10:00', end: '18:00' }, // Monday
  2: { start: '10:00', end: '18:00' }, // Tuesday
  // ... etc
}
```

## 📧 Email Templates

The system sends several types of emails:

1. **Booking Confirmations** - Sent to customers after successful booking
2. **Error Reports** - Sent to admin when booking errors occur
3. **Stamp Card Verification** - Sent when accessing stamp cards via email

All email templates are customizable in the respective Edge Functions.

## 🎯 Features

- **Online Booking System** - Customers can book appointments online
- **Stamp Card Loyalty Program** - Digital loyalty cards with referral system
- **Service Management** - Flexible service and add-on configuration
- **Email Notifications** - Automated booking confirmations and error reporting
- **Mobile Responsive** - Works perfectly on all devices
- **Real-time Availability** - Shows available time slots based on existing bookings

## 🚨 Important Notes

### Security
- Never commit your `.env` file to version control
- Keep your `SUPABASE_SERVICE_ROLE_KEY` secret
- Use environment variables for all sensitive data

### Email Deliverability
- Verify your domain in Resend for better deliverability
- Test email functionality in development before going live
- Monitor your Resend dashboard for email delivery status

### Database
- Enable Row Level Security (RLS) on all tables
- Regularly backup your Supabase database
- Monitor database usage and performance

## 🛠️ Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check RESEND_API_KEY is correctly set in Supabase Edge Functions
   - Verify domain in Resend dashboard
   - Check Edge Function logs in Supabase

2. **Booking errors**
   - Ensure all required environment variables are set
   - Check database table permissions (RLS policies)
   - Verify services are properly configured in database

3. **Stamp card issues**
   - Confirm email verification functions are deployed
   - Check SUPABASE_SERVICE_ROLE_KEY is set correctly
   - Verify email_verification_codes table exists

### Getting Help

- Check Supabase Edge Function logs for detailed error messages
- Monitor the browser console for client-side errors
- Verify all environment variables are properly set

## 📝 License

This project is proprietary software for Babylon Parturi barbershop.

---

**Need help?** Contact the development team or check the Supabase and Resend documentation for additional troubleshooting steps.