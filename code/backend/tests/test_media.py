from conftest import ADMIN

from app import storage
from app.config import settings

JPEG = b"\xff\xd8\xff\xe0" + b"0" * 2000


def upload(client, content=JPEG, content_type="image/jpeg", caption="DQ200 clutch pack"):
    """The three upload steps the admin page does, in local mode."""
    r = client.post("/api/media/uploads", json={"content_type": content_type, "size": len(content)}, headers=ADMIN)
    assert r.status_code == 200, r.text
    target = r.json()
    assert target["url"] == "/api/media/local-upload"
    r = client.post(target["url"], data=target["fields"], files={"file": ("x", content, content_type)}, headers=ADMIN)
    assert r.status_code == 204, r.text
    r = client.post("/api/media", json={"key": target["key"], "caption": caption}, headers=ADMIN)
    assert r.status_code == 201, r.text
    return r.json()


def test_upload_and_show_in_gallery(client):
    item = upload(client)
    assert item["kind"] == "photo" and item["size"] == len(JPEG) and item["published"]

    gallery = client.get("/api/public/media").json()
    assert [g["id"] for g in gallery] == [item["id"]]
    r = client.get(item["url"])
    assert r.status_code == 200 and r.content == JPEG and r.headers["content-type"] == "image/jpeg"


def test_video_is_served_in_ranges(client):
    item = upload(client, content=b"v" * 5000, content_type="video/mp4", caption="")
    assert item["kind"] == "video" and item["caption"] is None
    r = client.get(item["url"], headers={"Range": "bytes=0-99"})
    assert r.status_code == 206 and len(r.content) == 100


def test_hide_caption_and_delete(client):
    item = upload(client)
    r = client.patch(f"/api/media/{item['id']}", json={"published": False, "caption": "New"}, headers=ADMIN)
    assert r.json()["published"] is False and r.json()["caption"] == "New"
    assert client.get("/api/public/media").json() == []
    assert len(client.get("/api/media", headers=ADMIN).json()) == 1

    assert client.delete(f"/api/media/{item['id']}", headers=ADMIN).status_code == 204
    assert client.get("/api/media", headers=ADMIN).json() == []
    assert client.get(item["url"]).status_code == 404


def test_upload_rules(client):
    assert client.post("/api/media/uploads", json={"content_type": "image/gif", "size": 10}, headers=ADMIN).status_code == 422
    too_big = (settings.max_photo_mb + 1) * 1024 * 1024
    assert client.post("/api/media/uploads", json={"content_type": "image/png", "size": too_big}, headers=ADMIN).status_code == 413
    # Not uploaded, or a made-up key
    assert client.post("/api/media", json={"key": "media/" + "a" * 32 + ".jpg"}, headers=ADMIN).status_code == 422
    assert client.post("/api/media", json={"key": "../app/main.py"}, headers=ADMIN).status_code == 422


def test_media_office_needs_key(client):
    assert client.get("/api/media").status_code == 401
    assert client.post("/api/media/uploads", json={"content_type": "image/png", "size": 10}).status_code == 401
    assert client.post("/api/media/local-upload", data={"key": "x"}, files={"file": ("x", b"1")}).status_code == 401


def test_s3_mode_gives_a_signed_form(client, monkeypatch):
    monkeypatch.setattr(settings, "s3_bucket", "test-bucket")
    monkeypatch.setattr(storage, "_s3", None)
    monkeypatch.setenv("AWS_REGION", "ap-south-1")
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "test")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "test")
    r = client.post("/api/media/uploads", json={"content_type": "video/mp4", "size": 1000}, headers=ADMIN)
    target = r.json()
    assert target["url"].startswith("https://test-bucket.s3")
    assert target["fields"]["key"] == target["key"] and target["fields"]["Content-Type"] == "video/mp4"
    assert "policy" in target["fields"]

    r = client.get("/" + target["key"], follow_redirects=False)
    assert r.status_code == 307 and "X-Amz-Signature" in r.headers["location"]
    monkeypatch.setattr(storage, "_s3", None)


def test_youtube_links(client):
    vid = "dQw4w9WgXcQ"
    for link in [
        f"https://www.youtube.com/watch?v={vid}&t=42s",
        f"https://youtu.be/{vid}?si=abc",
        f"youtube.com/shorts/{vid}",
        f"https://m.youtube.com/watch?feature=share&v={vid}",
        f"https://www.youtube.com/embed/{vid}",
        f"https://www.youtube.com/live/{vid}",
        vid,
    ]:
        assert storage.youtube_id(link) == vid, link
    for bad in ["https://vimeo.com/123", "https://www.youtube.com/@channel", "https://youtu.be/short", "hello"]:
        assert storage.youtube_id(bad) is None, bad


def test_add_youtube_to_gallery(client):
    r = client.post("/api/media/youtube", json={"url": "https://youtu.be/dQw4w9WgXcQ", "caption": " DSG road test "}, headers=ADMIN)
    assert r.status_code == 201, r.text
    item = r.json()
    assert item["kind"] == "youtube" and item["youtube_id"] == "dQw4w9WgXcQ" and item["caption"] == "DSG road test"
    assert item["url"] == "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    assert [g["id"] for g in client.get("/api/public/media").json()] == [item["id"]]

    # Same video twice, a non-YouTube link, and no key
    assert client.post("/api/media/youtube", json={"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}, headers=ADMIN).status_code == 409
    assert client.post("/api/media/youtube", json={"url": "https://vimeo.com/1"}, headers=ADMIN).status_code == 422
    assert client.post("/api/media/youtube", json={"url": "https://youtu.be/dQw4w9WgXcQ"}).status_code == 401

    assert client.delete(f"/api/media/{item['id']}", headers=ADMIN).status_code == 204
    assert client.get("/api/public/media").json() == []


def test_hero_place(client):
    item = upload(client)
    assert item["place"] == "gallery"
    r = client.patch(f"/api/media/{item['id']}", json={"place": "hero-fuel"}, headers=ADMIN)
    assert r.status_code == 200 and r.json()["place"] == "hero-fuel"
    assert client.get("/api/public/media").json()[0]["place"] == "hero-fuel"
    assert client.patch(f"/api/media/{item['id']}", json={"place": "footer"}, headers=ADMIN).status_code == 422

    video = upload(client, content=b"v" * 100, content_type="video/mp4")
    assert client.patch(f"/api/media/{video['id']}", json={"place": "hero-dsg"}, headers=ADMIN).status_code == 422


def test_place_column_added_to_old_table(client):
    """A database made before `place` existed gets the column on start-up."""
    from sqlalchemy import inspect, text

    from app.database import engine, init_db

    with engine.begin() as conn:
        conn.execute(text("DROP TABLE media"))
        conn.execute(text("CREATE TABLE media (id INTEGER PRIMARY KEY, key VARCHAR(80), kind VARCHAR(10), size INTEGER,"
                          " caption VARCHAR(200), published BOOLEAN, created_at DATETIME)"))
        conn.execute(text("INSERT INTO media VALUES (1, 'youtube/dQw4w9WgXcQ', 'youtube', 0, NULL, 1, '2026-01-01')"))
    init_db()
    assert "place" in {c["name"] for c in inspect(engine).get_columns("media")}
    assert client.get("/api/public/media").json()[0]["place"] == "gallery"
