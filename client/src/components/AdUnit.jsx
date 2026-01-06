import React, { useEffect, useState } from 'react';

// --- CUSTOM AD CONFIGURATION ---
// Paste your Adsterra / Monetag / Other Ad Network Script below between the backticks.
// Make sure to include the full HTML/Script provided by the network.
const CUSTOM_AD_CODE = `
<!-- PLACEHOLDER: Professional Ad Placeholder -->
<div style="width:100%; height:100%; min-height:250px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); color:#64748b; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align:center; padding:20px; box-sizing:border-box; border-radius:16px; position:relative; overflow:hidden;">
    
    <!-- Sponsored Badge -->
    <div style="position:absolute; top:10px; right:10px; background:#e2e8f0; color:#94a3b8; font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:0.5px;">Sponsored</div>
    
    <!-- Icon/Graphic -->
    <div style="width:48px; height:48px; margin-bottom:12px; opacity:0.2;">
        <svg viewBox="0 0 24 24" fill="currentColor" style="width:100%; height:100%;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
    </div>

    <!-- Main Text -->
    <p style="margin:0; font-weight:600; font-size:14px; color:#475569;">Demo Advertisement</p>
    <p style="margin:4px 0 0 0; font-size:12px; opacity:0.6;">Content will appear here shortly</p>
</div>
`;
// -------------------------------

const AdUnit = ({ slot, format = 'auto', layoutKey, style = {}, className = '', testLabel = 'Ad Space' }) => {
    // Check environment
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isRender = window.location.hostname.includes('onrender.com');

    // Use Custom Ad logic for Render (Subdomains) or Localhost testing
    const useCustomAds = isRender || isLocalhost;

    useEffect(() => {
        if (!useCustomAds) {
            try {
                // Google AdSense Push
                const timeout = setTimeout(() => {
                    if (window.adsbygoogle) {
                        window.adsbygoogle.push({});
                    }
                }, 100);
                return () => clearTimeout(timeout);
            } catch (e) {
                console.error("AdSense error", e);
            }
        }
    }, [slot, useCustomAds]);

    if (useCustomAds) {
        return (
            <div className={`relative overflow-hidden bg-transparent rounded-2xl flex flex-col items-center justify-center ${className}`} style={{ ...style, minHeight: style.minHeight || '250px' }}>
                <iframe
                    title={testLabel}
                    srcDoc={`
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                            <style>body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; background: transparent; }</style>
                        </head>
                        <body>
                            ${CUSTOM_AD_CODE}
                        </body>
                        </html>
                    `}
                    style={{ width: '100%', height: '100%', border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                />
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[250px] ${className}`} style={style}>
            {/* Google AdSense Code */}
            <ins className="adsbygoogle z-10"
                style={{ display: 'block', width: '100%', ...style }}
                data-ad-client="ca-pub-4862539424411687"
                data-ad-slot={slot || "6557280774"}
                data-ad-format={format}
                data-full-width-responsive="true"
                data-ad-layout-key={layoutKey}
                data-ad-test="off"
            ></ins>
        </div>
    );
};

export default AdUnit;
