from datetime import datetime


DATE_INPUT_FORMATS = ('%d/%m/%Y', '%Y-%m-%d')


def parse_date(value, field_name):
    if not value:
        raise ValueError(f'{field_name} es requerida')

    for fmt in DATE_INPUT_FORMATS:
        try:
            return datetime.strptime(value, fmt).date()
        except Exception:
            continue

    raise ValueError(f'Formato de {field_name} no valido. Use DD/MM/YYYY o YYYY-MM-DD')
