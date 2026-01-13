import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - SuburbMates',
  description: 'Join the Melbourne creator directory.',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
