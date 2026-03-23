from app import app
from datetime import datetime

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


app.jinja_env.filters['format_cedula'] = format_cedula
app.jinja_env.filters['format_date'] = format_date
