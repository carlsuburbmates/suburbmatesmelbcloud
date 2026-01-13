'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import { ReportModal } from '@/components/directory/ReportModal';

interface ReportButtonProps {
    listingId: string;
    listingName: string;
    variant?: 'ghost' | 'outline' | 'default';
    className?: string;
    showLabel?: boolean;
}

export function ReportButton({ 
    listingId, 
    listingName, 
    variant = 'ghost', 
    className,
    showLabel = false
}: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {isOpen && (
                <ReportModal 
                    listingId={listingId} 
                    listingName={listingName} 
                    onClose={() => setIsOpen(false)} 
                />
            )}
            <Button
                variant={variant}
                size={showLabel ? 'default' : 'icon'}
                title="Report Concern"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className={className}
            >
                <Flag className="h-4 w-4" />
                {showLabel && <span className="ml-2">Report Concern</span>}
            </Button>
        </>
    );
}
