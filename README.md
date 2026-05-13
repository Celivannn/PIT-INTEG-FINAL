# Hotel Reservation System

Django + React + MySQL · JWT Auth · v1.0 Phase 1

---

## Project Structure

```
hotel-reservation-system/
├── backend/         Django DRF API
├── frontend/
│   ├── customer/    Customer portal (React) — port 3000
│   └── admin/       Admin dashboard (React) — port 3001
└── README.md
```

---

## Backend Setup

### 1. Prerequisites
- Python 3.11+
- MySQL 8.0+
- pip + virtualenv

### 2. Create virtual environment
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env — set DB_NAME, DB_USER, DB_PASSWORD, SECRET_KEY
```

### 4. Create MySQL database
```sql
CREATE DATABASE hotel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Run migrations
```bash
python manage.py makemigrations users rooms reservations hotel_settings
python manage.py migrate
```

### 6. Create your first admin account
```bash
python manage.py create_admin
# Enter email, full name, password when prompted
```

### 7. Start the dev server
```bash
python manage.py runserver
# API available at http://localhost:8000
```

---

## API Endpoints

| Method | URL | Access | Description |
|--------|-----|--------|-------------|
| POST | /api/auth/register/ | Public | Customer registration |
| POST | /api/auth/login/ | Public | Login → access token + cookie |
| POST | /api/auth/logout/ | Auth | Blacklist refresh token |
| POST | /api/auth/token/refresh/ | Public | Silent token refresh |
| GET/PATCH | /api/auth/profile/ | Auth | View/update profile |
| GET | /api/rooms/ | Public | Room catalog |
| GET | /api/rooms/availability/ | Public | Available rooms by date |
| GET | /api/rooms/types/ | Public | Room type list |
| POST/PUT/DELETE | /api/rooms/* | Admin | Room management |
| GET/POST | /api/reservations/ | Customer | My reservations / book |
| POST | /api/reservations/<id>/cancel/ | Customer | Cancel own reservation |
| GET | /api/reservations/admin/ | Admin | All reservations |
| PATCH | /api/reservations/admin/<id>/status/ | Admin | Update status |
| GET | /api/admin/dashboard/ | Admin | KPI data |
| GET | /api/admin/customers/ | Admin | Customer list |
| GET | /api/admin/reports/export/?format=csv | Admin | Export CSV/PDF |
| GET/PUT/PATCH | /api/settings/ | Admin (GET: public) | Hotel settings |

---

## Key Design Decisions

- **Admin creation**: Only via `python manage.py create_admin` — never through the public API
- **Token storage**: Access token in localStorage, refresh token in HttpOnly cookie
- **Availability logic**: check_out date is exclusive (standard hotel rule)
- **Price locking**: `total_price` is locked at booking time, never recalculated
- **Cancellation**: Customers can cancel Pending/Confirmed within 24hrs of booking
- **Images**: Max 5 per room, stored locally in `media/rooms/`
