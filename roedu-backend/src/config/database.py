from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from src.config.settings import settings
from src.config.seed_data import seed_initial_data

# Create engine with appropriate settings
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency for getting database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Initialize database tables
    Drops existing tables and recreates them to ensure schema is current
    """
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("Creating tables with current schema...")
    Base.metadata.create_all(bind=engine)
    
    print("Seeding initial data...")
    session = SessionLocal()
    try:
        seed_initial_data(session)
    finally:
        session.close()
    
    print("✅ Database initialization complete!")
