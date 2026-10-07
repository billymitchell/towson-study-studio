import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';
import { ProgressProvider } from '@/components/ProgressProvider';
import { OfflineSupport } from '@/components/OfflineSupport';
import './globals.css';
export const metadata:Metadata={title:'Study Studio · AIT 624',description:'Source-linked software engineering midterm preparation for AIT 624 / COSC 612.'};
export default function RootLayout({children}:{children:ReactNode}) {return <html lang="en"><body><ProgressProvider><OfflineSupport/><AppShell>{children}</AppShell></ProgressProvider></body></html>;}
