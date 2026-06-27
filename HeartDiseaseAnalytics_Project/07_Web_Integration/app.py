import os
import sqlite3
import pandas as pd
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

CSV_FILE_PATH = os.path.join(os.path.dirname(__file__), 'dataset.csv')


def get_db_connection():
    """CSV data ko memory SQL database me load karta hai"""
    conn = sqlite3.connect(':memory:')

    if os.path.exists(CSV_FILE_PATH):
        try:
            df = pd.read_csv(CSV_FILE_PATH)

            # clean column names
            df.columns = [c.strip().lower() for c in df.columns]

            df.to_sql('heart_disease_uci', conn, if_exists='replace', index=False)
            print("🚀 Data loaded successfully into SQLite memory DB!")

        except Exception as e:
            print(f"❌ CSV Load Error: {str(e)}")

    else:
        print("⚠ dataset.csv not found, creating empty table")

        conn.execute('''
            CREATE TABLE IF NOT EXISTS heart_disease_uci (
                id INTEGER,
                age INTEGER,
                sex TEXT,
                dataset TEXT,
                cp INTEGER,
                trestbps INTEGER,
                chol INTEGER,
                fbs INTEGER,
                restecg INTEGER,
                thalch INTEGER,
                exang INTEGER,
                oldpeak REAL,
                slope INTEGER,
                ca INTEGER,
                thal INTEGER,
                num INTEGER
            )
        ''')

    conn.row_factory = sqlite3.Row
    return conn


# ---------------- HOME PAGE ----------------
@app.route("/")
def home():
    return render_template("index.html")


# ---------------- SQL API ----------------
@app.route("/api/execute-sql", methods=["POST"])
def execute_sql():
    data = request.get_json() or {}
    query = data.get("query", "").strip()

    if not query:
        return jsonify({"success": False, "error": "No SQL query provided"}), 400

    # security: only SELECT allowed
    if not query.lower().startswith("select"):
        return jsonify({
            "success": False,
            "error": "Only SELECT queries are allowed"
        }), 403

    conn = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(query)

        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()

        results = [dict(row) for row in rows]

        return jsonify({
            "success": True,
            "columns": columns,
            "data": results
        })

    except sqlite3.Error as e:
        return jsonify({
            "success": False,
            "error": f"SQL Error: {str(e)}"
        }), 200

    finally:
        if conn:
            conn.close()


# ---------------- ERROR HANDLER ----------------
@app.errorhandler(404)
def not_found(e):
    return "<h3>404 - Page Not Found (Heart Analysis App)</h3>", 404


# ❌ IMPORTANT: NO app.run() HERE (required for Render/Cloud)