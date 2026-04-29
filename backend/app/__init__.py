"""
PETRA - Flask Application Factory
Creates and configures the Flask app with all extensions and blueprints.
"""
import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

# Initialize extensions (shared across modules)
db = SQLAlchemy()
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

migrate = Migrate()
jwt = JWTManager()


def create_app(config_name=None):
    """
    Application factory pattern.
    Creates a fully configured Flask application instance.
    """
    app = Flask(__name__)

    # Load configuration
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    from app.config import config_map
    app.config.from_object(config_map.get(config_name, config_map['development']))

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Register blueprints (routes)
    from app.routes.petition_routes import petition_bp
    from app.routes.user_routes import user_bp
    from app.routes.dashboard_routes import dashboard_bp
    from app.routes.auth_routes import auth_bp

    app.register_blueprint(petition_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')

    # Create database tables (Disabled in favor of Migrate)
    # with app.app_context():
    #     from app.models import user, petition, status_log  # noqa: F401
    #     db.create_all()

    # Root welcome route
    @app.route('/')
    def index():
        return '''
        <!DOCTYPE html>
        <html>
        <head>
            <title>PETRA API</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
                .container { text-align: center; max-width: 600px; padding: 2rem; }
                h1 { font-size: 2.5rem; margin-bottom: 0.5rem; background: linear-gradient(135deg, #3384ff, #d946ef); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                p { color: #94a3b8; margin-bottom: 2rem; }
                .status { display: inline-flex; align-items: center; gap: 8px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; color: #10b981; margin-bottom: 2rem; }
                .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                .endpoints { text-align: left; background: rgba(30,41,59,0.6); border: 1px solid rgba(51,132,255,0.15); border-radius: 12px; padding: 1.5rem; }
                .endpoints h3 { font-size: 0.9rem; color: #3384ff; margin-bottom: 1rem; }
                .endpoint { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(51,132,255,0.08); font-size: 0.85rem; }
                .endpoint:last-child { border-bottom: none; }
                .method { font-weight: 700; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; min-width: 50px; text-align: center; }
                .get { background: rgba(16,185,129,0.15); color: #10b981; }
                .post { background: rgba(59,130,246,0.15); color: #3b82f6; }
                .put { background: rgba(245,158,11,0.15); color: #f59e0b; }
                .delete { background: rgba(239,68,68,0.15); color: #ef4444; }
                .path { color: #e2e8f0; font-family: monospace; }
                .desc { color: #64748b; margin-left: auto; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>PETRA API</h1>
                <p>Cloud-Based Petition Management & Monitoring System</p>
                <div class="status"><span class="dot"></span> Server Running</div>
                <div class="endpoints">
                    <h3>API Endpoints</h3>
                    <div class="endpoint"><span class="method post">POST</span><span class="path">/api/petitions</span><span class="desc">Create</span></div>
                    <div class="endpoint"><span class="method get">GET</span><span class="path">/api/petitions</span><span class="desc">List all</span></div>
                    <div class="endpoint"><span class="method get">GET</span><span class="path">/api/petitions/&lt;id&gt;</span><span class="desc">Get one</span></div>
                    <div class="endpoint"><span class="method put">PUT</span><span class="path">/api/petitions/&lt;id&gt;/status</span><span class="desc">Update status</span></div>
                    <div class="endpoint"><span class="method delete">DELETE</span><span class="path">/api/petitions/&lt;id&gt;</span><span class="desc">Delete</span></div>
                    <div class="endpoint"><span class="method get">GET</span><span class="path">/api/dashboard/stats</span><span class="desc">Statistics</span></div>
                    <div class="endpoint"><span class="method get">GET</span><span class="path">/api/dashboard/status-distribution</span><span class="desc">Status chart</span></div>
                    <div class="endpoint"><span class="method get">GET</span><span class="path">/api/dashboard/priority-distribution</span><span class="desc">Priority chart</span></div>
                    <div class="endpoint"><span class="method get">GET</span><span class="path">/api/health</span><span class="desc">Health check</span></div>
                </div>
            </div>
        </body>
        </html>
        ''', 200, {'Content-Type': 'text/html'}

    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'service': 'PETRA API'}, 200

    return app
