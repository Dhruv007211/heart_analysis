import os
import sqlite3
import pandas as pd
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

CSV_FILE_PATH = os.path.join(os.path.dirname(__file__), 'dataset.csv')

def get_db_connection():
    """CSV data ko read karke memory mein ek temporary SQL database banata hai"""
    conn = sqlite3.connect(':memory:')
    
    if os.path.exists(CSV_FILE_PATH):
        try:
            df = pd.read_csv(CSV_FILE_PATH)
            # Column names ko clean aur lowercase kar rahe hain taaki mismatch na ho
            df.columns = [c.strip().lower() for c in df.columns]
            
            # Aapke SQL schema ke mutabiq table ka naam 'heart_disease_uci' rakha hai
            df.to_sql('heart_disease_uci', conn, if_exists='replace', index=False)
            print("🚀 CSV Data successfully loaded into heart_disease_uci table!")
        except Exception as e:
            print(f"❌ Error loading CSV: {str(e)}")
    else:
        print("⚠️ Warning: dataset.csv not found! Creating an empty schema fallback.")
        conn.execute('''
            CREATE TABLE IF NOT EXISTS heart_disease_uci (
                id INTEGER, age INTEGER, sex TEXT, dataset TEXT, cp INTEGER, 
                trestbps INTEGER, chol INTEGER, fbs INTEGER, restecg INTEGER, 
                thalch INTEGER, exang INTEGER, oldpeak REAL, slope INTEGER, 
                ca INTEGER, thal INTEGER, num INTEGER
            )
        ''')
    
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/execute-sql", methods=["POST"])
def execute_sql():
    """Frontend terminal se aane wali queries ko execute karne ka API endpoint"""
    request_data = request.get_json() or {}
    raw_query = request_data.get('query', '').strip()
    
    if not raw_query:
        return jsonify({'success': False, 'error': 'No SQL query provided.'}), 400
        
    # Security filter: Only allow read-only (SELECT) queries
    if not raw_query.lower().startswith('select'):
        return jsonify({'success': False, 'error': 'Security Restriction: Only SELECT queries are allowed.'}), 403

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(raw_query)
        
        # Table ke headers (columns) aur data nikalna
        columns = [description[0] for description in cursor.description]
        rows = cursor.fetchall()
        
        # Data ko JSON structures mein convert karna
        results = [dict(row) for row in rows]
            
        return jsonify({
            'success': True,
            'columns': columns,
            'data': results
        })
        
    except sqlite3.Error as e:
        # SQL syntax ya query error ko catch karke front-end ko batana
        return jsonify({
            'success': False, 
            'error': f"SQL Syntax Error: {str(e)}"
        }), 200
    finally:
        if conn:
            conn.close()

@app.errorhandler(404)
def page_not_found(e):
    return "<h3>Error 404: Clinical Portal Page Not Found</h3>", 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)