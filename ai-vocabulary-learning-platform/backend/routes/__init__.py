from .auth_routes import auth_bp
from .language_routes import language_bp
from routes.level_routes import level_bp


from .lesson_routes import lesson_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(language_bp)
    app.register_blueprint(level_bp)
    app.register_blueprint(lesson_bp)
