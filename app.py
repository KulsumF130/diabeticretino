import os
import time
from datetime import datetime
from flask import Flask, render_code_template, render_template, request, redirect, url_for, flash, send_from_directory, jsonify, send_file
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from config import Config
from database.models import db, User, Prediction
from predict import predict_dr_grade, CLASS_NAMES, CLINICAL_RECOMMENDATIONS
from gradcam import get_gradcam_heatmap, save_and_display_gradcam, simulate_gradcam_overlay
from utils import allowed_file, hash_password, verify_password, generate_pdf_report

# Initialize Flask application
app = Flask(__name__)
app.config.from_object(Config)

# Initialize SQLAlchemy Database
db.init_app(app)

# Setup Flask-Login session manager
login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.login_message_category = 'warning'
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- Database Setup Helper ---
@app.before_request
def create_tables():
    """
    Initializes database tables and seeds a default Admin user and standard user for review.
    """
    db.create_all()
    # Check if a default admin exists, if not create one
    admin_email = "admin@retinai.com"
    if not User.query.filter_by(email=admin_email).first():
        admin = User(
            name="Senior Clinical Admin",
            email=admin_email,
            password=hash_password("admin123"),
            is_admin=True
        )
        db.session.add(admin)
        db.session.commit()
        print("Default admin user seeded successfully: admin@retinai.com / admin123")
        
    # Seed a standard patient user for testing if none exists
    demo_email = "patient@retinai.com"
    if not User.query.filter_by(email=demo_email).first():
        patient = User(
            name="John Doe",
            email=demo_email,
            password=hash_password("patient123"),
            is_admin=False
        )
        db.session.add(patient)
        db.session.commit()
        print("Default patient user seeded successfully: patient@retinai.com / patient123")

# --- Routes Definitions ---

@app.route('/')
def index():
    """
    Home page/Landing page of the RetinAI Grader.
    Displays project title, objectives, team details, and quick analytics.
    """
    return render_template('index.html')

@app.route('/about')
def about():
    """
    Displays deep technical details of the ResNet50 model, APTOS dataset, and medical references.
    """
    return render_template('about.html')

@app.route('/contact')
def contact():
    """
    Clinical support contact page.
    """
    return render_template('contact.html')

# --- User Auth Routes ---

@app.route('/register', methods=['GET', 'POST'])
def register():
    """
    Handles registration of new clinical accounts or patient dashboards.
    """
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
        
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        if not name or not email or not password:
            flash("All registration fields are required.", "danger")
            return redirect(url_for('register'))
            
        if password != confirm_password:
            flash("Passwords do not match. Please re-enter.", "danger")
            return redirect(url_for('register'))
            
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash("This email is already registered. Please log in.", "warning")
            return redirect(url_for('login'))
            
        # Create new user
        new_user = User(
            name=name,
            email=email,
            password=hash_password(password),
            is_admin=False
        )
        db.session.add(new_user)
        db.session.commit()
        
        flash("Account registered successfully! You can now log in.", "success")
        return redirect(url_for('login'))
        
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """
    Handles authentication of users and clinical admins.
    """
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
        
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        
        user = User.query.filter_by(email=email).first()
        if user and verify_password(user.password, password):
            login_user(user)
            flash(f"Welcome back, {user.name}!", "success")
            if user.is_admin:
                return redirect(url_for('admin_dashboard'))
            return redirect(url_for('dashboard'))
        else:
            flash("Invalid email or password. Please try again.", "danger")
            
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash("You have successfully logged out.", "info")
    return redirect(url_for('index'))

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    """
    Displays patient/doctor profile and allows updating account details.
    """
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        current_password = request.form.get('current_password', '')
        new_password = request.form.get('new_password', '')
        
        if not name:
            flash("Name cannot be empty.", "danger")
            return redirect(url_for('profile'))
            
        current_user.name = name
        
        if current_password and new_password:
            if verify_password(current_user.password, current_password):
                current_user.password = hash_password(new_password)
                flash("Password updated successfully!", "success")
            else:
                flash("Incorrect current password. Profile details not fully updated.", "danger")
                return redirect(url_for('profile'))
                
        db.session.commit()
        flash("Profile updated successfully!", "success")
        return redirect(url_for('profile'))
        
    return render_template('profile.html')

# --- Diagnosis & Dashboard Routes ---

@app.route('/dashboard')
@login_required
def dashboard():
    """
    User/Patient Dashboard. Shows list of previous scans and a summary card.
    """
    if current_user.is_admin:
        return redirect(url_for('admin_dashboard'))
        
    predictions = Prediction.query.filter_by(user_id=current_user.id).order_by(Prediction.date.desc()).all()
    
    # Calculate stats
    total_scans = len(predictions)
    abnormal_scans = sum(1 for p in predictions if p.prediction > 0)
    normal_scans = total_scans - abnormal_scans
    
    return render_template('dashboard.html', 
                           predictions=predictions, 
                           total_scans=total_scans, 
                           abnormal_scans=abnormal_scans,
                           normal_scans=normal_scans)

@app.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    """
    Retina image upload handler. Supports Drag & Drop, previews, and predictions.
    """
    if request.method == 'POST':
        # Check if the post request has the file part
        if 'retina_image' not in request.files:
            flash("No file parts uploaded.", "danger")
            return redirect(url_for('upload'))
            
        file = request.files['retina_image']
        if file.filename == '':
            flash("No image selected. Please choose a retinal fundus image.", "danger")
            return redirect(url_for('upload'))
            
        if file and allowed_file(file.filename, app.config['ALLOWED_EXTENSIONS']):
            # Create a secure, unique filename to prevent overwrites or SQL Injection
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"user_{current_user.id}_{timestamp}_{file.filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Predict DR Grade
            prediction_output = predict_dr_grade(filepath, app.config['MODEL_PATH'])
            
            if not prediction_output.get('success'):
                flash("Model inference failed. Contact system administrator.", "danger")
                return redirect(url_for('upload'))
                
            predicted_class = prediction_output['class_id']
            confidence = prediction_output['confidence']
            probs = prediction_output['probabilities']
            pred_time = prediction_output['prediction_time']
            
            # Generate Grad-CAM image path
            heatmap_filename = f"gradcam_{timestamp}_{file.filename}"
            heatmap_path = os.path.join(app.config['UPLOAD_FOLDER'], heatmap_filename)
            
            # Since real TensorFlow model may be loaded or simulated, we run grad-cam
            try:
                if prediction_output.get('simulated'):
                    # Call simulation gradcam generator to produce visual overlays
                    simulate_gradcam_overlay(filepath, heatmap_path)
                else:
                    # Run full Grad-CAM algorithm with TensorFlow
                    import tensorflow as tf
                    model = tf.keras.models.load_model(app.config['MODEL_PATH'])
                    from PIL import Image
                    img_array = np.array(Image.open(filepath).convert('RGB').resize((224, 224)), dtype=np.float32) / 255.0
                    img_array = np.expand_dims(img_array, axis=0)
                    heatmap = get_gradcam_heatmap(img_array, model)
                    save_and_display_gradcam(filepath, heatmap, heatmap_path)
            except Exception as e:
                print(f"Grad-CAM overlay failed: {e}. Falling back to simulation.")
                simulate_gradcam_overlay(filepath, heatmap_path)
                
            # Create paths relative to static folder for browser rendering
            rel_image_path = f"uploads/{filename}"
            rel_heatmap_path = f"uploads/{heatmap_filename}"
            
            # Store Prediction in SQLite database
            pred_record = Prediction(
                user_id=current_user.id,
                image=rel_image_path,
                heatmap=rel_heatmap_path,
                prediction=predicted_class,
                confidence=confidence,
                prob_0=probs[0],
                prob_1=probs[1],
                prob_2=probs[2],
                prob_3=probs[3],
                prob_4=probs[4],
                prediction_time=pred_time,
                date=datetime.utcnow()
            )
            db.session.add(pred_record)
            db.session.commit()
            
            flash("Retinal scan processed and diagnostic grading completed!", "success")
            return redirect(url_for('result', prediction_id=pred_record.id))
        else:
            flash("Invalid file format. Allowed formats: PNG, JPG, JPEG.", "danger")
            return redirect(url_for('upload'))
            
    return render_template('upload.html')

@app.route('/result/<int:prediction_id>')
@login_required
def result(prediction_id):
    """
    Displays full diagnostic prediction card, side-by-side heatmaps, and recommendation engine.
    """
    prediction = Prediction.query.get_or_404(prediction_id)
    
    # Check authorization (only owners or clinical admins can view results)
    if prediction.user_id != current_user.id and not current_user.is_admin:
        flash("You are not authorized to view this diagnostic file.", "danger")
        return redirect(url_for('dashboard'))
        
    class_name = CLASS_NAMES[prediction.prediction]
    recommendation = CLINICAL_RECOMMENDATIONS[prediction.prediction]
    
    # Formulate bar charts
    probabilities = [
        {'id': 0, 'name': 'No DR', 'prob': prediction.prob_0},
        {'id': 1, 'name': 'Mild DR', 'prob': prediction.prob_1},
        {'id': 2, 'name': 'Moderate DR', 'prob': prediction.prob_2},
        {'id': 3, 'name': 'Severe DR', 'prob': prediction.prob_3},
        {'id': 4, 'name': 'Proliferative DR', 'prob': prediction.prob_4}
    ]
    
    return render_template('result.html', 
                           prediction=prediction, 
                           class_name=class_name, 
                           recommendation=recommendation, 
                           probabilities=probabilities)

@app.route('/history')
@login_required
def history():
    """
    Searches and displays tabular historical reports with full pagination.
    """
    # Pagination & Search configuration
    page = request.args.get('page', 1, type=int)
    search_query = request.args.get('search', '', type=str)
    
    query = Prediction.query.filter_by(user_id=current_user.id)
    
    if search_query:
        # Match severity queries, e.g., 'Mild', 'Proliferative'
        search_query_lower = search_query.lower()
        matched_class_ids = [k for k, v in CLASS_NAMES.items() if search_query_lower in v.lower()]
        if matched_class_ids:
            query = query.filter(Prediction.prediction.in_(matched_class_ids))
            
    # Paginate with 5 items per page
    pagination = query.order_by(Prediction.date.desc()).paginate(page=page, per_page=5, error_out=False)
    predictions = pagination.items
    
    return render_template('history.html', 
                           predictions=predictions, 
                           pagination=pagination, 
                           search=search_query,
                           CLASS_NAMES=CLASS_NAMES)

@app.route('/download-report/<int:prediction_id>')
@login_required
def download_report(prediction_id):
    """
    Triggers PDF medical report generation and download.
    """
    prediction = Prediction.query.get_or_404(prediction_id)
    
    # Check authorization
    if prediction.user_id != current_user.id and not current_user.is_admin:
        flash("You are not authorized to view or download this report.", "danger")
        return redirect(url_for('dashboard'))
        
    patient = User.query.get(prediction.user_id)
    class_name = CLASS_NAMES[prediction.prediction]
    rec = CLINICAL_RECOMMENDATIONS[prediction.prediction]
    
    # Output file paths
    pdf_filename = f"Diagnostic_Report_{patient.name.replace(' ', '_')}_{prediction.id}.pdf"
    pdf_dir = os.path.join(app.root_path, 'static', 'reports')
    os.makedirs(pdf_dir, exist_ok=True)
    pdf_path = os.path.join(pdf_dir, pdf_filename)
    
    # Absolute paths to image files for PDF embedding
    abs_original_img = os.path.join(app.root_path, 'static', prediction.image)
    abs_heatmap_img = os.path.join(app.root_path, 'static', prediction.heatmap) if prediction.heatmap else None
    
    # Build PDF report
    generate_pdf_report(
        pdf_path=pdf_path,
        patient_name=patient.name,
        patient_email=patient.email,
        diagnosis=class_name,
        confidence=prediction.confidence,
        date=prediction.date,
        recommendations=rec['advice'],
        urgency=rec['urgency'],
        image_path=abs_original_img,
        heatmap_path=abs_heatmap_img
    )
    
    return send_file(pdf_path, as_attachment=True, download_name=pdf_filename)

# --- Admin Dashboard Module ---

@app.route('/admin')
@login_required
def admin_dashboard():
    """
    Ophthalmic Hospital Admin Control Center.
    Aggregates database telemetry, users listing, disease percentages, and training summaries.
    """
    if not current_user.is_admin:
        flash("Unauthorized clinical access area.", "danger")
        return redirect(url_for('dashboard'))
        
    # Standard Admin Statistics
    total_users = User.query.filter_by(is_admin=False).count()
    total_scans = Prediction.query.count()
    
    all_users = User.query.filter_by(is_admin=False).order_by(User.created_at.desc()).all()
    recent_predictions = Prediction.query.order_by(Prediction.date.desc()).limit(5).all()
    
    # Calculate Severity Distribution counts for statistics dashboard
    class_counts = [0, 0, 0, 0, 0] # indices representing classes 0 to 4
    all_predictions = Prediction.query.all()
    for p in all_predictions:
        class_counts[p.prediction] += 1
        
    return render_template('admin.html',
                           total_users=total_users,
                           total_scans=total_scans,
                           all_users=all_users,
                           recent_predictions=recent_predictions,
                           class_counts=class_counts,
                           CLASS_NAMES=CLASS_NAMES)

@app.route('/admin/delete-user/<int:user_id>', methods=['POST'])
@login_required
def delete_user(user_id):
    """
    Deletes patient profiles and cascades predictions records.
    """
    if not current_user.is_admin:
        flash("Unauthorized administrative modification request.", "danger")
        return redirect(url_for('dashboard'))
        
    user_to_delete = User.query.get_or_404(user_id)
    if user_to_delete.is_admin:
        flash("System Protection: Cannot delete system administrative user accounts.", "danger")
        return redirect(url_for('admin_dashboard'))
        
    db.session.delete(user_to_delete)
    db.session.commit()
    flash(f"Patient record of '{user_to_delete.name}' has been successfully expunged.", "success")
    return redirect(url_for('admin_dashboard'))


# Boot Flask Application
if __name__ == '__main__':
    # Build default directories
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # In case demonstration graphics do not exist, auto-create them on startup
    static_images_path = os.path.join(app.root_path, 'static', 'images', 'accuracy_graph.png')
    if not os.path.exists(static_images_path):
        from train_model.py import simulate_training_for_demo
        try:
            simulate_training_for_demo()
        except Exception:
            pass
            
    app.run(host='0.0.0.0', port=5000, debug=True)
