import styled from 'astroturf';
import React from 'react';

const StarsContainer = styled.div`
    display: flex;
    align-items: center;

    > * + * {
        margin-left: 4px;
    }
`;

const AdjustButton = styled.button`
    width: 24px;
    height: 24px;
    border: 1px solid black;
    background-color: white;
    color: black;
`;

const StarList = styled.span`
`;

interface Props {
    value: number;
    max: number;
    onChange?(value: number): void;
}

export default function Stars(props: Props) {
    const { value, max, onChange } = props;
    const handleDecrease = React.useCallback(() => {
        if (onChange == null) {
            return;
        }
        if (value <= 0) {
            return;
        }
        onChange(value - 1);
    }, [value, max, onChange]);
    const handleIncrease = React.useCallback(() => {
        if (onChange == null) {
            return;
        }
        if (value >= max) {
            return;
        }
        onChange(value + 1);
    }, [value, max, onChange]);

    return (
        <StarsContainer>
            <AdjustButton type="button" onClick={handleDecrease}>-</AdjustButton>
            <StarList>{'★'.repeat(value)}{'☆'.repeat(max - value)}</StarList>
            <AdjustButton type="button" onClick={handleIncrease}>+</AdjustButton>
        </StarsContainer>
    );
}
