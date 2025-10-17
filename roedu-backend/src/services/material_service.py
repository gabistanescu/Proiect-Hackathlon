from sqlalchemy.orm import Session
from models.material import Material
from schemas.material_schema import MaterialCreate, MaterialUpdate

class MaterialService:
    def __init__(self, db: Session):
        self.db = db

    def create_material(self, material: MaterialCreate):
        db_material = Material(**material.dict())
        self.db.add(db_material)
        self.db.commit()
        self.db.refresh(db_material)
        return db_material

    def get_material(self, material_id: int):
        return self.db.query(Material).filter(Material.id == material_id).first()

    def update_material(self, material_id: int, material: MaterialUpdate):
        db_material = self.get_material(material_id)
        if db_material:
            for key, value in material.dict(exclude_unset=True).items():
                setattr(db_material, key, value)
            self.db.commit()
            self.db.refresh(db_material)
            return db_material
        return None

    def delete_material(self, material_id: int):
        db_material = self.get_material(material_id)
        if db_material:
            self.db.delete(db_material)
            self.db.commit()
            return db_material
        return None

    def get_all_materials(self):
        return self.db.query(Material).all()