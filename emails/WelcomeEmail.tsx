import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Link,
  Hr,
  Preview,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  username: string;
}

export default function WelcomeEmail({ username }: WelcomeEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Bienvenido/a a renglón — el hábito de escribir, un renglón a la vez.</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logo}>renglón</Text>
          </Section>

          {/* Saludo y explicación */}
          <Section style={section}>
            <Text style={greeting}>Hola @{username},</Text>
            <Text style={text}>
              Cada día hay una consigna nueva. Escribís lo que quieras — puede ser largo o corto.
              Tu escrito es privado por defecto, y si querés, lo hacés público para leer lo que escribieron otros.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Agregar al celular */}
          <Section style={section}>
            <Text style={sectionTitle}>Agregá renglón a tu celular</Text>
            <Text style={text}>
              <strong>En iPhone:</strong> abrí{' '}
              <Link href="https://renglon.vercel.app" style={link}>renglon.vercel.app</Link>{' '}
              en Safari → tocá el ícono de compartir → &ldquo;Agregar a pantalla de inicio&rdquo;.
            </Text>
            <Text style={text}>
              <strong>En Android:</strong> abrí{' '}
              <Link href="https://renglon.vercel.app" style={link}>renglon.vercel.app</Link>{' '}
              en Chrome → menú (tres puntos) → &ldquo;Agregar a pantalla de inicio&rdquo;.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Button href="https://renglon.vercel.app/home" style={button}>
              Empezar a escribir
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              Vas a recibir la consigna del día todas las mañanas. Si en algún momento querés dejar
              de recibirlos, podés desuscribirte desde cualquier mail.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ─── Estilos ────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#F5F0E8',
  fontFamily: 'Inter, -apple-system, sans-serif',
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 24px 48px',
};

const logoSection: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '8px',
};

const logo: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: '32px',
  color: '#64313E',
  margin: 0,
  fontWeight: 400,
};

const section: React.CSSProperties = {
  margin: '24px 0',
};

const greeting: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: '20px',
  color: '#1C1917',
  margin: '0 0 16px',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: '17px',
  color: '#64313E',
  margin: '0 0 12px',
};

const text: React.CSSProperties = {
  fontFamily: 'Inter, -apple-system, sans-serif',
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#1C1917',
  margin: '0 0 12px',
};

const link: React.CSSProperties = {
  color: '#64313E',
  textDecoration: 'underline',
};

const hr: React.CSSProperties = {
  borderColor: '#D6CFBF',
  borderTopWidth: '1px',
  margin: '24px 0',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '32px 0',
};

const button: React.CSSProperties = {
  backgroundColor: '#64313E',
  color: '#FDFAF5',
  borderRadius: '6px',
  padding: '14px 40px',
  fontSize: '14px',
  fontFamily: 'Inter, -apple-system, sans-serif',
  fontWeight: 500,
  textDecoration: 'none',
  display: 'inline-block',
};

const footerSection: React.CSSProperties = {
  borderTop: '1px solid #D6CFBF',
  paddingTop: '24px',
  marginTop: '8px',
};

const footerText: React.CSSProperties = {
  fontFamily: 'Inter, -apple-system, sans-serif',
  fontSize: '13px',
  lineHeight: '1.6',
  color: '#5C5147',
  margin: 0,
};
