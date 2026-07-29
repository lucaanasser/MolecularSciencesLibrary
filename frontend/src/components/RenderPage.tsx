import React from "react";
import Header from "@/components/navigation/Header";
import Footer from "@/components/Footer";


export function RenderPage(Component, options: { hideFooter?: boolean } = {}) {
    const { hideFooter = false } = options;

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
            {!hideFooter && <Footer />}
            </>
        );
    }

    return <SiteLayout><Component /></SiteLayout>;
}