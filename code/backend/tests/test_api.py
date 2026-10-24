from conftest import ADMIN

ENQUIRY = {
    "name": "Arjun Rao",
    "phone": "+91 98765 43210",
    "email": "",
    "car_brand": "Volkswagen",
    "car_model": "Virtus 1.5 TSI",
    "car_year": "2023",
    "service": "DSG / automatic transmission",
    "message": "Judder when pulling away in traffic",
    "preferred_date": "",
}


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_create_enquiry_and_list(client):
    r = client.post("/api/public/enquiries", json=ENQUIRY)
    assert r.status_code == 201, r.text
    new_id = r.json()["id"]

    rows = client.get("/api/enquiries", headers=ADMIN).json()
    assert [row["id"] for row in rows] == [new_id]
    row = rows[0]
    assert row["status"] == "new"
    assert row["car_year"] == 2023
    assert row["email"] is None and row["preferred_date"] is None


def test_enquiry_validation(client):
    bad_phone = {**ENQUIRY, "phone": "call me"}
    assert client.post("/api/public/enquiries", json=bad_phone).status_code == 422
    no_name = {**ENQUIRY, "name": " "}
    assert client.post("/api/public/enquiries", json=no_name).status_code == 422


def test_office_needs_key(client):
    assert client.get("/api/enquiries").status_code == 401
    assert client.get("/api/enquiries", headers={"X-Admin-Key": "wrong"}).status_code == 401


def test_update_status(client):
    new_id = client.post("/api/public/enquiries", json=ENQUIRY).json()["id"]
    r = client.patch(f"/api/enquiries/{new_id}", json={"status": "contacted"}, headers=ADMIN)
    assert r.status_code == 200 and r.json()["status"] == "contacted"
    only_new = client.get("/api/enquiries?status=new", headers=ADMIN).json()
    assert only_new == []
    assert client.patch("/api/enquiries/999", json={"status": "booked"}, headers=ADMIN).status_code == 404


def test_unknown_api_path_is_json_404(client):
    r = client.get("/api/nope")
    assert r.status_code == 404 and r.json()["detail"] == "Not found"
