import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aktuális ajánlatok | Dent-Art-Technik',
  description: 'Egyedi fogtechnikai megoldások digitális tervezéssel, korszerű gyártástechnológiával és több évtizedes tapasztalattal.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="hu"><body>{children}</body></html>;
}
