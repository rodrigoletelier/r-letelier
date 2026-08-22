module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, email, company, message } = req.body || {};
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Faltan campos requeridos' });
    return;
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Formulario rodrigoletelier.cl <formulario@mail.rodrigoletelier.cl>',
        to: ['hola@rodrigoletelier.cl'],
        reply_to: email,
        subject: `Nuevo contacto de ${name}${company ? ' - ' + company : ''}`,
        text: `Nombre: ${name}\nEmail: ${email}\nEmpresa: ${company || '-'}\n\nMensaje:\n${message}`,
      }),
    });

    if (!r.ok) {
      res.status(502).json({ error: 'No se pudo enviar el correo' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error interno' });
  }
};
