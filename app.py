from flask import Flask, render_template, request, redirect, url_for, session, flash, make_response
from datetime import datetime
import json
import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

# Data storage (in production, use a proper database)
DATA_FILE = 'data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {
        'employees': {},
        'requests': [],
        'next_request_id': 1
    }

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    print(f"Login attempt received: {request.form}")  # Debug logging
    username = request.form.get('username')
    password = request.form.get('password')
    user_type = request.form.get('user_type')
    
    print(f"User type: {user_type}, Username: {username}, Password: {'***' if password else None}")  # Debug logging
    
    if user_type == 'employee':
        if username and password:
            data = load_data()
            if username in data['employees'] and data['employees'][username]['password'] == password:
                session['username'] = username
                session['user_type'] = 'employee'
                print(f"Employee login successful for: {username}")  # Debug logging
                return redirect(url_for('employee_dashboard'))
            else:
                flash('Invalid employee username or password')
                print(f"Employee login failed: Invalid credentials for '{username}'")  # Debug logging
        else:
            flash('Please enter both username and password')
            print("Employee login failed: Missing username or password")  # Debug logging
    elif user_type == 'manager':
        if password == 'Manager123':
            session['user_type'] = 'manager'
            print("Manager login successful")  # Debug logging
            return redirect(url_for('manager_dashboard'))
        else:
            flash('Invalid manager password')
            print(f"Manager login failed: Invalid password '{password}'")  # Debug logging
    elif user_type == 'security':
        if password == 'Security123':
            session['user_type'] = 'security'
            print("Security login successful")  # Debug logging
            return redirect(url_for('security_dashboard'))
        else:
            flash('Invalid security password')
            print(f"Security login failed: Invalid password '{password}'")  # Debug logging
    
    print("Login failed, redirecting to index")  # Debug logging
    return redirect(url_for('index'))

@app.route('/employee_dashboard')
def employee_dashboard():
    if 'username' not in session or session.get('user_type') != 'employee':
        return redirect(url_for('index'))
    
    data = load_data()
    username = session['username']
    employee_name = data['employees'].get(username, {}).get('name', username)
    
    # Get user's requests
    user_requests = [req for req in data['requests'] if req['username'] == username]
    
    return render_template('employee_dashboard.html', 
                         username=username,
                         employee_name=employee_name,
                         requests=user_requests)

@app.route('/manager_dashboard')
def manager_dashboard():
    if session.get('user_type') != 'manager':
        return redirect(url_for('index'))
    
    data = load_data()
    pending_requests = [req for req in data['requests'] if req['status'] == 'pending']
    all_requests = data['requests']
    
    # Add employee names to requests
    for req in pending_requests:
        req['employee_name'] = data['employees'].get(req['username'], {}).get('name', req['username'])
    for req in all_requests:
        req['employee_name'] = data['employees'].get(req['username'], {}).get('name', req['username'])
    
    return render_template('manager_dashboard.html', 
                         pending_requests=pending_requests,
                         all_requests=all_requests)

@app.route('/security_dashboard')
def security_dashboard():
    if session.get('user_type') != 'security':
        return redirect(url_for('index'))
    
    data = load_data()
    approved_requests = [req for req in data['requests'] if req['status'] == 'approved']
    
    # Add employee names to requests
    for req in approved_requests:
        req['employee_name'] = data['employees'].get(req['username'], {}).get('name', req['username'])
    
    return render_template('security_dashboard.html', 
                         approved_requests=approved_requests)

@app.route('/submit_request', methods=['POST'])
def submit_request():
    if 'username' not in session or session.get('user_type') != 'employee':
        return redirect(url_for('index'))
    
    data = load_data()
    
    new_request = {
        'id': data['next_request_id'],
        'username': session['username'],
        'start_date': request.form.get('start_date'),
        'end_date': request.form.get('end_date'),
        'start_time': request.form.get('start_time'),
        'end_time': request.form.get('end_time'),
        'reason': request.form.get('reason'),
        'status': 'pending',
        'submitted_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'manager_comment': ''
    }
    
    data['requests'].append(new_request)
    data['next_request_id'] += 1
    save_data(data)
    
    flash('Request submitted successfully!')
    return redirect(url_for('employee_dashboard'))

@app.route('/update_request_status', methods=['POST'])
def update_request_status():
    if session.get('user_type') != 'manager':
        return redirect(url_for('index'))
    
    data = load_data()
    request_id = int(request.form.get('request_id'))
    new_status = request.form.get('status')
    comment = request.form.get('comment', '')
    
    for req in data['requests']:
        if req['id'] == request_id:
            req['status'] = new_status
            req['manager_comment'] = comment
            req['reviewed_date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            break
    
    save_data(data)
    flash(f'Request {new_status} successfully!')
    return redirect(url_for('manager_dashboard'))

@app.route('/download_request_pdf/<int:request_id>')
def download_request_pdf(request_id):
    # Check if user is authorized (employee can download their own, manager can download any)
    if session.get('user_type') not in ['employee', 'manager']:
        return redirect(url_for('index'))
    
    data = load_data()
    request_data = None
    
    for req in data['requests']:
        if req['id'] == request_id:
            # If employee, check if it's their request
            if session.get('user_type') == 'employee' and req['username'] != session.get('username'):
                flash('You can only download your own requests')
                return redirect(url_for('employee_dashboard'))
            request_data = req
            break
    
    if not request_data:
        flash('Request not found')
        return redirect(url_for('employee_dashboard' if session.get('user_type') == 'employee' else 'manager_dashboard'))
    
    # Only allow download for approved or rejected requests
    if request_data['status'] not in ['approved', 'rejected']:
        flash('PDF download is only available for approved or rejected requests')
        return redirect(url_for('employee_dashboard' if session.get('user_type') == 'employee' else 'manager_dashboard'))
    
    # Create PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    
    # Add title
    title = Paragraph("Leave Request Report", title_style)
    elements.append(title)
    elements.append(Spacer(1, 12))
    
    # Get employee full name
    employee_name = data['employees'].get(request_data['username'], {}).get('name', request_data['username'])
    
    # Create table data
    table_data = [
        ['Request ID:', f"#{request_data['id']}"],
        ['Employee:', employee_name],
        ['Start Date:', request_data['start_date']],
        ['End Date:', request_data['end_date']],
    ]
    
    # Add time fields if they exist
    if 'start_time' in request_data and request_data['start_time']:
        table_data.append(['Start Time:', request_data['start_time']])
    if 'end_time' in request_data and request_data['end_time']:
        table_data.append(['End Time:', request_data['end_time']])
    
    table_data.extend([
        ['Status:', request_data['status'].title()],
        ['Submitted Date:', request_data['submitted_date']],
        ['Reason:', request_data['reason']]
    ])
    
    if request_data.get('manager_comment'):
        table_data.append(['Manager Comment:', request_data['manager_comment']])
    
    if request_data.get('reviewed_date'):
        table_data.append(['Reviewed Date:', request_data['reviewed_date']])
    
    # Create table
    table = Table(table_data, colWidths=[2*inch, 4*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (1, 0), (1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 20))
    
    # Add footer
    footer_text = f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    footer = Paragraph(footer_text, styles['Normal'])
    elements.append(footer)
    
    # Build PDF
    doc.build(elements)
    
    # Get PDF data
    pdf_data = buffer.getvalue()
    buffer.close()
    
    # Create response
    response = make_response(pdf_data)
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename=leave_request_{request_id}.pdf'
    
    return response

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)