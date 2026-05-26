import psycopg2
conn = psycopg2.connect('dbname=campus_anpr user=postgres password=postgres host=localhost')
c = conn.cursor()
c.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'anpr_plate_captures'")
print([r[0] for r in c.fetchall()])
