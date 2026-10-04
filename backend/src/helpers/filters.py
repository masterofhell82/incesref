from datetime import datetime, timezone

from app import app

MONTHS_ES = {
    1: 'Enero',
    2: 'Febrero',
    3: 'Marzo',
    4: 'Abril',
    5: 'Mayo',
    6: 'Junio',
    7: 'Julio',
    8: 'Agosto',
    9: 'Septiembre',
    10: 'Octubre',
    11: 'Noviembre',
    12: 'Diciembre',
}

# filters
def format_cedula(value):
    if value is None:
        return ''

    value = str(value).strip()
    if not value:
        return ''

    if value.isdigit():
        return f"{int(value):,}".replace(',', '.')

    return value


def format_rif(value):
    """Formatea el RIF insertando un guion después de la primera letra

    Ejemplo: 'J401429572' -> 'J-401429572'
    Mantiene el comportamiento previo para None y cadenas vacías.
    """
    if value is None:
        return ''

    text = str(value).strip()
    if not text:
        return ''

    # Si es una letra seguida solo de dígitos, insertar guion: 'J123' -> 'J-123'
    import re

    m = re.match(r'^([A-Za-z])(\d+)$', text)
    if m:
        return f"{m.group(1)}-{m.group(2)}"

    return text

def format_date(value):
    if isinstance(value, str):
        date_obj = datetime.strptime(value, '%Y-%m-%d').replace(
            tzinfo=timezone.utc
        )
    else:
        date_obj = value  # ya es datetime o date
    return date_obj.strftime('%d/%m/%Y')


def format_date_long_es(value):
    if isinstance(value, str):
        date_obj = datetime.strptime(value, '%Y-%m-%d').replace(
            tzinfo=timezone.utc
        )
    else:
        date_obj = value

    month_name = MONTHS_ES[date_obj.month]
    return f'{date_obj.day} de {month_name} del {date_obj.year}'


def first_word(value):
    if value is None:
        return ''

    text = str(value).strip()
    if not text:
        return ''

    return text.split()[0]


app.jinja_env.filters['format_cedula'] = format_cedula
app.jinja_env.filters['format_date'] = format_date
app.jinja_env.filters['format_date_long_es'] = format_date_long_es
app.jinja_env.filters['first_word'] = first_word
app.jinja_env.filters['format_rif'] = format_rif
