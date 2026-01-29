import React from "react";
import Header from "./Header";
import Footer from "./Footer";


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
