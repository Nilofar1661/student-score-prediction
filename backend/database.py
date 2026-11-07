"""
SQLite Database module for storing prediction history locally.
Ensures lightweight persistence without external server dependencies.
"""

import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

DB_PATH = Path(__file__).resolve().parent / "history.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the SQLite tables if they do not exist."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                student_summary TEXT NOT NULL,
                predicted_score REAL NOT NULL,
                band TEXT NOT NULL,
                letter_grade TEXT NOT NULL,
                pass_probability REAL NOT NULL,
                inputs_json TEXT NOT NULL,
                output_json TEXT NOT NULL
            )
        """)
        conn.commit()

def save_prediction(pred: Dict[str, Any]):
    """Saves a prediction record into the SQLite database."""
    init_db()
    inputs = pred.get("submitted_inputs", {})
    summary = f"Age {inputs.get('age', '?')}, {inputs.get('gender', '?')} | Study: {inputs.get('study_hours_per_day', '?')}h | Att: {inputs.get('attendance_percentage', '?')}%"
    
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO predictions 
            (id, timestamp, student_summary, predicted_score, band, letter_grade, pass_probability, inputs_json, output_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            pred["id"],
            pred["timestamp"],
            summary,
            pred["predicted_score"],
            pred["band"],
            pred["letter_grade"],
            pred["pass_fail"]["pass_probability"],
            json.dumps(inputs),
            json.dumps(pred)
        ))
        conn.commit()

def get_all_history(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves prediction history ordered by newest first."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, timestamp, student_summary, predicted_score, band, letter_grade, pass_probability, inputs_json
            FROM predictions
            ORDER BY timestamp DESC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()

    history = []
    for r in rows:
        history.append({
            "id": r["id"],
            "timestamp": r["timestamp"],
            "student_summary": r["student_summary"],
            "predicted_score": r["predicted_score"],
            "band": r["band"],
            "letter_grade": r["letter_grade"],
            "pass_probability": r["pass_probability"],
            "inputs": json.loads(r["inputs_json"])
        })
    return history

def delete_prediction_by_id(pred_id: str) -> bool:
    """Deletes a specific prediction by ID."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM predictions WHERE id = ?", (pred_id,))
        conn.commit()
        return cursor.rowcount > 0

def clear_all_history():
    """Clears all records in the predictions table."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM predictions")
        conn.commit()
