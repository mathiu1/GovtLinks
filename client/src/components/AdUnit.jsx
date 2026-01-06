import React, { useEffect } from 'react';

const AdUnit = ({ slot, format = 'auto', layoutKey, style = {}, className = '', testLabel = 'Ad Space' }) => {
    useEffect(() => {
        try {
            // Check if the ad is already populated to prevent double-push in StrictMode
            const ads = document.getElementsByClassName("adsbygoogle");
            // Simple check: just push needed, AdSense handles idempotency usually, but sometimes errors.
            // We use a timeout to let UI settle.
            const timeout = setTimeout(() => {
                if (window.adsbygoogle) {
                    window.adsbygoogle.push({});
                }
            }, 100);
            return () => clearTimeout(timeout);
        } catch (e) {
            console.error("AdSense error", e);
        }
    }, [slot]); // Depend on slot to re-push if slot changes (unlikely)

    // Check if we are on localhost to enable test mode
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // Placeholder for development so the user sees where ads will be
    const isDev = import.meta.env.MODE === 'development';

    return (
        <div className={`relative overflow-hidden bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[250px] ${className}`} style={style}>
            {/* Visual Placeholder for localhost if ad doesn't load immediately */}
            {isLocalhost && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none z-0">
                    <span className="text-4xl font-bold opacity-20">AD</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest mt-2">{testLabel}</span>
                </div>
            )}

            {/* Google AdSense Code */}
            <ins className="adsbygoogle z-10"
                style={{ display: 'block', width: '100%', ...style }}
                data-ad-client="ca-pub-4862539424411687"
                data-ad-slot={slot || "6557280774"}
                data-ad-format={format}
                data-full-width-responsive="true"
                data-ad-layout-key={layoutKey}
                data-adtest={isLocalhost ? "on" : "off"}
            ></ins>
        </div>
    );
};

export default AdUnit;
