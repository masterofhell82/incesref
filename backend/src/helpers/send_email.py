from app import app
from flask_mail import Mail, Message

mail = Mail(app)

def send_email(subject, recipients, body=None, html=None, attachments=None):
    """
    Envía un correo electrónico a múltiples destinatarios.

    :param subject: Asunto del correo electrónico.
    :param recipients: Lista de direcciones de correo electrónico de los destinatarios.
    :param body: Cuerpo del correo electrónico en texto plano.
    :param html: (Opcional) Cuerpo del correo electrónico en formato HTML.
    :param attachments: (Opcional) Lista de archivos adjuntos. Cada archivo debe ser un diccionario con las claves 'filename' y 'data'.
    """

    msg = Message(
        subject,
        sender=app.config['MAIL_USERNAME'],
        recipients=recipients
    )

    msg.body = body

    if html:
        msg.html = html

    # Adjuntar archivos si se proporcionan
    if attachments:
        for attachment in attachments:
            msg.attach(
                attachment['filename'],
                attachment.get('content_type', 'application/octet-stream'),
                attachment['data']
            )

    try:
        mail.send(msg)
        return {"message": 'Email sent successful!'}
    except Exception as e:
        print(f"Failed to send mail: {str(e)}")
        return f"Failed to send mail: {str(e)}"


def reset_password(email, token):
    """
    Envía un correo electrónico al usuario que ha solicitado restablecer su contraseña.
    """

    subject = 'Restablecer contraseña'

    recipients = [email]

    html = f'''
        <html>
        <body>
            <p>Estimado/a {recipients[0]},</p>
            <p>Hemos recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Red de Pago</strong>.</p>
            <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje.</p>
            <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
            <p><a href="https://reddepago.com/reset-password?token={token}">Restablecer contraseña</a></p>
            <p>El equipo de Red de Pago</p>
        </body>
        </html>
        '''

    send_email(subject, recipients, html=html)


def recharge_confirmation(data):
    """
    Envía un correo electrónico al usuario con la confirmación de la recarga realizada.
    """

    subject = 'Recarga exitosa'

    recipients = [data['email']]

    html = f'''
        <html>
        <body>
            <p>Estimado/a {recipients[0]},</p>
            <p>¡Tu recarga ha sido exitosa!</p>
            <p>Detalles de la recarga:</p>
            <p>Operadora: {data['operadora']}</p>
            <p>Número de producto: {data['numero_producto']}</p>
            <p>Monto: {data['monto']}</p>
            <p>Código de aprobación: {data['codigo_aprobacion']}</p>
            <p>Código de respuesta: {data['codigo_respuesta']}</p>
            <p>Número de transacción: {data['numeroTransaccion']}</p>
            <p>Fecha y hora de vencimiento: {data['fechaHoraVencimiento']}</p>
            <p>El equipo de Red de Pago</p>
        </body>
        </html>
        '''

    send_email(subject, recipients, html=html)


def recharge_failure(data):
    """
    Envía un correo electrónico al usuario con la notificación de la recarga fallida.
    """

    subject = 'Recarga fallida'

    recipients = [data['email']]

    html = f'''
        <html>
        <body>
            <p>Estimado/a {recipients[0]},</p>
            <p>Lo sentimos, tu recarga ha fallado.</p>
            <p>Detalles de la recarga:</p>
            <p>Operadora: {data['operadora']}</p>
            <p>Número de producto: {data['numero_producto']}</p>
            <p>Monto: {data['monto']}</p>
            <p>Código de aprobación: {data['codigo_aprobacion']}</p>
            <p>Código de respuesta: {data['codigo_respuesta']}</p>
            <p>Mensaje: {data['mensaje']}</p>
            <p>El equipo de Red de Pago</p>
        </body>
        </html>
        '''

    send_email(subject, recipients, html=html)


def Purchase_gifts_cards(data):
    """
    Envía un correo electrónico al usuario con la notificación de la recarga fallida.
    """

    subject = 'Compra de Gift Cards'

    recipients = [data['email']]

    html = f'''
        <html>
        <body>
            <p>Estimado/a {recipients[0]},</p>

            <p>Te confirmamos que tu pedido de gift cards de {data['type_card']}, por un valor de {data['gift_value']}, ha sido procesado exitosamente.</p>

            <p> Si elegiste la opción de entrega por correo electrónico, recibirás un correo separado con los códigos de las gift cards en las próximas horas.</p>

            <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos </p>

            <p>¡Disfruta de tus gift cards! </p>

            <p>Atentamente, </p>

            <p>El equipo de Red de Pago</p>
        </body>
        </html>
        '''

    send_email(subject, recipients, html=html)
