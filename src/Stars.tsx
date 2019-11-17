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
    width: 36px;
    height: 36px;
    border: 1px solid black;
    line-height: 34px;
    text-align: center;
    background-color: white;
    color: black;
`;

const StarList = styled.span`
    margin: 0 8px;
`;

interface Props {
    value: number;
    max: number;
    disabled?: boolean;
    onChange?(value: number): void;
}

export default function Stars(props: Props) {
    const { value, max, disabled, onChange } = props;
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
            <AdjustButton type="button" disabled={disabled} onClick={handleDecrease}>-</AdjustButton>
            <StarList>{'★'.repeat(value)}{'☆'.repeat(max - value)}</StarList>
            <AdjustButton type="button" disabled={disabled} onClick={handleIncrease}>+</AdjustButton>
        </StarsContainer>
    );
}
