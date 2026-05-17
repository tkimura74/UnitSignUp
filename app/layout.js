import "./globals.css";

export const metadata = {
  title: "Resident Interior Service Signup",
  description: "Resident signup form for interior unit pest control treatment."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
