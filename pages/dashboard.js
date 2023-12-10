
import { usePrivate } from "@/hooks/usePrivate";

import DashboardMain from "@/components/DashboardMain"
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Dashboard() {
    const router = useRouter();
    const [session, status] = usePrivate();
  
    useEffect(() => {
      if (status === 'unauthenticated') {
        router.push('/'); // Redirect to the home page if unauthenticated
      }
    }, [status, router]);

  return (
    <>
        <Header />
        <DashboardMain /> 
        <Footer /> 
    </>

  );
}