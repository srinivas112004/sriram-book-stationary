import os
import json
import hashlib
from flask import Flask, request, jsonify, send_from_directory, render_template, redirect, url_for, session, flash
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime
from functools import wraps

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

app.secret_key = "mysupersecret123"  # ✅ Hardcoded secret key for sessions

# Admin credentials (in production, use environment variables)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "sriram123"  # Change this to a strong password

UPLOAD_FOLDER = 'uploads'
DB_PATH = 'db.json'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'txt'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session or not session['logged_in']:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Hash password function
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Check if file extension is allowed
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['logged_in'] = True
            session['username'] = username
            flash('Login successful!', 'success')
            return redirect(url_for('admin_page'))
        else:
            flash('Invalid username or password!', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out successfully!', 'info')
    return redirect(url_for('login'))

@app.route('/admin')
@login_required
def admin_page():
    return render_template('admin.html')


@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    # Handle preflight request
    if request.method == 'OPTIONS':
        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response, 200
    
    try:
        # Validate request data
        name = request.form.get("name")
        phone = request.form.get("phone")
        files = request.files.getlist("files[]")

        print(f"[UPLOAD] Received upload request - Name: {name}, Phone: {phone}, Files count: {len(files)}")

        if not name or not phone:
            return jsonify({'success': False, 'message': 'Name and phone number are required'}), 400

        if not files or len(files) == 0:
            return jsonify({'success': False, 'message': 'No files selected'}), 400

        # Validate and save files
        saved_files = []
        for file in files:
            if file and file.filename != '':
                # Check if file type is allowed
                if not allowed_file(file.filename):
                    allowed_types = ', '.join(ALLOWED_EXTENSIONS)
                    return jsonify({
                        'success': False, 
                        'message': f'File type not allowed: {file.filename}. Allowed types: {allowed_types}'
                    }), 400
                
                # Generate unique filename
                filename = datetime.now().strftime("%Y%m%d%H%M%S-") + secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                
                # Save file
                file.save(filepath)
                saved_files.append(filename)
                print(f"[UPLOAD] Saved file: {filepath}")

        if len(saved_files) == 0:
            return jsonify({'success': False, 'message': 'No valid files were uploaded'}), 400

        # Read existing data
        data = []
        if os.path.exists(DB_PATH):
            with open(DB_PATH, 'r') as db_file:
                try:
                    data = json.load(db_file)
                except json.JSONDecodeError:
                    data = []

        # Append new order with default status
        new_order = {
            'name': name,
            'phone': phone,
            'files': saved_files,
            'status': 'pending',
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        data.append(new_order)

        # Write back to db.json
        with open(DB_PATH, 'w') as db_file:
            json.dump(data, db_file, indent=4)

        print(f"[UPLOAD] Successfully saved {len(saved_files)} files for {name}")
        
        response = jsonify({'success': True, 'files': saved_files, 'message': 'Files uploaded successfully'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 200

    except Exception as e:
        print(f"[UPLOAD] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500


@app.route('/orders', methods=['GET'])
@login_required
def orders():
    if os.path.exists(DB_PATH):
        with open(DB_PATH, 'r') as db_file:
            try:
                data = json.load(db_file)
            except json.JSONDecodeError:
                data = []
    else:
        data = []
    return jsonify(data)


@app.route('/complete/<int:order_index>', methods=['POST'])
@login_required
def complete_order(order_index):
    """Mark order as completed ✅"""
    if os.path.exists(DB_PATH):
        with open(DB_PATH, 'r') as db_file:
            try:
                data = json.load(db_file)
            except json.JSONDecodeError:
                data = []
    else:
        data = []

    if 0 <= order_index < len(data):
        data[order_index]['status'] = 'completed'
        with open(DB_PATH, 'w') as db_file:
            json.dump(data, db_file, indent=4)
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Invalid index'}), 400


@app.route('/delete/<int:order_id>', methods=['POST'])
@login_required
def delete_order(order_id):
    try:
        # Load existing DB
        if os.path.exists(DB_PATH):
            with open(DB_PATH, 'r') as db_file:
                try:
                    data = json.load(db_file)
                except json.JSONDecodeError:
                    data = []
        else:
            data = []

        # Validate order index
        if order_id < 0 or order_id >= len(data):
            print(f"[DELETE] Invalid order_id: {order_id}")
            return jsonify({'success': False, 'message': 'Invalid order ID'}), 400

        order = data.pop(order_id)
        print(f"[DELETE] Deleting order at index {order_id}: {order}")

        # Delete uploaded files safely
        for file in order.get("files", []):
            # Handle both string filenames and dict {filename, originalname}
            if isinstance(file, dict) and "filename" in file:
                filename = file["filename"]
            else:
                filename = file
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            print(f"[DELETE] Attempting to delete file: {filepath}")
            if os.path.exists(filepath):
                os.remove(filepath)
                print(f"[DELETE] File deleted: {filepath}")
            else:
                print(f"[DELETE] File not found: {filepath}")

        # Save updated DB
        with open(DB_PATH, 'w') as db_file:
            json.dump(data, db_file, indent=4)
        print(f"[DELETE] Order deleted and db.json updated.")
        return jsonify({'success': True}), 200

    except Exception as e:
        print(f"[DELETE] Exception: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500



@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/debug/db')
@login_required
def debug_db():
    """Debug route to check database status"""
    try:
        db_exists = os.path.exists(DB_PATH)
        data = []
        
        if db_exists:
            with open(DB_PATH, 'r') as db_file:
                try:
                    data = json.load(db_file)
                except json.JSONDecodeError as e:
                    return jsonify({
                        'db_exists': True,
                        'error': f'JSON decode error: {e}',
                        'file_content': db_file.read() if db_file else 'Empty file'
                    })
        
        return jsonify({
            'db_exists': db_exists,
            'db_path': DB_PATH,
            'data_count': len(data),
            'data': data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/debug/session')
@login_required
def debug_session():
    """Debug route to check session status"""
    return jsonify({
        'logged_in': session.get('logged_in', False),
        'username': session.get('username', 'Unknown'),
        'session_id': session.get('_id', 'No session ID')
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
