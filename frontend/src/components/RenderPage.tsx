import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";


export function RenderPage(Component) {
    
    type SiteLayoutProps = {
        children: React.ReactNode;
    };

    function SiteLayout({ children }: SiteLayoutProps) {
        return (
            <>
            <Header />
            <main className="page-layout">
                {children}
            </main>
            <Footer />
            </>
        );
    }

    return <SiteLayout><Component /></SiteLayout>;
}
