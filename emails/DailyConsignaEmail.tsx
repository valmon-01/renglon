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

interface DailyConsignaEmailProps {
  consigna: string;
  textoMotivacional: string;
  fecha: string; // DD/MM/YY
  unsubscribeUrl: string;
}

export default function DailyConsignaEmail({
  consigna,
  textoMotivacional,
  fecha,
  unsubscribeUrl,
}: DailyConsignaEmailProps) {
  const asunto = consigna.length > 60 ? consigna.slice(0, 57) + '…' : consigna;

  return (
    <Html lang="es">
      <Head />
      <Preview>renglón — {asunto}</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Logo + fecha */}
          <Section style={logoSection}>
            <Text style={logo}>renglón</Text>
            <Text style={fechaText}>{fecha}</Text>
          </Section>

          <Hr style={hr} />

          {/* Consigna */}
          <Section style={section}>
            <Text style={consignaLabel}>La consigna de hoy</Text>
            <Text style={consignaText}>{consigna}</Text>
          </Section>

          {/* Texto motivacional */}
          {textoMotivacional && (
            <Section style={section}>
              <Text style={motivacionalText}>{textoMotivacional}</Text>
            </Section>
          )}

          {/* CTA */}
          <Section style={ctaSection}>
            <Button href="https://renglon.vercel.app/home" style={button}>
              Escribir
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Footer con desuscripción */}
          <Section style={footerSection}>
            <Text style={footerText}>
              ¿No querés recibir más estos mails?{' '}
              <Link href={unsubscribeUrl} style={unsubscribeLink}>
                Desuscribirme
              </Link>
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
  marginBottom: '4px',
};

const logo: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: '28px',
  color: '#64313E',
  margin: '0 0 4px',
  fontWeight: 400,
};

const fechaText: React.CSSProperties = {
  fontFamily: 'Inter, -apple-system, sans-serif',
  fontSize: '12px',
  color: '#5C5147',
  letterSpacing: '0.08em',
  margin: 0,
};

const hr: React.CSSProperties = {
  borderColor: '#D6CFBF',
  borderTopWidth: '1px',
  margin: '24px 0',
};

const section: React.CSSProperties = {
  margin: '24px 0',
};

const consignaLabel: React.CSSProperties = {
  fontFamily: 'Inter, -apple-system, sans-serif',
  fontSize: '10px',
  letterSpacing: '0.12em',
  color: '#5C5147',
  textTransform: 'uppercase',
  margin: '0 0 12px',
};

const consignaText: React.CSSProperties = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic',
  fontSize: '24px',
  lineHeight: '1.5',
  color: '#1C1917',
  margin: 0,
};

const motivacionalText: React.CSSProperties = {
  fontFamily: 'Inter, -apple-system, sans-serif',
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#5C5147',
  margin: 0,
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center',
  margin: '32px 0',
};

const button: React.CSSProperties = {
  backgroundColor: '#64313E',
  color: '#FDFAF5',
  borderRadius: '6px',
  padding: '14px 48px',
  fontSize: '14px',
  fontFamily: 'Inter, -apple-system, sans-serif',
  fontWeight: 500,
  textDecoration: 'none',
  display: 'inline-block',
};

const footerSection: React.CSSProperties = {
  textAlign: 'center',
};

const footerText: React.CSSProperties = {
  fontFamily: 'Inter, -apple-system, sans-serif',
  fontSize: '13px',
  color: '#5C5147',
  margin: 0,
};

const unsubscribeLink: React.CSSProperties = {
  color: '#5C5147',
  textDecoration: 'underline',
};
