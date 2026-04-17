from app import app
from datetime import datetime


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
    value = str(value)
    return '{:,}'.format(int(value)).replace(',', '.')

def format_date(value):
    if isinstance(value, str):
        date_obj = datetime.strptime(value, '%Y-%m-%d')
    else:
        date_obj = value  # ya es datetime o date
    return date_obj.strftime('%d/%m/%Y')


def format_date_long_es(value):
    if isinstance(value, str):
        date_obj = datetime.strptime(value, '%Y-%m-%d')
    else:
        date_obj = value

    month_name = MONTHS_ES[date_obj.month]
    return f'{date_obj.day} de {month_name} del {date_obj.year}'


app.jinja_env.filters['format_cedula'] = format_cedula
app.jinja_env.filters['format_date'] = format_date
app.jinja_env.filters['format_date_long_es'] = format_date_long_es
