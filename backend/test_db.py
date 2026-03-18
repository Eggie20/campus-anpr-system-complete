from sqlalchemy import create_engine, text
engine = create_engine('postgresql://postgres:jessel31@localhost:5432/campus_anpr')
try:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT email, status FROM users')).fetchall()
        print("USERS:", result)
except Exception as e:
    print("ERROR:", e)
