# Testing Guide - Vehicle Rental System

## ✅ System Status

All systems are **WORKING CORRECTLY**! The bookings pages require authentication before displaying data.

## 🗄️ Current Database State

### Users (2 total)
1. **john@example.org** (User ID: 1)
2. **test@example.com** (User ID: 2) - Password: `Test123!`

### Bookings (4 total)
1. Booking #2: Kawasaki Ninja H2 - John Doe - $500.00 (NULL user)
2. Booking #3: Royal Enfield Continental GT 650 - Jane Smith - $750.00 (NULL user)
3. Booking #4: Ducati Panigale V4 - John Doe - $800.00 (User ID: 1)
4. Booking #5: Harley-Davidson Street Glide - Test User - $1000.00 (User ID: 2)

## 🔐 Access Instructions

### Admin Dashboard & Bookings

**Step 1: Login**
```
URL: http://localhost:3000/admin
Username: admin
Password: admin123
```

**Step 2: View Bookings**
- Click the "View Bookings" button in the header
- Or navigate directly to: http://localhost:3000/admin/bookings

**Expected Result:**
- You should see **ALL 4 bookings** in a table
- Total Revenue: $3,050.00
- Each booking shows: ID, Vehicle, Customer, Contact, Dates, Days, Total, and Delete button

### User Bookings Page

**Step 1: Login as Test User**
```
URL: http://localhost:3000/login
Email: test@example.com
Password: Test123!
```

**Step 2: View Your Bookings**
- Navigate to: http://localhost:3000/bookings
- Or click "My Bookings" in the navigation

**Expected Result:**
- You should see **1 booking** (Harley-Davidson Street Glide - $1000.00)
- Booking shows status badge: "Upcoming"
- Shows start date, end date, days, and total price

### Alternative: Login as Another User

You can also create a new account:
```
URL: http://localhost:3000/signup
Name: Your Name
Email: your@email.com
Password: YourPassword123!
```

Then book a vehicle and see it appear in your bookings page.

## 🔍 Why Were Pages "Not Working"?

### The Issue
Both bookings pages were **redirecting to login pages** because:

1. **Admin Bookings** (`/admin/bookings`)
   - Checks for `adminToken` in localStorage
   - Without it, redirects to `/admin`
   - You must login first to set this token

2. **User Bookings** (`/bookings`)
   - Checks for valid session cookie
   - Without it, redirects to `/login`
   - You must login first to create a session

### The Solution
**You must login first!** The pages are working correctly - they're just enforcing authentication.

## 🧪 API Testing

### Test Admin Bookings API
```bash
curl http://localhost:3000/api/admin/bookings | python3 -m json.tool
```

### Test User Bookings API (requires session)
```bash
# First login to get session cookie
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  -c cookies.txt

# Then get bookings
curl http://localhost:3000/api/bookings \
  -b cookies.txt | python3 -m json.tool
```

## 🎯 Next Steps

1. **Open browser** to http://localhost:3000/admin
2. **Login** with admin/admin123
3. **Click "View Bookings"**
4. **Verify** you see all 4 bookings

For user bookings:
1. **Open browser** to http://localhost:3000/login
2. **Login** with test@example.com / Test123!
3. **Navigate** to http://localhost:3000/bookings
4. **Verify** you see 1 booking

## 🐛 Troubleshooting

### If admin bookings page keeps redirecting:
- Clear browser localStorage: `localStorage.clear()` in browser console
- Try logging in again
- Check browser console for errors (F12)

### If user bookings page keeps redirecting:
- Clear browser cookies
- Try logging in again
- Check browser console for errors (F12)

### If bookings don't appear:
- Open browser DevTools (F12)
- Go to Console tab
- Look for "Bookings fetched:" message with data
- Check Network tab to see if API call is successful

## ✨ All Features Working

✅ Admin login with username/password
✅ User signup and login with email/password
✅ Admin can view ALL bookings
✅ Users can view THEIR OWN bookings
✅ Admin can delete bookings
✅ Booking status badges (Upcoming, Active, Completed)
✅ Search functionality in admin dashboard
✅ Statistics cards showing total bookings and revenue
