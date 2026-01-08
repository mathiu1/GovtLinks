import React, { useEffect, useState } from 'react';

// --- CUSTOM AD CONFIGURATION ---
// Paste your Adsterra / Monetag / Other Ad Network Script below between the backticks.
// Make sure to include the full HTML/Script provided by the network.
const CUSTOM_AD_CODE = `
<!-- Adsterra 300x250 Banner Code -->
<script type="text/javascript">
	atOptions = {
		'key' : '791494071ca2b42117aef2768c07fbc5',
		'format' : 'iframe',
		'height' : 250,
		'width' : 300,
		'params' : {}
	};
</script>
<script type="text/javascript" src="https://www.highperformanceformat.com/791494071ca2b42117aef2768c07fbc5/invoke.js"></script>
`;
// -------------------------------

const AdUnit = ({ slot, format = 'auto', layoutKey, style = {}, className = '', testLabel = 'Ad Space' }) => {
    // Check environment
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // Disable ads completely on localhost
    if (isLocalhost) return null;

    const isRender = window.location.hostname.includes('onrender.com');

    // Use Custom Ad logic for Render (Subdomains)
    const useCustomAds = isRender;

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
