import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';

export interface BackButtonProps {
    onClick?: () => void;
    children?: React.ReactNode;
}

/**
 * A simple back button component that uses the browser's history to navigate back when clicked.
 * @param props
 * @param props.onClick Optional click handler. If not provided, it defaults to navigating back in the browser history.
 * @param props.children The content to display inside the button, typically a label like "Back".
 */
export function BackButton ({onClick = () => window.history.back(), children}: Readonly<BackButtonProps>) {
    return (
        <Button variant="ghost" size="sm" onClick={onClick} className="-ml-2">
            <ArrowLeft className="mr-1.5 size-4" />
            {children}
        </Button>
    )
}