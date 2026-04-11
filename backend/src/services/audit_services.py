from src.models.auditoriamodel import AuditoriaModel as Auditoria
import ast
import json
import re

IGNORED_COLUMNS = {'created_at', 'updated_at'}


def _normalize_scalar(value):
    """Normaliza valores simples para comparar sin ruido."""
    if isinstance(value, str):
        return value.strip()

    return value


def _normalize_structure(value):
    """Normaliza dict/list y excluye columnas no relevantes para auditoria."""
    if isinstance(value, dict):
        return {
            k: _normalize_structure(v)
            for k, v in value.items()
            if k not in IGNORED_COLUMNS
        }

    if isinstance(value, list):
        return [_normalize_structure(v) for v in value]

    return _normalize_scalar(value)


def _normalize_payload(value):
    """Convierte el payload a una forma comparable (dict/list/str)."""

    if value is None:
        return {}

    if isinstance(value, (dict, list)):
        return _normalize_structure(value)

    if isinstance(value, str):
        raw = value.strip()
        if raw.lower() in ('', 'none', 'null'):
            return {}

        # Algunos controladores serializan datetime.datetime(...) como string.
        raw = re.sub(r"datetime\.datetime\([^)]*\)", "'__datetime__'", raw)

        try:
            return _normalize_structure(json.loads(raw))
        except Exception:
            pass

        try:
            parsed = ast.literal_eval(raw)
            if isinstance(parsed, (dict, list, str, int, float, bool)):
                return _normalize_structure(parsed)
        except Exception:
            pass

        return _normalize_scalar(raw)

    return _normalize_scalar(value)


def _resolve_changed_columns(old_payload, new_payload):
    """Determina col_editada con la regla NEW/SAME/lista de columnas."""
    old_norm = _normalize_payload(old_payload)
    new_norm = _normalize_payload(new_payload)

    old_empty = old_norm in ({}, [], '', None)
    new_empty = new_norm in ({}, [], '', None)

    if old_empty and not new_empty:
        return 'NEW'

    if old_norm == new_norm:
        return 'SAME'

    if isinstance(old_norm, dict) and isinstance(new_norm, dict):
        keys = sorted(set(old_norm.keys()) | set(new_norm.keys()))
        changed = [key for key in keys if old_norm.get(
            key) != new_norm.get(key)]
        return ', '.join(changed) if changed else 'SAME'

    return 'CHANGED'


def register_audit_action(
    usuario_id,
    ip_address,
    tabla,
    accion,
    valor_old,
    valor_new,
    col_editada=None,
):
    """
    Registra un evento de auditoria en la base de datos.

    Parametros:
        usuario_id (int): ID del usuario que ejecuta la accion.
        ip_address (str): Direccion IP origen de la solicitud.
        tabla (str): Nombre de la tabla o recurso auditado.
        accion (int): Codigo de accion.
            - 1: CREATE
            - 2: UPDATE
            - 3: DELETE
            - 4: CHANGE_STATUS
        valor_old (dict | list | None): Estado previo del registro.
        valor_new (dict | list | None): Estado nuevo del registro.
        col_editada (str | None): Si se omite, se calcula automaticamente
            comparando valor_old y valor_new (NEW, SAME o lista de columnas).

    Retorna:
        AuditoriaModel: Instancia de auditoria persistida.
    """

    safe_col_editada = (
        col_editada if col_editada is not None else _resolve_changed_columns(
            valor_old, valor_new)
    )
    safe_valor_old = valor_old if valor_old is not None else {}
    safe_valor_new = valor_new if valor_new is not None else {}

    auditoria = Auditoria(
        usuario_id=usuario_id,
        ip_address=ip_address,
        tabla=tabla,
        accion=accion,
        valor_old=safe_valor_old,
        valor_new=safe_valor_new,
        col_editada=safe_col_editada,
    )

    auditoria.save()

    return auditoria
