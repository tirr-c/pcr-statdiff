import styled from 'astroturf';
import React from 'react';

import { observer } from 'mobx-react';

import { PromotionLevel } from './common-types';
import { EquipmentItem } from './state';

import Stars from './Stars';

const Container = styled.li`
    display: flex;
    align-items: center;
    list-style: none;

    > img {
        width: 64px;
        height: 64px;
    }
`;

const EquipmentDetail = styled.div`
    margin-left: 8px;
`;

const EquipmentName = styled.div`
    font-size: 0.9em;
`;

interface Props {
    equipment: EquipmentItem;
}

export default observer(function EquipmentItemView(props: Props) {
    const { equipment } = props;
    return (
        <Container>
            <img
                key={equipment.iconKey}
                src={equipment.iconUrl}
                onClick={equipment.toggleEquipped}
            />
            <EquipmentDetail>
                <EquipmentName>{equipment.name}</EquipmentName>
                {equipment.maxEnhanceLevel > 0 && (
                    <Stars
                        value={equipment.enhanceLevel}
                        max={equipment.maxEnhanceLevel}
                        onChange={equipment.updateEnhanceLevel}
                    />
                )}
            </EquipmentDetail>
        </Container>
    );
});
