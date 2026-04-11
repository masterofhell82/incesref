from app import app
from datetime import datetime

from src.models.usuariomodel import UsuarioModel as Users
from src.models.rolmodel import RolModel as Roles

def set_specific_role(user, role_id):

    pass

    """ print(
        f"Cambiando el rol del usuario {user.username} (ID: {user.id}) con rol ID: {role_id}")
    # Solo procesamos si el rol es de Instructor (3)
    if role_id == 3:
        instructor = Instructor.query.filter_by(
            id_persona=user.id_persona).first()
        if not instructor:
            Instructor(
                id_persona=user.id_persona,
                activo=True
            ).save()
        elif instructor and not instructor.activo:
            instructor.update({'activo': True})
        elif instructor and instructor.activo:
            instructor.update({'activo': False})
        return

    # Solo procesamos roles de Gerente de Linea (5) y Gerente General (8)
    rectores = (
        Users.query
        .with_entities(
            Rector.id_persona,
            Users.id,
            UserRole.role_id
        )
        .join(Rector, Rector.id_persona == Users.id_persona)
        .join(UserRole, Users.id == UserRole.user_id)
        .filter(Rector.active.is_(True))
        .all()
    )

    if role_id == 8:  # Gerente General

        rector = Rector.query.filter_by(id_persona=user.id_persona).first()

        if not rector:
            has_active_rector = any(row.role_id == 8 for row in rectores)
            rector = Rector(
                id_persona=user.id_persona,
                active=not has_active_rector
            )
            rector.save()
            return False if has_active_rector else True
        elif rector and not rector.active:
            rector.update({'active': True})
            return True
        elif rector and rector.active:
            rector.update({'active': False})
            return False

    if role_id == 5:  # Gerente de Instrucción
        rector = Rector.query.filter_by(id_persona=user.id_persona).first()
        if not rector:
            has_active_rector = any(row.role_id == 5 for row in rectores)
            rector = Rector(
                id_persona=user.id_persona,
                active=not has_active_rector
            )
            rector.save()
        elif rector and not rector.active:
            rector.update({'active': True})
            return True
        elif rector and rector.active:
            rector.update({'active': False})
            return False

        # Retorna False si ya había un rector activo, True si se activó uno nuevo
        return False if has_active_rector else True

    # Para roles que no requieren lógica específica, retornamos True por defecto
    return True
 """
