from flask import request

from src.models.usuariorolmodel import UsuarioRolModel as UserRole

from src.services.audit_services import register_audit_action


def set_specific_role(user, role_id, estado_id):

    try:
        userRole = UserRole.query.filter_by(user_id=user.id).first()

        if not userRole:

            new_user_role = UserRole(
                user_id=user.id,
                rol_id=role_id,
                estado_id=estado_id
            )

            new_user_role.save()

            register_audit_action(
                usuario_id=user.id,
                ip_address=request.remote_addr,
                tabla='usuario_rol',
                accion=1,  # Acción de creación
                valor_old={},
                valor_new=new_user_role.serialize(),
            )

            return True
        elif userRole and userRole.rol_id != role_id:
            old_values = userRole.serialize()
            userRole.update({
                'rol_id': role_id,
                'estado_id': estado_id
            })
            register_audit_action(
                usuario_id=user.id,
                ip_address=request.remote_addr,
                tabla='usuario_rol',
                accion=2,  # Acción de actualización
                valor_old=old_values,
                valor_new=userRole.serialize(),
            )
            return True
        else:
            return True  # No se necesita cambiar el rol, pero la función se considera exitosa
    except Exception as e:
        print(f"Error al asignar rol específico: {e}")
        return False
