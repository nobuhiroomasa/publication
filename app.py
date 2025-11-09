import os
import sqlite3
from datetime import datetime
from pathlib import Path

from flask import (
    Flask,
    flash,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "site.db"
UPLOAD_FOLDER = BASE_DIR / "static" / "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.update(
        SECRET_KEY=os.environ.get("SECRET_KEY", "change-this-secret"),
        UPLOAD_FOLDER=str(UPLOAD_FOLDER),
        MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB upload limit
    )

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    init_db()

    register_routes(app)
    return app


def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS site_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section TEXT UNIQUE NOT NULL,
            title TEXT,
            subtitle TEXT,
            body TEXT,
            highlight TEXT,
            image TEXT,
            extra_info TEXT
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS gallery_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_path TEXT NOT NULL,
            caption TEXT,
            display_order INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS features (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            icon TEXT DEFAULT 'fa-mug-hot'
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS announcements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            published_at TEXT NOT NULL
        )
        """
    )

    conn.commit()

    # Seed default admin user
    cur.execute("SELECT COUNT(*) FROM users")
    if cur.fetchone()[0] == 0:
        default_username = "admin"
        default_password = "admin1234"
        password_hash = generate_password_hash(default_password)
        cur.execute(
            "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
            (default_username, password_hash, datetime.utcnow().isoformat()),
        )
        conn.commit()
        print("Initialized default admin user -> username: admin / password: admin1234")

    # Seed content
    seed_content(cur)
    conn.commit()
    conn.close()


def seed_content(cur: sqlite3.Cursor) -> None:
    default_contents = {
        "top": dict(
            title="Sample Cafe Experience",
            subtitle="Crafted moments in every cup.",
            body=(
                "Welcome to our sample cafe showcase. This demo site illustrates how you can "
                "present an unforgettable first impression with bold imagery, curated stories, "
                "and immersive design tailored for beverage and dining concepts."
            ),
            highlight="Sip. Savor. Share.",
            image="/static/images/hero.svg",
            extra_info="signature=Seasonal single-origin beans & artisanal desserts",
        ),
        "access": dict(
            title="Access & Hours",
            subtitle="Find your way to comfort.",
            body=(
                "We welcome you to our sample location. Adjust the following details from the "
                "admin dashboard to mirror your own operational hours, contact information, "
                "and neighborhood tips."
            ),
            highlight="Weekdays: 09:00-20:00 / Weekends: 10:00-22:00",
            image="/static/images/interior.svg",
            extra_info=(
                "address=123 Demo Street, Sample District\n"
                "phone=000-0000-0000\n"
                "holiday=Open year-round"
            ),
        ),
        "reservations": dict(
            title="Reservations",
            subtitle="Reserve your table effortlessly.",
            body=(
                "Demonstrate how guests can secure their seats. Integrate your preferred booking "
                "platform by updating the reservation link below, or invite guests to call for "
                "bespoke arrangements."
            ),
            highlight="Your experience, perfectly timed.",
            image="/static/images/latte-art.svg",
            extra_info="cta=Book Now|link=#",
        ),
        "about": dict(
            title="Story & Philosophy",
            subtitle="Hospitality shaped by passion.",
            body=(
                "This space is ideal for sharing the ethos behind your brand — from sourcing "
                "ingredients to honoring community. Customize the narrative to articulate the "
                "values that distinguish your establishment."
            ),
            highlight="Crafting comfort through mindful details.",
            image="/static/images/roastery.svg",
            extra_info="team=Founder, Head Roaster, Experience Curator",
        ),
        "features": dict(
            title="Highlights",
            subtitle="Distinctive delights for every visit.",
            body="Update these feature cards to emphasize seasonal menus, artisan partnerships, or special services.",
            highlight="Curated just for you.",
            image="/static/images/dessert.svg",
            extra_info="",
        ),
    }

    for section, data in default_contents.items():
        placeholders = "SELECT id FROM site_content WHERE section = ?"
        cur.execute(placeholders, (section,))
        if cur.fetchone() is None:
            cur.execute(
                """
                INSERT INTO site_content (section, title, subtitle, body, highlight, image, extra_info)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    section,
                    data.get("title"),
                    data.get("subtitle"),
                    data.get("body"),
                    data.get("highlight"),
                    data.get("image"),
                    data.get("extra_info"),
                ),
            )

    # Seed gallery images if empty
    cur.execute("SELECT COUNT(*) FROM gallery_images")
    if cur.fetchone()[0] == 0:
        sample_images = [
            ("/static/images/gallery1.svg", "Signature espresso moment"),
            ("/static/images/gallery2.svg", "Community events & pop-ups"),
            ("/static/images/gallery3.svg", "Curated desserts & pairings"),
        ]
        for order, (path, caption) in enumerate(sample_images, start=1):
            cur.execute(
                "INSERT INTO gallery_images (file_path, caption, display_order, created_at) VALUES (?, ?, ?, ?)",
                (path, caption, order, datetime.utcnow().isoformat()),
            )

    # Seed feature cards if empty
    cur.execute("SELECT COUNT(*) FROM features")
    if cur.fetchone()[0] == 0:
        sample_features = [
            ("Seasonal Pairings", "Rotating dessert collaborations designed for each roast profile.", "fa-leaf"),
            ("Acoustic Evenings", "Live sessions every weekend featuring local talent.", "fa-music"),
            ("Barista Workshops", "Hands-on brewing classes to empower enthusiasts.", "fa-chalkboard-teacher"),
        ]
        for title, description, icon in sample_features:
            cur.execute(
                "INSERT INTO features (title, description, icon) VALUES (?, ?, ?)",
                (title, description, icon),
            )

    cur.execute("SELECT COUNT(*) FROM announcements")
    if cur.fetchone()[0] == 0:
        cur.execute(
            "INSERT INTO announcements (title, content, published_at) VALUES (?, ?, ?)",
            (
                "Now Brewing: Demo Origin",
                "Showcase a featured bean or seasonal menu item to keep guests informed.",
                datetime.utcnow().isoformat(),
            ),
        )


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# Utility functions

def fetch_content(section: str):
    conn = get_db_connection()
    content = conn.execute(
        "SELECT * FROM site_content WHERE section = ?", (section,)
    ).fetchone()
    conn.close()
    return content


def update_content(section: str, data: dict) -> None:
    conn = get_db_connection()
    conn.execute(
        """
        UPDATE site_content
        SET title = ?, subtitle = ?, body = ?, highlight = ?, image = ?, extra_info = ?
        WHERE section = ?
        """,
        (
            data.get("title"),
            data.get("subtitle"),
            data.get("body"),
            data.get("highlight"),
            data.get("image"),
            data.get("extra_info"),
            section,
        ),
    )
    conn.commit()
    conn.close()


# Route registration

def register_routes(app: Flask) -> None:
    @app.context_processor
    def inject_navigation():
        return dict(
            nav_links=[
                ("Home", "main.top"),
                ("Access", "main.access"),
                ("Reservations", "main.reservations"),
                ("Gallery", "main.gallery"),
                ("Story", "main.about"),
                ("Highlights", "main.features"),
            ]
        )

    @app.context_processor
    def inject_now():
        return dict(now=datetime.utcnow)


    def login_required(view_func):
        @wraps(view_func)
        def wrapper(*args, **kwargs):
            if not session.get("user_id"):
                flash("ログインが必要です。", "warning")
                return redirect(url_for("admin.login"))
            return view_func(*args, **kwargs)

        return wrapper

    # Public pages blueprint-like grouping
    def top():
        content = fetch_content("top")
        features = fetch_features()
        announcements = fetch_announcements()
        gallery = fetch_gallery(limit=4)
        return render_template(
            "site/top.html",
            content=content,
            features=features,
            announcements=announcements,
            gallery=gallery,
        )
    def access():
        content = fetch_content("access")
        return render_template("site/access.html", content=content)
    def reservations():
        content = fetch_content("reservations")
        return render_template("site/reservations.html", content=content)
    def gallery():
        images = fetch_gallery()
        return render_template("site/gallery.html", images=images)
    def about():
        content = fetch_content("about")
        announcements = fetch_announcements()
        return render_template("site/about.html", content=content, announcements=announcements)
    def features_page():
        content = fetch_content("features")
        features = fetch_features()
        return render_template("site/features.html", content=content, features=features)
    # Admin routes
    def login():
        if request.method == "POST":
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "")
            conn = get_db_connection()
            user = conn.execute(
                "SELECT * FROM users WHERE username = ?", (username,)
            ).fetchone()
            conn.close()
            if user and check_password_hash(user["password_hash"], password):
                session["user_id"] = user["id"]
                session["username"] = user["username"]
                flash("ログインしました。", "success")
                return redirect(url_for("admin.dashboard"))
            flash("ログインに失敗しました。", "danger")
        return render_template("admin/login.html")
    @login_required
    def logout():
        session.clear()
        flash("ログアウトしました。", "info")
        return redirect(url_for("admin.login"))
    @login_required
    def dashboard():
        contents = fetch_all_content()
        stats = {
            "gallery_count": len(fetch_gallery()),
            "feature_count": len(fetch_features()),
            "announcement_count": len(fetch_announcements()),
        }
        return render_template(
            "admin/dashboard.html", contents=contents, stats=stats
        )
    @login_required
    def edit_content(section):
        content = fetch_content(section)
        if not content:
            flash("セクションが見つかりません。", "danger")
            return redirect(url_for("admin.dashboard"))
        if request.method == "POST":
            data = {
                "title": request.form.get("title"),
                "subtitle": request.form.get("subtitle"),
                "body": request.form.get("body"),
                "highlight": request.form.get("highlight"),
                "image": request.form.get("image"),
                "extra_info": request.form.get("extra_info"),
            }
            update_content(section, data)
            flash("更新しました。", "success")
            return redirect(url_for("admin.edit_content", section=section))
        return render_template("admin/edit_content.html", content=content)
    @login_required
    def manage_gallery():
        if request.method == "POST":
            action = request.form.get("action")
            if action == "delete":
                image_id = request.form.get("image_id")
                delete_gallery_image(image_id)
                flash("画像を削除しました。", "info")
            else:
                file = request.files.get("image")
                caption = request.form.get("caption")
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    save_path = Path(app.config["UPLOAD_FOLDER"]) / filename
                    counter = 1
                    base, ext = os.path.splitext(filename)
                    while save_path.exists():
                        filename = f"{base}_{counter}{ext}"
                        save_path = Path(app.config["UPLOAD_FOLDER"]) / filename
                        counter += 1
                    file.save(save_path)
                    store_path = f"/static/uploads/{filename}"
                    add_gallery_image(store_path, caption)
                    flash("ギャラリーを更新しました。", "success")
                else:
                    flash("画像ファイルを選択してください。", "warning")
        images = fetch_gallery()
        return render_template("admin/manage_gallery.html", images=images)
    @login_required
    def manage_features():
        if request.method == "POST":
            action = request.form.get("action")
            if action == "add":
                title = request.form.get("title")
                description = request.form.get("description")
                icon = request.form.get("icon", "fa-mug-hot")
                add_feature(title, description, icon)
                flash("ハイライトを追加しました。", "success")
            elif action == "delete":
                feature_id = request.form.get("feature_id")
                delete_feature(feature_id)
                flash("ハイライトを削除しました。", "info")
        features = fetch_features()
        return render_template("admin/manage_features.html", features=features)
    @login_required
    def manage_announcements():
        if request.method == "POST":
            action = request.form.get("action")
            if action == "add":
                title = request.form.get("title")
                content = request.form.get("content")
                add_announcement(title, content)
                flash("お知らせを追加しました。", "success")
            elif action == "delete":
                announcement_id = request.form.get("announcement_id")
                delete_announcement(announcement_id)
                flash("お知らせを削除しました。", "info")
        announcements = fetch_announcements()
        return render_template(
            "admin/manage_announcements.html", announcements=announcements
        )
    # Blueprint naming compatibility for nav
    app.add_url_rule("/", endpoint="main.top", view_func=top)
    app.add_url_rule("/access", endpoint="main.access", view_func=access)
    app.add_url_rule(
        "/reservations", endpoint="main.reservations", view_func=reservations
    )
    app.add_url_rule("/gallery", endpoint="main.gallery", view_func=gallery)
    app.add_url_rule("/about", endpoint="main.about", view_func=about)
    app.add_url_rule("/highlights", endpoint="main.features", view_func=features_page)

    app.add_url_rule(
        "/admin", endpoint="admin.dashboard", view_func=dashboard
    )
    app.add_url_rule(
        "/admin/login", endpoint="admin.login", view_func=login, methods=["GET", "POST"]
    )
    app.add_url_rule(
        "/admin/logout", endpoint="admin.logout", view_func=logout
    )
    app.add_url_rule(
        "/admin/content/<section>",
        endpoint="admin.edit_content",
        view_func=edit_content,
        methods=["GET", "POST"],
    )
    app.add_url_rule(
        "/admin/gallery",
        endpoint="admin.manage_gallery",
        view_func=manage_gallery,
        methods=["GET", "POST"],
    )
    app.add_url_rule(
        "/admin/features",
        endpoint="admin.manage_features",
        view_func=manage_features,
        methods=["GET", "POST"],
    )
    app.add_url_rule(
        "/admin/announcements",
        endpoint="admin.manage_announcements",
        view_func=manage_announcements,
        methods=["GET", "POST"],
    )


# Data helpers

def fetch_all_content():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM site_content ORDER BY section").fetchall()
    conn.close()
    return rows


def fetch_gallery(limit: int | None = None):
    conn = get_db_connection()
    query = "SELECT * FROM gallery_images ORDER BY display_order, created_at DESC"
    if limit:
        query += " LIMIT ?"
        images = conn.execute(query, (limit,)).fetchall()
    else:
        images = conn.execute(query).fetchall()
    conn.close()
    return images


def add_gallery_image(file_path: str, caption: str | None) -> None:
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO gallery_images (file_path, caption, created_at) VALUES (?, ?, ?)",
        (file_path, caption, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()


def delete_gallery_image(image_id: str | None) -> None:
    if not image_id:
        return
    conn = get_db_connection()
    conn.execute("DELETE FROM gallery_images WHERE id = ?", (image_id,))
    conn.commit()
    conn.close()


def fetch_features():
    conn = get_db_connection()
    features = conn.execute("SELECT * FROM features ORDER BY id").fetchall()
    conn.close()
    return features


def add_feature(title: str | None, description: str | None, icon: str) -> None:
    if not title or not description:
        return
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO features (title, description, icon) VALUES (?, ?, ?)",
        (title, description, icon),
    )
    conn.commit()
    conn.close()


def delete_feature(feature_id: str | None) -> None:
    if not feature_id:
        return
    conn = get_db_connection()
    conn.execute("DELETE FROM features WHERE id = ?", (feature_id,))
    conn.commit()
    conn.close()


def fetch_announcements():
    conn = get_db_connection()
    announcements = conn.execute(
        "SELECT * FROM announcements ORDER BY datetime(published_at) DESC"
    ).fetchall()
    conn.close()
    return announcements


def add_announcement(title: str | None, content: str | None) -> None:
    if not title or not content:
        return
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO announcements (title, content, published_at) VALUES (?, ?, ?)",
        (title, content, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()


def delete_announcement(announcement_id: str | None) -> None:
    if not announcement_id:
        return
    conn = get_db_connection()
    conn.execute("DELETE FROM announcements WHERE id = ?", (announcement_id,))
    conn.commit()
    conn.close()


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
