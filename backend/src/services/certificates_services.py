import csv
from datetime import date
import io


PHONE_PREFIXES_WITH_LEADING_ZERO = {'422', '424', '426', '412', '414', '416'}
LOWERCASE_CONNECTORS = {'de', 'del', 'la', 'las', 'los'}

EXPECTED_CERTIFICATES_CSV_HEADERS = [
	'PREIMPRESO',
	'MAESTRA',
	'CONSECUTIVO',
	'NACIONALIDAD',
	'CEDULA',
	'NOMBRES',
	'APELLIDOS',
	'TELEFONO',
	'CORREO',
	'NACIMIENTO',
	'GENERO',
	'CODIGO ASOCIADO',
]

def _normalize_consecutivo(value):
	consecutivo = (value or '').strip()
	if consecutivo.isdigit():
		return consecutivo.zfill(7)
	return consecutivo


def _normalize_telefono(value):
	telefono = (value or '').strip()
	if not telefono:
		return telefono

	if telefono.startswith('0') and len(telefono) == 11:
		return telefono

	if len(telefono) == 10 and telefono[:3] in PHONE_PREFIXES_WITH_LEADING_ZERO:
		return f'0{telefono}'

	return telefono


def _capitalize_token(token):
	if not token:
		return token
	return f"{token[:1].upper()}{token[1:].lower()}"


def _normalize_full_name(value):
	clean_value = ' '.join((value or '').strip().split())
	if not clean_value:
		return clean_value

	parts = clean_value.split(' ')
	result = []
	i = 0
	while i < len(parts):
		lower_token = parts[i].lower()

		if i + 1 < len(parts) and lower_token == 'de' and parts[i + 1].lower() == 'los':
			result.append('de')
			result.append('los')
			i += 2
			continue

		if lower_token in LOWERCASE_CONNECTORS and i != 0:
			result.append(lower_token)
		else:
			result.append(_capitalize_token(parts[i]))

		i += 1

	return ' '.join(result)


def _normalize_nacimiento(value):
	nacimiento = (value or '').strip()
	if not nacimiento:
		raise ValueError('NACIMIENTO es requerida')

	if '/' in nacimiento:
		try:
			day_str, month_str, year_str = nacimiento.split('/')
			return date(int(year_str), int(month_str), int(day_str)).isoformat()
		except ValueError:
			pass

	if '-' in nacimiento:
		try:
			return date.fromisoformat(nacimiento).isoformat()
		except ValueError:
			pass

	raise ValueError('Formato de NACIMIENTO no valido. Use DD/MM/YYYY o YYYY-MM-DD')


def parse_massive_certificates_csv(file_storage):
	file_storage.stream.seek(0)
	decoded_stream = io.TextIOWrapper(file_storage.stream, encoding='utf-8-sig', newline='')
	csv_reader = csv.DictReader(decoded_stream)

	if not csv_reader.fieldnames:
		return {
			'ok': False,
			'status': 400,
			'error': 'El archivo CSV no contiene encabezados.',
		}

	normalized_headers = [header.strip().upper() for header in csv_reader.fieldnames]
	if normalized_headers != EXPECTED_CERTIFICATES_CSV_HEADERS:
		return {
			'ok': False,
			'status': 400,
			'error': 'El encabezado del CSV no coincide con el formato esperado.',
			'expected': EXPECTED_CERTIFICATES_CSV_HEADERS,
			'received': normalized_headers,
		}

	parsed_rows = []
	for row_number, row in enumerate(csv_reader, start=2):
		if not any((value or '').strip() for value in row.values()):
			continue

		nacimiento_raw = (row.get('NACIMIENTO') or '').strip()
		try:
			nacimiento_iso = _normalize_nacimiento(nacimiento_raw)
		except ValueError as exc:
			return {
				'ok': False,
				'status': 400,
				'error': str(exc),
				'row': row_number,
				'field': 'NACIMIENTO',
				'value': nacimiento_raw,
			}

		parsed_rows.append({
			'row': row_number,
			'preimpreso': (row.get('PREIMPRESO') or '').strip(),
			'maestra': (row.get('MAESTRA') or '').strip(),
			'consecutivo': _normalize_consecutivo(row.get('CONSECUTIVO')),
			'nacionalidad': (row.get('NACIONALIDAD') or '').strip(),
			'cedula': (row.get('CEDULA') or '').strip(),
			'nombres': _normalize_full_name(row.get('NOMBRES')),
			'apellidos': _normalize_full_name(row.get('APELLIDOS')),
			'telefono': _normalize_telefono(row.get('TELEFONO')),
			'correo': (row.get('CORREO') or '').strip(),
			'nacimiento': nacimiento_iso,
			'genero': (row.get('GENERO') or '').strip(),
			'codigo_asociado': (row.get('CODIGO ASOCIADO') or '').strip(),
		})

	return {
		'ok': True,
		'status': 200,
		'headers': normalized_headers,
		'rows': parsed_rows,
	}
