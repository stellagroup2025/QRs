'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function VersionUpdater() {
    const [isVisible, setIsVisible] = useState(false);

    // The version of the app when it was loaded by the browser (from build time env)
    // If NEXT_PUBLIC_APP_VERSION is undefined (e.g. dev), we default to a value.
    const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION;

    useEffect(() => {
        // Don't poll in development to avoid annoyance, unless testing
        if (process.env.NODE_ENV === 'development') return;

        const checkVersion = async () => {
            try {
                // Add timestamp to prevent caching
                const res = await fetch(`/api/system/version?t=${new Date().getTime()}`);
                if (res.ok) {
                    const data = await res.json();
                    const serverVersion = data.version;

                    // If server version differs from our loaded version, show update
                    if (serverVersion && currentVersion && serverVersion !== currentVersion) {
                        setIsVisible(true);
                    }
                }
            } catch (error) {
                console.error('Failed to check version', error);
            }
        };

        // Check every 60 seconds
        const interval = setInterval(checkVersion, 60 * 1000);
        return () => clearInterval(interval);
    }, [currentVersion]);

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 right-4 z-[9999] max-w-sm w-full"
                >
                    <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-lg shadow-2xl flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                            <div className="bg-slate-800 p-2 rounded-full">
                                <RefreshCw className="h-4 w-4 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm">Nueva versión disponible</h4>
                                <p className="text-xs text-slate-400 mt-1">
                                    Hay una actualización de la aplicación. Refresca para ver los cambios.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 text-xs"
                                onClick={() => setIsVisible(false)}
                            >
                                Ahora no
                            </Button>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                                onClick={handleRefresh}
                            >
                                Actualizar
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
