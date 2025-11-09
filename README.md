# Sample Cafe CMS Demo

Hospitality-focused CMS demo featuring a public-facing official site and a secure admin console. Designed as a portfolio-ready showcase that demonstrates content management, loading animations, and a refined cafe aesthetic.

## Features

- **Public site** with dedicated pages for Top, Access, Reservations, Gallery, Story, and Highlights plus curated announcements.
- **Stylish loading experience** tailored to cafes and dining establishments on every page.
- **Admin console** requiring authentication (default credentials `admin` / `admin1234`) with strong password hashing via PBKDF2.
- **Content management** for hero copy, body text, highlight statements, image URLs, and structured meta information per section.
- **Gallery tools** for uploading/removing imagery stored securely on the server.
- **Highlights & announcements** modules to promote seasonal experiences and timely updates.
- **SQLite database** seeded automatically on first run with sample data and secure credential storage.

## Getting Started

1. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

2. **Run the development server**

   ```bash
   flask --app app run
   ```

   The application initializes the SQLite database (`site.db`) on first launch and seeds demo content.

3. **Access the sites**

   - Public site: [http://localhost:5000](http://localhost:5000)
   - Admin console: [http://localhost:5000/admin/login](http://localhost:5000/admin/login)

4. **Login credentials**

   - ID: `admin`
   - Password: `admin1234`

   Update the credentials immediately after logging in by modifying the user table (future enhancement could expose a password change UI).

## Project Structure

```
app.py                # Flask application factory and routes
requirements.txt      # Python dependencies
site.db               # SQLite database (created on first run)
templates/            # Jinja2 templates for public and admin areas
static/css/           # Styling for public site and admin console
static/js/            # Front-end interactions (navigation, loaders)
static/images/        # SVG placeholders for hero/galleries
static/uploads/       # User-uploaded gallery assets
```

## Notes

- All textual and visual content is branded as "Sample" to emphasise demo usage.
- The design language is fixed to preserve a consistent showcase aesthetic; admins can modify copy and assets within that framework.
- Passwords are stored using Werkzeug's `generate_password_hash` (PBKDF2-SHA256).
- Additional enhancements (e.g., password reset, analytics) can be layered on easily if needed for your official portfolio.
