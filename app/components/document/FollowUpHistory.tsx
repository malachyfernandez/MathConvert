import React from 'react';
import Column from '../layout/Column';
import PoppinsText from '../ui/text/PoppinsText';
import { MathDocumentPage } from 'types/mathDocuments';

interface FollowUpHistoryProps {
    followUps: MathDocumentPage['followUps'];
}

const FollowUpHistory = ({ followUps }: FollowUpHistoryProps) => {
    if (followUps.length === 0) {
        return null;
    }

    return (
        <Column gap={2}>
            <PoppinsText weight='medium'>Previous follow-ups</PoppinsText>
            {followUps.slice().reverse().map((followUp) => (
                <Column key={followUp.id} className='rounded-xl border border-subtle-border bg-background p-3' gap={1}>
                    <PoppinsText>{followUp.prompt}</PoppinsText>
                    <PoppinsText varient='subtext'>
                        {new Date(followUp.createdAt).toLocaleString()}
                    </PoppinsText>
                </Column>
            ))}
        </Column>
    );
};

export default FollowUpHistory;
