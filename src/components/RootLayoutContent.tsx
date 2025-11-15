"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsletterPopup from "@/components/NewsletterPopup";
import { useState, useEffect } from 'react';

interface RootLayoutContentProps {
  children: React.ReactNode;
}

export default function RootLayoutContent({ children }: RootLayoutContentProps) {
  const [showNewsletter, setShowNewsletter] = useState(false);

  useEffect(() => {
    const newsletterStatus = typeof window !== 'undefined' ? localStorage.getItem('newsletterPopupStatus') : null;
    if (newsletterStatus !== 'closed' && newsletterStatus !== 'submitted') {
      setShowNewsletter(true);
    }
  }, []);

  const handleCloseNewsletter = () => {
    setShowNewsletter(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('newsletterPopupStatus', 'closed');
    }
  };

  const handleOpenNewsletter = () => {
    setShowNewsletter(true);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="0xjerrys-lab-theme">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer onOpenNewsletter={handleOpenNewsletter} />
      {showNewsletter && (
        <NewsletterPopup onClose={handleCloseNewsletter} />
      )}
    </ThemeProvider>
  );
}
