import './globals.css';
import { WalletProvider } from '@/components/wallet-provider';

export const metadata = {
  title: 'Monster Draw Battle',
  description: 'Draw monsters, mint NFTs, battle on Solana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
