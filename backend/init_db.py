from database import Base, engine
import models  # Importa los modelos para registrar las tablas

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")
