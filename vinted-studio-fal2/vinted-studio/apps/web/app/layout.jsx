import './globals.css';
import Shell from '../components/Shell';

export const metadata = { title: 'Vinted Studio' };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" /></head>
      <body><Shell>{children}</Shell></body>
    </html>
  );
}
