from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models.user import User
from app.core.security.password import hash_password


def seed_users(db: Session) -> None:
    users_to_seed = [
        {
            "email": "admin@gmail.com",
            "username": "admin",
            "password": "admin123",
            "role": "admin",
        },
        {
            "email": "demo@gmail.com",
            "username": "demo",
            "password": "demo1234",
            "role": "user",
        },
    ]

    for user_data in users_to_seed:
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()

        if existing_user:
            print(f"[seed] User sudah ada: {user_data['email']} (id={existing_user.id})")
            continue

        new_user = User(
            email=user_data["email"],
            username=user_data["username"],
            password_hash=hash_password(user_data["password"]),
            role=user_data["role"],
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print(f"[seed] User dibuat: {user_data['email']} (id={new_user.id})")


def init_db() -> None:
    db = SessionLocal()
    try:
        seed_users(db)
    finally:
        db.close()


if __name__ == "__main__":
    init_db()