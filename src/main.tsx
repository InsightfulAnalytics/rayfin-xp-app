//-----------------------------------------------------------------------
// <copyright company="Markus Lehtola">
//        Copyright (c) Markus Lehtola.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from "react-error-boundary";

import App from './App.tsx';
import { ErrorFallback } from './ErrorFallback';
import { useAppTheme } from './hooks/use-theme';
import { ThemeContext } from './hooks/theme.context';

import "./global.css"

// NOTE: The XP experience runs standalone with demo data, so it is NOT wrapped
// in the rayfin <AuthProvider>/<AuthGate> (bootstrapAuth requires Fabric env
// vars only present inside the deployed portal embed). When wiring real
// Power BI semantic-model queries via useSemanticModelQuery, re-introduce
// bootstrapAuth + <AuthProvider> + <AuthGate> from ./hooks/use-auth and
// ./components/auth-gate.component so the app authenticates against Fabric.
function Root() {
    const { isDark, toggleTheme } = useAppTheme();

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <App />
            </ErrorBoundary>
        </ThemeContext.Provider>
    );
}

createRoot(document.getElementById('root')!).render(<Root />)
